/**
 * Comprehensive Application Monitoring System
 * Tracks performance, errors, user interactions, and system health
 */

import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { log } from './logger';
import { offlineManager } from './offlineManager';
import { backendHealthMonitor } from './api';

// Types
export interface MonitoringConfig {
  sentryDsn?: string;
  enablePerformanceMonitoring: boolean;
  enableUserTracking: boolean;
  enableCrashReporting: boolean;
  sampleRate: number;
  maxBreadcrumbs: number;
  environment: 'development' | 'staging' | 'production';
}

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface ErrorReport {
  error: Error;
  context: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  metadata?: Record<string, any>;
}

export interface UserAction {
  action: string;
  screen: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface SystemHealth {
  networkStatus: 'online' | 'offline' | 'poor';
  backendStatus: 'healthy' | 'degraded' | 'down';
  storageAvailable: boolean;
  memoryPressure: 'low' | 'medium' | 'high';
  batteryLevel?: number;
  pendingSyncActions: number;
}

class ApplicationMonitoring {
  private static instance: ApplicationMonitoring;
  private config: MonitoringConfig;
  private sentry: any = null;
  private performanceMetrics: PerformanceMetric[] = [];
  private userActions: UserAction[] = [];
  private errorCount = 0;
  private sessionStartTime: number;
  private maxMetricsInMemory = 100;

  private constructor() {
    this.sessionStartTime = Date.now();
    this.config = {
      enablePerformanceMonitoring: true,
      enableUserTracking: true,
      enableCrashReporting: true,
      sampleRate: 1.0,
      maxBreadcrumbs: 50,
      environment: __DEV__ ? 'development' : 'production',
    };
  }

  static getInstance(): ApplicationMonitoring {
    if (!ApplicationMonitoring.instance) {
      ApplicationMonitoring.instance = new ApplicationMonitoring();
    }
    return ApplicationMonitoring.instance;
  }

  /**
   * Initialize monitoring system
   */
  async initialize(config?: Partial<MonitoringConfig>): Promise<void> {
    this.config = { ...this.config, ...config };

    // Initialize Sentry if DSN provided
    if (this.config.sentryDsn && this.config.enableCrashReporting) {
      await this.initializeSentry();
    }

    // Set up error handlers
    this.setupErrorHandlers();

    // Start health monitoring
    this.startHealthMonitoring();

    log.info('Monitoring system initialized', {
      environment: this.config.environment,
      sentryEnabled: !!this.sentry,
      performanceTracking: this.config.enablePerformanceMonitoring,
    });
  }

  /**
   * Initialize Sentry error tracking
   */
  private async initializeSentry(): Promise<void> {
    try {
      // Lazy import to avoid crashes if not installed
      const Sentry = require('@sentry/react-native');

      Sentry.init({
        dsn: this.config.sentryDsn,
        environment: this.config.environment,
        enableAutoSessionTracking: true,
        sessionTrackingIntervalMillis: 30000,
        maxBreadcrumbs: this.config.maxBreadcrumbs,
        tracesSampleRate: this.config.sampleRate,
        
        // Performance monitoring
        enableNative: true,
        enableNativeFramesTracking: Platform.OS !== 'web',
        
        // Filter out sensitive data
        beforeSend: (event: any) => {
          // Remove sensitive user data
          if (event.user) {
            delete event.user.email;
            delete event.user.username;
          }
          
          // Don't send development errors
          if (this.config.environment === 'development') {
            return null;
          }
          
          return event;
        },

        integrations: [
          new Sentry.ReactNativeTracing({
            routingInstrumentation: new Sentry.ReactNavigationInstrumentation(),
          }),
        ],
      });

      // Set device context
      Sentry.setContext('device', {
        brand: Device.brand,
        modelName: Device.modelName,
        osName: Device.osName,
        osVersion: Device.osVersion,
        platform: Platform.OS,
        platformVersion: Platform.Version,
      });

      // Set app context
      Sentry.setContext('app', {
        version: Constants.expoConfig?.version || 'unknown',
        buildNumber: Constants.expoConfig?.ios?.buildNumber || 
                     Constants.expoConfig?.android?.versionCode || 'unknown',
        expoVersion: Constants.expoConfig?.sdkVersion || 'unknown',
      });

      this.sentry = Sentry;
      log.info('Sentry initialized successfully');
    } catch (error) {
      log.warn('Failed to initialize Sentry', error as Error);
      this.sentry = null;
    }
  }

  /**
   * Set up global error handlers
   */
  private setupErrorHandlers(): void {
    // Global error handler
    const originalErrorHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      this.captureError({
        error,
        context: 'Global Error Handler',
        severity: isFatal ? 'critical' : 'high',
      });
      
      // Call original handler
      if (originalErrorHandler) {
        originalErrorHandler(error, isFatal);
      }
    });

    // Unhandled promise rejections
    if (typeof Promise !== 'undefined') {
      const originalRejectionHandler = Promise.prototype.catch;
      Promise.prototype.catch = function (onRejected) {
        return originalRejectionHandler.call(
          this,
          (reason: any) => {
            ApplicationMonitoring.getInstance().captureError({
              error: reason instanceof Error ? reason : new Error(String(reason)),
              context: 'Unhandled Promise Rejection',
              severity: 'high',
            });
            
            if (onRejected) {
              return onRejected(reason);
            }
            throw reason;
          }
        );
      };
    }
  }

  /**
   * Start monitoring system health
   */
  private startHealthMonitoring(): void {
    // Check health every 30 seconds
    setInterval(() => {
      const health = this.getSystemHealth();
      
      // Log critical health issues
      if (health.backendStatus === 'down') {
        log.warn('Backend service is down');
      }
      
      if (health.memoryPressure === 'high') {
        log.warn('High memory pressure detected');
        this.clearOldMetrics();
      }
      
      if (health.pendingSyncActions > 50) {
        log.warn('High number of pending sync actions', {
          count: health.pendingSyncActions,
        });
      }
    }, 30000);
  }

  /**
   * Capture and report an error
   */
  captureError(report: ErrorReport): void {
    const { error, context, severity, userId, metadata } = report;
    
    this.errorCount++;

    // Log locally
    log.error(`[${severity.toUpperCase()}] ${context}`, error, metadata);

    // Send to Sentry
    if (this.sentry) {
      this.sentry.withScope((scope: any) => {
        scope.setLevel(severity);
        scope.setContext('error_context', { context, ...metadata });
        
        if (userId) {
          scope.setUser({ id: userId });
        }
        
        // Add breadcrumbs
        scope.addBreadcrumb({
          category: 'error',
          message: context,
          level: severity,
          data: metadata,
        });

        this.sentry.captureException(error);
      });
    }

    // Queue for offline sync if needed
    if (offlineManager.isOffline()) {
      offlineManager.queueAction('ERROR_REPORT', {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        context,
        severity,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Track performance metric
   */
  trackPerformance(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    if (!this.config.enablePerformanceMonitoring) return;

    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now(),
    };

    this.performanceMetrics.push(fullMetric);
    
    // Keep only recent metrics
    if (this.performanceMetrics.length > this.maxMetricsInMemory) {
      this.performanceMetrics.shift();
    }

    log.debug(`Performance: ${metric.name} took ${metric.duration}ms`, metric.metadata);

    // Send to Sentry
    if (this.sentry) {
      this.sentry.addBreadcrumb({
        category: 'performance',
        message: metric.name,
        data: {
          duration: metric.duration,
          ...metric.metadata,
        },
      });
    }

    // Alert on slow operations
    if (metric.duration > 3000) {
      log.warn('Slow operation detected', {
        name: metric.name,
        duration: metric.duration,
      });
    }
  }

  /**
   * Track user action
   */
  trackUserAction(action: Omit<UserAction, 'timestamp'>): void {
    if (!this.config.enableUserTracking) return;

    const fullAction: UserAction = {
      ...action,
      timestamp: Date.now(),
    };

    this.userActions.push(fullAction);

    // Keep only recent actions
    if (this.userActions.length > this.maxMetricsInMemory) {
      this.userActions.shift();
    }

    log.debug(`User action: ${action.action} on ${action.screen}`, action.metadata);

    // Send to Sentry as breadcrumb
    if (this.sentry) {
      this.sentry.addBreadcrumb({
        category: 'user_action',
        message: `${action.action} on ${action.screen}`,
        data: action.metadata,
      });
    }
  }

  /**
   * Start performance timer
   */
  startPerformanceTimer(name: string): () => void {
    const startTime = Date.now();
    
    return (metadata?: Record<string, any>) => {
      const duration = Date.now() - startTime;
      this.trackPerformance({ name, duration, metadata });
    };
  }

  /**
   * Get system health status
   */
  getSystemHealth(): SystemHealth {
    const networkState = offlineManager.getNetworkState();
    const networkQuality = offlineManager.getNetworkQuality();
    const backendStatus = backendHealthMonitor.getHealthStatus();
    const pendingSyncActions = offlineManager.getPendingActionsCount();

    return {
      networkStatus: networkQuality === 'offline' ? 'offline' : 
                    networkQuality === 'poor' ? 'poor' : 'online',
      backendStatus,
      storageAvailable: true, // Could add actual check
      memoryPressure: this.calculateMemoryPressure(),
      pendingSyncActions,
    };
  }

  /**
   * Calculate memory pressure
   */
  private calculateMemoryPressure(): 'low' | 'medium' | 'high' {
    const metricsCount = this.performanceMetrics.length + this.userActions.length;
    
    if (metricsCount > 150) return 'high';
    if (metricsCount > 80) return 'medium';
    return 'low';
  }

  /**
   * Clear old metrics to free memory
   */
  private clearOldMetrics(): void {
    const keepCount = Math.floor(this.maxMetricsInMemory / 2);
    
    this.performanceMetrics = this.performanceMetrics.slice(-keepCount);
    this.userActions = this.userActions.slice(-keepCount);
    
    log.info('Cleared old metrics', {
      performanceMetricsKept: this.performanceMetrics.length,
      userActionsKept: this.userActions.length,
    });
  }

  /**
   * Get monitoring statistics
   */
  getStatistics() {
    const sessionDuration = Date.now() - this.sessionStartTime;
    const health = this.getSystemHealth();

    return {
      session: {
        duration: sessionDuration,
        startTime: this.sessionStartTime,
      },
      errors: {
        total: this.errorCount,
        rate: this.errorCount / (sessionDuration / 60000), // per minute
      },
      performance: {
        metricsTracked: this.performanceMetrics.length,
        avgDuration: this.performanceMetrics.length > 0
          ? this.performanceMetrics.reduce((sum, m) => sum + m.duration, 0) / 
            this.performanceMetrics.length
          : 0,
      },
      userActions: {
        total: this.userActions.length,
        rate: this.userActions.length / (sessionDuration / 60000), // per minute
      },
      health,
    };
  }

  /**
   * Set user context for error tracking
   */
  setUser(userId: string, metadata?: Record<string, any>): void {
    if (this.sentry) {
      this.sentry.setUser({
        id: userId,
        ...metadata,
      });
    }
    
    log.debug('User context set', { userId });
  }

  /**
   * Clear user context
   */
  clearUser(): void {
    if (this.sentry) {
      this.sentry.setUser(null);
    }
    
    log.debug('User context cleared');
  }

  /**
   * Add custom breadcrumb
   */
  addBreadcrumb(
    message: string,
    category: string,
    data?: Record<string, any>
  ): void {
    if (this.sentry) {
      this.sentry.addBreadcrumb({
        message,
        category,
        data,
        timestamp: Date.now(),
      });
    }
    
    log.debug(`Breadcrumb: [${category}] ${message}`, data);
  }

  /**
   * Force flush all pending data
   */
  async flush(): Promise<void> {
    if (this.sentry) {
      await this.sentry.flush(2000);
    }
    
    log.info('Monitoring data flushed');
  }

  /**
   * Get Sentry instance (for advanced usage)
   */
  getSentry(): any {
    return this.sentry;
  }
}

// Export singleton instance
export const monitoring = ApplicationMonitoring.getInstance();

// Helper HOC for tracking component renders
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
): React.ComponentType<P> {
  return (props: P) => {
    const endTimer = monitoring.startPerformanceTimer(`render_${componentName}`);
    
    React.useEffect(() => {
      endTimer();
    }, []);

    return React.createElement(Component, props);
  };
}

// Helper hook for tracking screen views
export function useScreenTracking(screenName: string): void {
  React.useEffect(() => {
    monitoring.trackUserAction({
      action: 'screen_view',
      screen: screenName,
    });

    if (monitoring.getSentry()) {
      monitoring.getSentry().addBreadcrumb({
        category: 'navigation',
        message: `Navigated to ${screenName}`,
        level: 'info',
      });
    }
  }, [screenName]);
}

export default monitoring;

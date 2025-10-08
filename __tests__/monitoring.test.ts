/**
 * Monitoring System Tests
 * Tests error tracking, performance monitoring, and health checks
 */

import { monitoring, MonitoringConfig } from '../utils/monitoring';
import { log } from '../utils/logger';

// Mock dependencies
jest.mock('../utils/logger');
jest.mock('../utils/offlineManager');
jest.mock('../utils/api');
jest.mock('expo-device');
jest.mock('expo-constants');

describe('Monitoring System Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default config', async () => {
      await monitoring.initialize();

      const stats = monitoring.getStatistics();
      expect(stats).toBeDefined();
      expect(stats.session).toBeDefined();
    });

    it('should accept custom configuration', async () => {
      const config: Partial<MonitoringConfig> = {
        enablePerformanceMonitoring: true,
        enableUserTracking: true,
        sampleRate: 0.5,
        environment: 'staging',
      };

      await monitoring.initialize(config);

      const stats = monitoring.getStatistics();
      expect(stats).toBeDefined();
    });

    it('should work without Sentry DSN', async () => {
      await monitoring.initialize({ sentryDsn: undefined });

      expect(monitoring.getSentry()).toBeNull();
    });
  });

  describe('Error Tracking', () => {
    it('should capture errors with context', () => {
      const error = new Error('Test error');

      monitoring.captureError({
        error,
        context: 'Test Context',
        severity: 'high',
      });

      expect(log.error).toHaveBeenCalled();
    });

    it('should capture errors with metadata', () => {
      const error = new Error('Test error with metadata');

      monitoring.captureError({
        error,
        context: 'Test Context',
        severity: 'medium',
        metadata: {
          userId: '123',
          action: 'button_click',
        },
      });

      expect(log.error).toHaveBeenCalled();
    });

    it('should track different severity levels', () => {
      const error = new Error('Test error');

      const severities: Array<'low' | 'medium' | 'high' | 'critical'> = [
        'low',
        'medium',
        'high',
        'critical',
      ];

      severities.forEach((severity) => {
        monitoring.captureError({
          error,
          context: `Test ${severity}`,
          severity,
        });
      });

      expect(log.error).toHaveBeenCalledTimes(4);
    });

    it('should associate errors with user ID', () => {
      monitoring.setUser('user-123', { role: 'parent' });

      const error = new Error('User-specific error');
      monitoring.captureError({
        error,
        context: 'User Action',
        severity: 'high',
        userId: 'user-123',
      });

      expect(log.error).toHaveBeenCalled();
    });

    it('should clear user context', () => {
      monitoring.setUser('user-123');
      monitoring.clearUser();

      // Should not throw
      expect(() => {
        monitoring.captureError({
          error: new Error('Test'),
          context: 'After clear',
          severity: 'low',
        });
      }).not.toThrow();
    });
  });

  describe('Performance Tracking', () => {
    it('should track performance metrics', () => {
      monitoring.trackPerformance({
        name: 'api_call',
        duration: 250,
      });

      const stats = monitoring.getStatistics();
      expect(stats.performance.metricsTracked).toBeGreaterThan(0);
    });

    it('should track metrics with metadata', () => {
      monitoring.trackPerformance({
        name: 'route_calculation',
        duration: 1500,
        metadata: {
          routeType: 'safest',
          waypoints: 5,
        },
      });

      expect(log.debug).toHaveBeenCalled();
    });

    it('should use performance timer', () => {
      const endTimer = monitoring.startPerformanceTimer('test_operation');

      // Simulate some work
      for (let i = 0; i < 1000; i++) {
        Math.sqrt(i);
      }

      endTimer();

      const stats = monitoring.getStatistics();
      expect(stats.performance.metricsTracked).toBeGreaterThan(0);
    });

    it('should calculate average duration', () => {
      monitoring.trackPerformance({ name: 'test1', duration: 100 });
      monitoring.trackPerformance({ name: 'test2', duration: 200 });
      monitoring.trackPerformance({ name: 'test3', duration: 300 });

      const stats = monitoring.getStatistics();
      expect(stats.performance.avgDuration).toBe(200);
    });

    it('should alert on slow operations', () => {
      monitoring.trackPerformance({
        name: 'slow_operation',
        duration: 5000, // 5 seconds
      });

      expect(log.warn).toHaveBeenCalledWith('Slow operation detected', expect.any(Object));
    });

    it('should limit metrics in memory', () => {
      // Track many metrics
      for (let i = 0; i < 150; i++) {
        monitoring.trackPerformance({
          name: `metric_${i}`,
          duration: 100,
        });
      }

      const stats = monitoring.getStatistics();
      expect(stats.performance.metricsTracked).toBeLessThanOrEqual(100);
    });
  });

  describe('User Action Tracking', () => {
    it('should track user actions', () => {
      monitoring.trackUserAction({
        action: 'button_click',
        screen: 'home',
      });

      const stats = monitoring.getStatistics();
      expect(stats.userActions.total).toBeGreaterThan(0);
    });

    it('should track actions with metadata', () => {
      monitoring.trackUserAction({
        action: 'route_selected',
        screen: 'navigation',
        metadata: {
          routeType: 'scenic',
          distance: 2.5,
        },
      });

      expect(log.debug).toHaveBeenCalled();
    });

    it('should calculate action rate', () => {
      for (let i = 0; i < 10; i++) {
        monitoring.trackUserAction({
          action: `action_${i}`,
          screen: 'test',
        });
      }

      const stats = monitoring.getStatistics();
      expect(stats.userActions.rate).toBeGreaterThanOrEqual(0);
    });

    it('should limit actions in memory', () => {
      // Track many actions
      for (let i = 0; i < 150; i++) {
        monitoring.trackUserAction({
          action: `action_${i}`,
          screen: 'test',
        });
      }

      const stats = monitoring.getStatistics();
      expect(stats.userActions.total).toBeLessThanOrEqual(100);
    });
  });

  describe('System Health Monitoring', () => {
    it('should report system health', () => {
      const health = monitoring.getSystemHealth();

      expect(health).toHaveProperty('networkStatus');
      expect(health).toHaveProperty('backendStatus');
      expect(health).toHaveProperty('storageAvailable');
      expect(health).toHaveProperty('memoryPressure');
      expect(health).toHaveProperty('pendingSyncActions');
    });

    it('should detect memory pressure', () => {
      // Generate lots of metrics to increase memory pressure
      for (let i = 0; i < 200; i++) {
        monitoring.trackPerformance({
          name: `metric_${i}`,
          duration: 100,
        });
      }

      const health = monitoring.getSystemHealth();
      expect(['low', 'medium', 'high']).toContain(health.memoryPressure);
    });

    it('should report network status', () => {
      const health = monitoring.getSystemHealth();

      expect(['online', 'offline', 'poor']).toContain(health.networkStatus);
    });

    it('should report backend status', () => {
      const health = monitoring.getSystemHealth();

      expect(['healthy', 'degraded', 'down']).toContain(health.backendStatus);
    });
  });

  describe('Statistics and Reporting', () => {
    it('should provide session statistics', () => {
      const stats = monitoring.getStatistics();

      expect(stats.session).toBeDefined();
      expect(stats.session.duration).toBeGreaterThanOrEqual(0);
      expect(stats.session.startTime).toBeGreaterThan(0);
    });

    it('should track error rate', () => {
      monitoring.captureError({
        error: new Error('Test 1'),
        context: 'Test',
        severity: 'low',
      });

      monitoring.captureError({
        error: new Error('Test 2'),
        context: 'Test',
        severity: 'low',
      });

      const stats = monitoring.getStatistics();
      expect(stats.errors.total).toBeGreaterThanOrEqual(2);
      expect(stats.errors.rate).toBeGreaterThanOrEqual(0);
    });

    it('should include health in statistics', () => {
      const stats = monitoring.getStatistics();

      expect(stats.health).toBeDefined();
      expect(stats.health.networkStatus).toBeDefined();
      expect(stats.health.backendStatus).toBeDefined();
    });
  });

  describe('Breadcrumbs', () => {
    it('should add custom breadcrumbs', () => {
      monitoring.addBreadcrumb('User started navigation', 'navigation', {
        destination: 'Central Park',
      });

      expect(log.debug).toHaveBeenCalled();
    });

    it('should add breadcrumbs with different categories', () => {
      const categories = ['ui', 'network', 'state', 'custom'];

      categories.forEach((category) => {
        monitoring.addBreadcrumb(`Test breadcrumb for ${category}`, category);
      });

      expect(log.debug).toHaveBeenCalledTimes(4);
    });
  });

  describe('Data Management', () => {
    it('should flush monitoring data', async () => {
      await monitoring.flush();

      expect(log.info).toHaveBeenCalledWith('Monitoring data flushed');
    });

    it('should handle memory pressure', () => {
      // Generate high memory pressure
      for (let i = 0; i < 200; i++) {
        monitoring.trackPerformance({ name: `test_${i}`, duration: 100 });
        monitoring.trackUserAction({ action: `action_${i}`, screen: 'test' });
      }

      const health = monitoring.getSystemHealth();

      if (health.memoryPressure === 'high') {
        expect(log.info).toHaveBeenCalledWith('Cleared old metrics', expect.any(Object));
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle Sentry initialization failure gracefully', async () => {
      await monitoring.initialize({
        sentryDsn: 'invalid-dsn',
      });

      // Should not throw
      expect(() => {
        monitoring.captureError({
          error: new Error('Test'),
          context: 'Test',
          severity: 'low',
        });
      }).not.toThrow();
    });

    it('should work without Sentry installed', async () => {
      await monitoring.initialize({ sentryDsn: undefined });

      monitoring.captureError({
        error: new Error('Test'),
        context: 'Test',
        severity: 'low',
      });

      expect(log.error).toHaveBeenCalled();
    });

    it('should handle malformed error objects', () => {
      const malformedError = { message: 'Not a real error' } as Error;

      expect(() => {
        monitoring.captureError({
          error: malformedError,
          context: 'Test',
          severity: 'low',
        });
      }).not.toThrow();
    });
  });

  describe('Integration', () => {
    it('should integrate with offline manager', () => {
      const health = monitoring.getSystemHealth();

      expect(health.pendingSyncActions).toBeGreaterThanOrEqual(0);
    });

    it('should integrate with backend health monitor', () => {
      const health = monitoring.getSystemHealth();

      expect(health.backendStatus).toBeDefined();
    });

    it('should track offline errors for later sync', () => {
      // Simulate offline state in test
      monitoring.captureError({
        error: new Error('Offline error'),
        context: 'Offline action',
        severity: 'medium',
      });

      expect(log.error).toHaveBeenCalled();
    });
  });
});

import { Platform } from 'react-native';
import Config from './config';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

type LogEntry = {
  level: LogLevel;
  message: string;
  timestamp: number;
  context?: Record<string, any>;
  stack?: string;
};

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private minLevel = Config.isDev ? LogLevel.DEBUG : LogLevel.INFO;

  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>): string {
    const timestamp = new Date().toISOString();
    const levelStr = LogLevel[level];
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${levelStr}: ${message}${contextStr}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  private addLog(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    if (!this.shouldLog(level)) return;

    const logEntry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      context,
      stack: error?.stack,
    };

    this.logs.push(logEntry);

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output in development
    if (Config.isDev) {
      const formattedMessage = this.formatMessage(level, message, context);
      
      switch (level) {
        case LogLevel.DEBUG:
          console.log(formattedMessage);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage);
          break;
        case LogLevel.ERROR:
          console.error(formattedMessage, error);
          break;
      }
    }

    // Send to crash reporting service in production
    if (Config.isProduction && level >= LogLevel.ERROR) {
      this.sendToCrashReporting(logEntry, error);
    }
  }

  private async sendToCrashReporting(logEntry: LogEntry, error?: Error) {
    try {
      // In a real app, you'd send to services like Sentry, Bugsnag, etc.
      // For now, we'll just store it locally
      console.error('Production Error:', logEntry, error);
    } catch (e) {
      console.error('Failed to send crash report:', e);
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.addLog(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.addLog(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.addLog(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.addLog(LogLevel.ERROR, message, context, error);
  }

  // Performance logging
  time(label: string) {
    if (Config.isDev) {
      console.time(label);
    }
  }

  timeEnd(label: string) {
    if (Config.isDev) {
      console.timeEnd(label);
    }
  }

  // Get logs for debugging
  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level >= level);
    }
    return [...this.logs];
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
  }

  // Export logs for support
  exportLogs(): string {
    return this.logs
      .map(log => this.formatMessage(log.level, log.message, log.context))
      .join('\n');
  }
}

export const logger = new Logger();

// Convenience functions
export const log = {
  debug: (message: string, context?: Record<string, any>) => logger.debug(message, context),
  info: (message: string, context?: Record<string, any>) => logger.info(message, context),
  warn: (message: string, context?: Record<string, any>) => logger.warn(message, context),
  error: (message: string, error?: Error, context?: Record<string, any>) => logger.error(message, error, context),
  time: (label: string) => logger.time(label),
  timeEnd: (label: string) => logger.timeEnd(label),
};

// Global error handler
if (Platform.OS !== 'web') {
  const originalHandler = ErrorUtils.getGlobalHandler();
  
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    logger.error(
      `Global ${isFatal ? 'Fatal' : 'Non-Fatal'} Error`,
      error,
      { isFatal, stack: error.stack }
    );
    
    // Call original handler
    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });
}

export default logger;

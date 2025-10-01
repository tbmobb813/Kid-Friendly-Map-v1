import { Platform } from 'react-native';
import Config from './config';
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel || (LogLevel = {}));
class Logger {
    constructor() {
        this.logs = [];
        this.maxLogs = 1000;
        this.minLevel = Config.isDev ? LogLevel.DEBUG : LogLevel.INFO;
    }
    formatMessage(level, message, context) {
        const timestamp = new Date().toISOString();
        const levelStr = LogLevel[level];
        const contextStr = context ? ` ${JSON.stringify(context)}` : '';
        return `[${timestamp}] ${levelStr}: ${message}${contextStr}`;
    }
    shouldLog(level) {
        return level >= this.minLevel;
    }
    addLog(level, message, context, error) {
        if (!this.shouldLog(level))
            return;
        const logEntry = {
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
    async sendToCrashReporting(logEntry, error) {
        try {
            // In a real app, you'd send to services like Sentry, Bugsnag, etc.
            // For now, we'll just store it locally
            console.error('Production Error:', logEntry, error);
        }
        catch (e) {
            console.error('Failed to send crash report:', e);
        }
    }
    debug(message, context) {
        this.addLog(LogLevel.DEBUG, message, context);
    }
    info(message, context) {
        this.addLog(LogLevel.INFO, message, context);
    }
    warn(message, context) {
        this.addLog(LogLevel.WARN, message, context);
    }
    error(message, error, context) {
        this.addLog(LogLevel.ERROR, message, context, error);
    }
    // Performance logging
    time(label) {
        if (Config.isDev) {
            console.time(label);
        }
    }
    timeEnd(label) {
        if (Config.isDev) {
            console.timeEnd(label);
        }
    }
    // Get logs for debugging
    getLogs(level) {
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
    exportLogs() {
        return this.logs
            .map(log => this.formatMessage(log.level, log.message, log.context))
            .join('\n');
    }
}
export const logger = new Logger();
// Convenience functions
export const log = {
    debug: (message, context) => logger.debug(message, context),
    info: (message, context) => logger.info(message, context),
    warn: (message, context) => logger.warn(message, context),
    error: (message, error, context) => logger.error(message, error, context),
    time: (label) => logger.time(label),
    timeEnd: (label) => logger.timeEnd(label),
};
// Global error handler
if (Platform.OS !== 'web') {
    const originalHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error, isFatal) => {
        logger.error(`Global ${isFatal ? 'Fatal' : 'Non-Fatal'} Error`, error, { isFatal, stack: error.stack });
        // Call original handler
        if (originalHandler) {
            originalHandler(error, isFatal);
        }
    });
}
export default logger;

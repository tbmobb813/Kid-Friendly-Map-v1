import { Platform } from "react-native";
import React from "react";
class PerformanceMonitor {
    constructor() {
        this.metrics = [];
        this.timers = new Map();
    }
    startTimer(name) {
        this.timers.set(name, Date.now());
    }
    endTimer(name) {
        const startTime = this.timers.get(name);
        if (startTime) {
            const duration = Date.now() - startTime;
            this.recordMetric(name, duration);
            this.timers.delete(name);
            return duration;
        }
        return 0;
    }
    recordMetric(name, value) {
        const metric = {
            name,
            value,
            timestamp: Date.now(),
        };
        this.metrics.push(metric);
        console.log(`Performance: ${name} = ${value}ms`);
    }
    getMetrics() {
        return [...this.metrics];
    }
    clearMetrics() {
        this.metrics = [];
    }
    // Memory usage monitoring (mobile only)
    getMemoryUsage() {
        if (Platform.OS === 'web') {
            return {
                used: 0,
                total: 0,
            };
        }
        // In a real app, you'd use a native module to get memory info
        return {
            used: Math.random() * 100, // Mock data
            total: 512,
        };
    }
}
export const performanceMonitor = new PerformanceMonitor();
// HOC for measuring component render time
export function withPerformanceTracking(Component, componentName) {
    return function PerformanceTrackedComponent(props) {
        React.useEffect(() => {
            performanceMonitor.startTimer(`${componentName}_render`);
            return () => {
                performanceMonitor.endTimer(`${componentName}_render`);
            };
        });
        return React.createElement(Component, props);
    };
}

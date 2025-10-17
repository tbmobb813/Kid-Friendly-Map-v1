import { Platform } from 'react-native';
import React from 'react';

type PerformanceMetric = {
  name: string;
  value: number;
  timestamp: number;
};

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private timers: Map<string, number> = new Map();

  startTimer(name: string) {
    this.timers.set(name, Date.now());
  }

  endTimer(name: string) {
    const startTime = this.timers.get(name);
    if (startTime) {
      const duration = Date.now() - startTime;
      this.recordMetric(name, duration);
      this.timers.delete(name);
      return duration;
    }
    return 0;
  }

  recordMetric(name: string, value: number) {
    const metric: PerformanceMetric = {
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
export function withPerformanceTracking<T extends object>(
  Component: React.ComponentType<T>,
  componentName: string,
) {
  return function PerformanceTrackedComponent(props: T) {
    React.useEffect(() => {
      performanceMonitor.startTimer(`${componentName}_render`);
      return () => {
        performanceMonitor.endTimer(`${componentName}_render`);
      };
    });

    return React.createElement(Component, props);
  };
}

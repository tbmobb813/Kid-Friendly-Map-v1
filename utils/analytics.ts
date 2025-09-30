type AnalyticsEvent = {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
};

class Analytics {
  private events: AnalyticsEvent[] = [];
  private isEnabled = true;

  track(name: string, properties?: Record<string, any>) {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      name,
      properties,
      timestamp: Date.now(),
    };

    this.events.push(event);
    console.log('Analytics:', event);

    // In a real app, you'd send this to your analytics service
    // this.sendToAnalytics(event);
  }

  screen(screenName: string, properties?: Record<string, any>) {
    this.track('screen_view', {
      screen_name: screenName,
      ...properties,
    });
  }

  userAction(action: string, properties?: Record<string, any>) {
    this.track('user_action', {
      action,
      ...properties,
    });
  }

  error(error: Error, context?: string) {
    this.track('error', {
      error_message: error.message,
      error_stack: error.stack,
      context,
    });
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  getEvents() {
    return [...this.events];
  }

  clearEvents() {
    this.events = [];
  }
}

export const analytics = new Analytics();

// Common tracking functions
export const trackScreenView = (screenName: string) => {
  analytics.screen(screenName);
};

export const trackUserAction = (action: string, properties?: Record<string, any>) => {
  analytics.userAction(action, properties);
};

export const trackError = (error: Error, context?: string) => {
  analytics.error(error, context);
};

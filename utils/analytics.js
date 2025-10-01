class Analytics {
    constructor() {
        this.events = [];
        this.isEnabled = true;
    }
    track(name, properties) {
        if (!this.isEnabled)
            return;
        const event = {
            name,
            properties,
            timestamp: Date.now(),
        };
        this.events.push(event);
        console.log('Analytics:', event);
        // In a real app, you'd send this to your analytics service
        // this.sendToAnalytics(event);
    }
    screen(screenName, properties) {
        this.track('screen_view', {
            screen_name: screenName,
            ...properties,
        });
    }
    userAction(action, properties) {
        this.track('user_action', {
            action,
            ...properties,
        });
    }
    error(error, context) {
        this.track('error', {
            error_message: error.message,
            error_stack: error.stack,
            context,
        });
    }
    setEnabled(enabled) {
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
export const trackScreenView = (screenName) => {
    analytics.screen(screenName);
};
export const trackUserAction = (action, properties) => {
    analytics.userAction(action, properties);
};
export const trackError = (error, context) => {
    analytics.error(error, context);
};

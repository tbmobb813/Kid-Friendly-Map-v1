import Config from './config';
import { log } from './logger';

type AnalyticsEvent = {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
};

const sanitizeValue = (value: any): any => {
  if (value === null || value === undefined) {
    return undefined;
  }

  const valueType = typeof value;

  if (valueType === 'string' || valueType === 'number' || valueType === 'boolean') {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item)).filter((item) => item !== undefined);
  }

  if (valueType === 'object') {
    const result: Record<string, any> = {};
    Object.entries(value).forEach(([key, val]) => {
      const sanitized = sanitizeValue(val);
      if (sanitized !== undefined) {
        result[key] = sanitized;
      }
    });
    return result;
  }

  return String(value);
};

class Analytics {
  private events: AnalyticsEvent[] = [];
  private isEnabled = Config.ANALYTICS.ENABLED;
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly batchSize = Config.ANALYTICS.BATCH_SIZE;
  private readonly flushInterval = Config.ANALYTICS.FLUSH_INTERVAL;

  private get plausibleEnabled(): boolean {
    return (
      Config.ANALYTICS.PLAUSIBLE.ENABLED &&
      !!Config.ANALYTICS.PLAUSIBLE.ENDPOINT &&
      !!Config.ANALYTICS.PLAUSIBLE.SITE_ID
    );
  }

  track(name: string, properties?: Record<string, any>) {
    if (!this.isEnabled) {
      return;
    }

    const event: AnalyticsEvent = {
      name,
      properties,
      timestamp: Date.now(),
    };

    this.events.push(event);
    log.debug?.('Analytics event queued', { name, size: this.events.length });

    if (this.events.length >= this.batchSize) {
      void this.flush();
    } else {
      this.scheduleFlush();
    }
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
      message: error.message,
      stack: error.stack,
      context,
    });
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;

    if (!enabled) {
      this.clearEvents();
      if (this.flushTimer) {
        clearTimeout(this.flushTimer);
        this.flushTimer = null;
      }
    }
  }

  getEvents() {
    return [...this.events];
  }

  clearEvents() {
    this.events = [];
  }

  async flush(force = false): Promise<void> {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    if (!this.isEnabled || this.events.length === 0) {
      return;
    }

    const batchSize = force ? this.events.length : this.batchSize;
    const batch = this.events.splice(0, batchSize);

    if (this.plausibleEnabled) {
      try {
        await this.dispatchToPlausible(batch);
      } catch (error) {
        log.warn?.('Failed to send analytics batch', error as any);
        // Re-queue events for next attempt
        this.events.unshift(...batch);
      }
    }
  }

  private scheduleFlush() {
    if (this.flushTimer || this.flushInterval <= 0) {
      return;
    }

    this.flushTimer = setTimeout(() => {
      this.flush().catch((error) => {
        log.warn?.('Analytics flush error', error);
      });
    }, this.flushInterval);
  }

  private async dispatchToPlausible(events: AnalyticsEvent[]): Promise<void> {
    const config = Config.ANALYTICS.PLAUSIBLE;

    if (typeof fetch !== 'function') {
      log.debug?.('Fetch not available; skipping Plausible dispatch');
      return;
    }

    const payloads = events.map((event) => {
      const screenName = event.properties?.screen_name || event.name;
      const safePath = String(screenName)
        .toLowerCase()
        .replace(/[^a-z0-9/_-]+/g, '-');

      const props = sanitizeValue({
        ...event.properties,
        timestamp: event.timestamp,
      });

      return {
        name: event.name,
        url: `${config.DEFAULT_URL.replace(/\/$/, '')}/${safePath}`,
        domain: config.SITE_ID,
        source: config.SOURCE,
        props: props ?? {},
      };
    });

    await Promise.all(
      payloads.map((payload) =>
        fetch(config.ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(config.SHARED_KEY ? { Authorization: `Bearer ${config.SHARED_KEY}` } : {}),
          },
          body: JSON.stringify(payload),
        }),
      ),
    );
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

export const flushAnalytics = () => analytics.flush(true);

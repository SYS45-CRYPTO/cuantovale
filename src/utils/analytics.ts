import { AnalyticsEvent } from '../types';

export const trackEvent = async (
  eventName: AnalyticsEvent['event_name'],
  details: Partial<Omit<AnalyticsEvent, 'event_name' | 'timestamp'>> = {}
) => {
  const eventPayload: AnalyticsEvent = {
    event_name: eventName,
    timestamp: new Date().toISOString(),
    page: window.location.pathname,
    ...details
  };

  // Dispatch custom DOM event for local subscribers / reactive admin view
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('cuantovale_analytics', { detail: eventPayload })
    );
  }

  // Send to backend endpoint asynchronously (never blocks UI)
  try {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventPayload)
    }).catch(() => {
      // Non-critical telemetry, silently ignore network glitches
    });
  } catch {
    // Non-blocking
  }
};

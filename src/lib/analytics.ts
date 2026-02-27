import { trackEvent as supabaseTrackEvent } from './supabaseClient';

/**
 * Centralized analytics tracking utility
 * Tracks user interactions and events
 */

export interface TrackingMetadata {
  [key: string]: unknown;
}

export const AnalyticsEvents = {
  BOOK_VIEW: 'book_view',
  BOOK_CLICK: 'book_click',
  PREVIEW_OPEN: 'preview_open',
  PREVIEW_READ: 'preview_read',
  AUDIO_PLAY: 'audio_play',
  AUDIO_COMPLETE: 'audio_complete',
  SUBSCRIBE_ATTEMPT: 'subscribe_attempt',
  SUBSCRIBE_SUCCESS: 'subscribe_success',
  CONTACT_SUBMIT: 'contact_submit',
  PAGE_VIEW: 'page_view',
  EXTERNAL_LINK_CLICK: 'external_link_click',
} as const;

/**
 * Track an analytics event
 */
export async function trackAnalytics(
  eventType: string,
  metadata?: TrackingMetadata,
  userId?: string,
  bookId?: string
): Promise<void> {
  try {
    // Only track if analytics is enabled
    if (!import.meta.env.VITE_ANALYTICS_ENABLED) {
      return;
    }

    // Store locally first for offline support
    const event = {
      type: eventType,
      metadata,
      userId,
      bookId,
      timestamp: new Date().toISOString(),
    };

    // Save to local storage queue
    const queue = JSON.parse(localStorage.getItem('analytics_queue') || '[]');
    queue.push(event);
    localStorage.setItem('analytics_queue', JSON.stringify(queue.slice(-100))); // Keep last 100 events

    // Send to Supabase
    await supabaseTrackEvent(eventType, userId, bookId, metadata);
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}

/**
 * Track a page view
 */
export async function trackPageView(
  pageName: string,
  metadata?: TrackingMetadata
): Promise<void> {
  await trackAnalytics(AnalyticsEvents.PAGE_VIEW, {
    page: pageName,
    ...metadata,
  });
}

/**
 * Track book interaction
 */
export async function trackBookView(bookId: string, bookTitle?: string): Promise<void> {
  await trackAnalytics(AnalyticsEvents.BOOK_VIEW, { title: bookTitle }, undefined, bookId);
}

/**
 * Track preview modal open
 */
export async function trackPreviewOpen(
  bookId: string,
  bookTitle?: string
): Promise<void> {
  await trackAnalytics(AnalyticsEvents.PREVIEW_OPEN, { title: bookTitle }, undefined, bookId);
}

/**
 * Track audio play
 */
export async function trackAudioPlay(
  bookId: string,
  bookTitle?: string,
  duration?: number
): Promise<void> {
  await trackAnalytics(
    AnalyticsEvents.AUDIO_PLAY,
    { title: bookTitle, duration },
    undefined,
    bookId
  );
}

/**
 * Track subscription attempt
 */
export async function trackSubscribeAttempt(email?: string): Promise<void> {
  await trackAnalytics(AnalyticsEvents.SUBSCRIBE_ATTEMPT, { email });
}

/**
 * Track subscription success
 */
export async function trackSubscribeSuccess(email?: string): Promise<void> {
  await trackAnalytics(AnalyticsEvents.SUBSCRIBE_SUCCESS, { email });
}

/**
 * Track contact form submission
 */
export async function trackContactSubmit(email?: string): Promise<void> {
  await trackAnalytics(AnalyticsEvents.CONTACT_SUBMIT, { email });
}

/**
 * Track external link clicks (Inkitt, Wattpad, etc.)
 */
export async function trackExternalLink(
  platform: string,
  bookId?: string,
  bookTitle?: string
): Promise<void> {
  await trackAnalytics(
    AnalyticsEvents.EXTERNAL_LINK_CLICK,
    { platform, title: bookTitle },
    undefined,
    bookId
  );
}

/**
 * Flush offline events to Supabase when connection is restored
 */
export async function flushOfflineEvents(): Promise<void> {
  try {
    const queue = JSON.parse(localStorage.getItem('analytics_queue') || '[]');

    if (queue.length === 0) {
      return;
    }

    for (const event of queue) {
      await supabaseTrackEvent(
        event.type,
        event.userId,
        event.bookId,
        event.metadata
      );
    }

    localStorage.removeItem('analytics_queue');
  } catch (error) {
    console.error('Error flushing offline events:', error);
  }
}

/**
 * Get analytics summary
 */
export function getAnalyticsSummary(): {
  totalEvents: number;
  offlineEvents: number;
} {
  try {
    const queue = JSON.parse(localStorage.getItem('analytics_queue') || '[]');
    return {
      totalEvents: queue.length,
      offlineEvents: queue.filter((e: any) => !e.synced).length,
    };
  } catch {
    return { totalEvents: 0, offlineEvents: 0 };
  }
}

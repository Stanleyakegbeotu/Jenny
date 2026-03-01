import { trackEvent as supabaseTrackEvent, trackBookRead, trackBookClick } from './supabaseClient';

/**
 * Centralized analytics tracking utility
 * Tracks user interactions and events
 */

export interface TrackingMetadata {
  [key: string]: unknown;
}

// Get or create a unique visitor ID for this session
const getVisitorId = (): string => {
  let visitorId = localStorage.getItem('visitor_id');
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('visitor_id', visitorId);
  }
  return visitorId;
};

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
    // Get visitor ID for unique visitor tracking
    const visitorId = userId || getVisitorId();

    // Store locally first for offline support / queue backup
    const event = {
      type: eventType,
      metadata,
      userId: visitorId,
      bookId,
      timestamp: new Date().toISOString(),
    };

    // Save to local storage queue as backup
    const queue = JSON.parse(localStorage.getItem('analytics_queue') || '[]');
    queue.push(event);
    localStorage.setItem('analytics_queue', JSON.stringify(queue.slice(-100)));

    // Send to Supabase database (main tracking method)
    console.log(`📊 Analytics: ${eventType}`, { visitorId, bookId, metadata });
    await supabaseTrackEvent(
      eventType,
      visitorId,
      bookId,
      metadata
    );
  } catch (error) {
    console.debug('Error tracking analytics event:', error);
    // Continue silently - don't block user interactions
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
  // Track to database (actual interaction)
  if (bookId) {
    await trackBookClick(bookId);
  }
  
  // Also track to analytics (for metrics)
  await trackAnalytics(
    AnalyticsEvents.EXTERNAL_LINK_CLICK,
    { platform, title: bookTitle },
    undefined,
    bookId
  );
}

/**
 * Track comment submission
 */
export async function trackCommentSubmitted(bookId: string, authorName?: string): Promise<void> {
  await trackAnalytics(
    'comment_submitted',
    { author: authorName },
    undefined,
    bookId
  );
}

/**
 * Track comment like
 */
export async function trackCommentLiked(bookId: string, commentId?: string): Promise<void> {
  await trackAnalytics(
    'comment_liked',
    { comment_id: commentId },
    undefined,
    bookId
  );
}

/**
 * Track chapter read to completion
 */
export async function trackChapterRead(
  bookId: string,
  chapterId?: string,
  chapterTitle?: string
): Promise<void> {
  // Track to database (actual interaction)
  await trackBookRead(bookId);
  
  // Also track to analytics (for metrics)
  await trackAnalytics(
    AnalyticsEvents.PREVIEW_READ,
    { chapter_id: chapterId, chapter_title: chapterTitle },
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

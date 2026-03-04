/**
 * Publish Manager
 * Handles real-time cache invalidation and data refresh across the app
 * Uses BroadcastChannel API to notify all tabs/windows of published changes
 */

// Create a broadcast channel for publish events
const publishChannel = new BroadcastChannel('app-publish-events');

export interface PublishEvent {
  timestamp: number;
  type: 'full-refresh' | 'settings-update' | 'content-update';
  message?: string;
}

// Listeners for publish events
const listeners: Set<(event: PublishEvent) => void> = new Set();

// Listen for messages from other tabs/windows
publishChannel.addEventListener('message', (event) => {
  const publishEvent = event.data as PublishEvent;
  console.log('📢 [PublishManager] Received publish event:', publishEvent.type);
  
  // Notify all local listeners
  listeners.forEach((listener) => {
    try {
      listener(publishEvent);
    } catch (err) {
      console.error('Error in publish listener:', err);
    }
  });
});

/**
 * Subscribe to publish events
 * @param callback Function to call when a publish event is received
 * @returns Unsubscribe function
 */
export function subscribeToPublish(callback: (event: PublishEvent) => void): () => void {
  listeners.add(callback);
  
  return () => {
    listeners.delete(callback);
  };
}

/**
 * Publish changes to all tabs/windows
 * This triggers immediate refresh of landing page components
 * @param type Type of refresh to trigger
 * @param message Optional message describing the change
 */
export function publishChanges(
  type: PublishEvent['type'] = 'full-refresh',
  message?: string
): void {
  const event: PublishEvent = {
    timestamp: Date.now(),
    type,
    message,
  };

  console.log('📤 [PublishManager] Publishing changes:', event);

  // Broadcast to all tabs/windows
  publishChannel.postMessage(event);

  // Also notify local listeners
  listeners.forEach((listener) => {
    try {
      listener(event);
    } catch (err) {
      console.error('Error in publish listener:', err);
    }
  });

  // Clear browser cache for landing page
  if ('caches' in window) {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        caches.delete(cacheName).then(() => {
          console.log(`🗑️ [PublishManager] Cleared cache: ${cacheName}`);
        });
      });
    });
  }
}

/**
 * Clean up resources
 */
export function closePublishChannel(): void {
  publishChannel.close();
  listeners.clear();
}

import { useState, useEffect, useCallback } from 'react';

export function useAppBadge() {
  const [badgeCount, setBadgeCount] = useState(0);

  // Load badge count from localStorage
  useEffect(() => {
    const savedCount = localStorage.getItem('appBadgeCount');
    if (savedCount) {
      const count = parseInt(savedCount, 10);
      setBadgeCount(count);
      updateAppBadge(count);
    }
  }, []);

  // Update the badge on the app icon
  const updateAppBadge = useCallback((count: number) => {
    if ('setAppBadge' in navigator) {
      if (count > 0) {
        navigator.setAppBadge(count);
      } else {
        navigator.clearAppBadge?.();
      }
    }
  }, []);

  // Increment badge count
  const incrementBadge = useCallback((amount: number = 1) => {
    setBadgeCount((prev) => {
      const newCount = prev + amount;
      localStorage.setItem('appBadgeCount', String(newCount));
      updateAppBadge(newCount);
      return newCount;
    });
  }, [updateAppBadge]);

  // Decrement badge count
  const decrementBadge = useCallback((amount: number = 1) => {
    setBadgeCount((prev) => {
      const newCount = Math.max(0, prev - amount);
      localStorage.setItem('appBadgeCount', String(newCount));
      updateAppBadge(newCount);
      return newCount;
    });
  }, [updateAppBadge]);

  // Clear all badges
  const clearBadge = useCallback(() => {
    setBadgeCount(0);
    localStorage.setItem('appBadgeCount', '0');
    if ('clearAppBadge' in navigator) {
      navigator.clearAppBadge?.();
    }
  }, []);

  // Set badge count directly
  const setBadgeCountDirect = useCallback((count: number) => {
    const finalCount = Math.max(0, count);
    setBadgeCount(finalCount);
    localStorage.setItem('appBadgeCount', String(finalCount));
    updateAppBadge(finalCount);
  }, [updateAppBadge]);

  return {
    badgeCount,
    incrementBadge,
    decrementBadge,
    clearBadge,
    setBadgeCount: setBadgeCountDirect,
  };
}

'use client';

import { useEffect } from 'react';
import { syncPendingRecords } from '@/lib/sync';

export function PWARegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker
      .register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .then(() => {
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'SYNC_PENDING' });
        }
      })
      .catch((error) => console.warn('Service worker registration failed:', error));

    const handleOnline = () => {
      syncPendingRecords();
      if (navigator.serviceWorker?.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SYNC_PENDING' });
      }
    };

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_PENDING') {
        syncPendingRecords();
      }
    };

    window.addEventListener('online', handleOnline);
    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

    handleOnline();

    return () => {
      window.removeEventListener('online', handleOnline);
      navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, []);

  return null;
}

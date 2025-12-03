import { useRef, useEffect, useCallback } from 'react';

export function useWakeLock(isConnected: boolean) {
  const wakeLockRef = useRef<any>(null);

  const requestWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator && !wakeLockRef.current) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        wakeLockRef.current.addEventListener('release', () => {
          wakeLockRef.current = null;
        });
        console.log('Wake Lock active.');
      } catch (err) {
        console.warn('Wake Lock request failed:', err);
      }
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log('Wake Lock released.');
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Re-request wake lock if visibility changes (e.g. user tabs out and back in)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isConnected) {
        await requestWakeLock();
      }
    };
    
    if (isConnected) {
      requestWakeLock();
      document.addEventListener('visibilitychange', handleVisibilityChange);
    } else {
      releaseWakeLock();
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, [isConnected, requestWakeLock, releaseWakeLock]);

  return { requestWakeLock, releaseWakeLock };
}
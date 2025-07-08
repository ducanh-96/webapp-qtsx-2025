'use client';

import { useState, useEffect } from 'react';
import { enableNetwork } from 'firebase/firestore';
import { db } from '@/config/firebase';

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isFirebaseOnline, setIsFirebaseOnline] = useState(true);

  useEffect(() => {
    // Check browser online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check Firebase connection
    const checkFirebaseConnection = async () => {
      try {
        await enableNetwork(db);
        setIsFirebaseOnline(true);
      } catch (error) {
        console.warn('Firebase connection issue:', error);
        setIsFirebaseOnline(false);
      }
    };

    checkFirebaseConnection();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Don't show anything if everything is working
  if (isOnline && isFirebaseOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white px-4 py-2 text-center z-50">
      <div className="flex items-center justify-center space-x-2">
        <div className="animate-pulse w-2 h-2 bg-white rounded-full"></div>
        <span className="text-sm font-medium">
          {!isOnline
            ? 'You are currently offline. Some features may be limited.'
            : 'Database connection issue. Working in offline mode.'}
        </span>
        {!isOnline && (
          <button
            onClick={() => window.location.reload()}
            className="ml-4 text-xs underline hover:no-underline"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

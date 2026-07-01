import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';

interface SyncStatusContextType {
  isOnline: boolean;
  pendingWritesCount: number;
  timeSinceLastPendingWrite: number | null; // Timestamp
  incrementPendingWrites: () => void;
  decrementPendingWrites: () => void;
}

const SyncStatusContext = createContext<SyncStatusContextType>({
  isOnline: true,
  pendingWritesCount: 0,
  timeSinceLastPendingWrite: null,
  incrementPendingWrites: () => {},
  decrementPendingWrites: () => {}
});

let globalIncrement: (() => void) | null = null;
let globalDecrement: (() => void) | null = null;

export const trackPendingWrite = async <T,>(promise: Promise<T>): Promise<T> => {
  if (globalIncrement) globalIncrement();
  try {
    return await promise;
  } finally {
    if (globalDecrement) globalDecrement();
  }
};

export const useSyncStatus = () => useContext(SyncStatusContext);

export function SyncStatusProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingWritesCount, setPendingWritesCount] = useState(0);
  const [timeSinceLastPendingWrite, setTimeSinceLastPendingWrite] = useState<number | null>(null);

  useEffect(() => {
    globalIncrement = () => {
      setPendingWritesCount(prev => {
        if (prev === 0) setTimeSinceLastPendingWrite(Date.now());
        return prev + 1;
      });
    };
    globalDecrement = () => {
      setPendingWritesCount(prev => {
        const newCount = Math.max(0, prev - 1);
        if (newCount === 0) setTimeSinceLastPendingWrite(null);
        return newCount;
      });
    };
    return () => {
      globalIncrement = null;
      globalDecrement = null;
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      setIsOnline(navigator.onLine);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const incrementPendingWrites = () => {
    setPendingWritesCount(prev => {
      if (prev === 0) {
        setTimeSinceLastPendingWrite(Date.now());
      }
      return prev + 1;
    });
  };

  const decrementPendingWrites = () => {
    setPendingWritesCount(prev => {
      const newCount = Math.max(0, prev - 1);
      if (newCount === 0) {
        setTimeSinceLastPendingWrite(null);
      }
      return newCount;
    });
  };

  return (
    <SyncStatusContext.Provider value={{
      isOnline,
      pendingWritesCount,
      timeSinceLastPendingWrite,
      incrementPendingWrites,
      decrementPendingWrites
    }}>
      {children}
    </SyncStatusContext.Provider>
  );
}

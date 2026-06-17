import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useEffect } from 'react';
import type { ReactNode } from 'react';

import { queryClient } from '@/lib/queryClient';
import { persister } from '@/utils/persister';

const SEVEN_DAYS = 1000 * 60 * 60 * 24 * 7;

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  useEffect(() => {
    onlineManager.setEventListener((setOnline) => {
      return NetInfo.addEventListener((state) => {
        setOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
      });
    });

    return () => {
      onlineManager.setEventListener(() => undefined);
    };
  }, []);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: SEVEN_DAYS,
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}

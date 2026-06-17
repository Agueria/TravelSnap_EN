import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import type { ReactNode } from 'react';

import { queryClient } from '@/lib/queryClient';
import { persister } from '@/utils/persister';

const SEVEN_DAYS = 1000 * 60 * 60 * 24 * 7;

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
  });
});

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
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

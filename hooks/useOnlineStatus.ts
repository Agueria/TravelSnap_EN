import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

interface OnlineStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  isOffline: boolean;
}

export function useOnlineStatus(): OnlineStatus {
  const [status, setStatus] = useState<OnlineStatus>({
    isConnected: true,
    isInternetReachable: null,
    isOffline: false,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isConnected = state.isConnected ?? false;
      const isInternetReachable = state.isInternetReachable ?? null;
      const isOffline = isConnected === false || isInternetReachable === false;

      setStatus({
        isConnected,
        isInternetReachable,
        isOffline,
      });
    });

    return unsubscribe;
  }, []);

  return status;
}

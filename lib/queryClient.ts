import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60 * 24 * 7,
      retry: 3,
      retryDelay: (attemptIndex) =>
        Math.min(1000 * 2 ** attemptIndex, 30_000),
    },
    mutations: {
      retry: 0,
    },
  },
});

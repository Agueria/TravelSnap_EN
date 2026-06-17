import { useQuery } from '@tanstack/react-query';

import type { Trip } from '@/types/trip';
import { loadTrips } from '@/utils/tripStorage';

export const TRIPS_QUERY_KEY = ['trips'] as const;

export function useTripsQuery() {
  return useQuery<Trip[]>({
    queryKey: TRIPS_QUERY_KEY,
    queryFn: loadTrips,
    staleTime: Infinity,
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Trip, TripData } from '@/types/trip';
import { saveTrips } from '@/utils/tripStorage';
import { TRIPS_QUERY_KEY } from '@/hooks/useTripsQuery';

interface MutationContext {
  previousTrips: Trip[];
}

interface AddTripInput {
  data: TripData;
  id?: string;
}

interface UpdateTripInput {
  id: string;
  data: Partial<TripData>;
}

type AddTripVariables = TripData | AddTripInput;

function isAddTripInput(variables: AddTripVariables): variables is AddTripInput {
  return 'data' in variables;
}

function createTrip(variables: AddTripVariables): Trip {
  if (isAddTripInput(variables)) {
    return {
      id: variables.id ?? Date.now().toString(),
      ...variables.data,
    };
  }

  return {
    id: Date.now().toString(),
    ...variables,
  };
}

export function useAddTripMutation() {
  const queryClient = useQueryClient();

  return useMutation<Trip[], Error, AddTripVariables, MutationContext>({
    mutationFn: async () => {
      const trips = queryClient.getQueryData<Trip[]>(TRIPS_QUERY_KEY) ?? [];
      await saveTrips(trips);
      return trips;
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: TRIPS_QUERY_KEY });

      const previousTrips = queryClient.getQueryData<Trip[]>(TRIPS_QUERY_KEY) ?? [];
      const newTrip = createTrip(variables);
      queryClient.setQueryData<Trip[]>(TRIPS_QUERY_KEY, [...previousTrips, newTrip]);

      return { previousTrips };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(TRIPS_QUERY_KEY, context?.previousTrips ?? []);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: TRIPS_QUERY_KEY });
    },
  });
}

export function useDeleteTripMutation() {
  const queryClient = useQueryClient();

  return useMutation<Trip[], Error, string, MutationContext>({
    mutationFn: async () => {
      const trips = queryClient.getQueryData<Trip[]>(TRIPS_QUERY_KEY) ?? [];
      await saveTrips(trips);
      return trips;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: TRIPS_QUERY_KEY });

      const previousTrips = queryClient.getQueryData<Trip[]>(TRIPS_QUERY_KEY) ?? [];
      queryClient.setQueryData<Trip[]>(
        TRIPS_QUERY_KEY,
        previousTrips.filter((trip) => trip.id !== id)
      );

      return { previousTrips };
    },
    onError: (_error, _id, context) => {
      queryClient.setQueryData(TRIPS_QUERY_KEY, context?.previousTrips ?? []);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: TRIPS_QUERY_KEY });
    },
  });
}

export function useUpdateTripMutation() {
  const queryClient = useQueryClient();

  return useMutation<Trip[], Error, UpdateTripInput, MutationContext>({
    mutationFn: async () => {
      const trips = queryClient.getQueryData<Trip[]>(TRIPS_QUERY_KEY) ?? [];
      await saveTrips(trips);
      return trips;
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: TRIPS_QUERY_KEY });

      const previousTrips = queryClient.getQueryData<Trip[]>(TRIPS_QUERY_KEY) ?? [];
      queryClient.setQueryData<Trip[]>(
        TRIPS_QUERY_KEY,
        previousTrips.map((trip) =>
          trip.id === id ? { ...trip, ...data } : trip
        )
      );

      return { previousTrips };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(TRIPS_QUERY_KEY, context?.previousTrips ?? []);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: TRIPS_QUERY_KEY });
    },
  });
}

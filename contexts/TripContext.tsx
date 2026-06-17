import { createContext, useCallback, useContext } from 'react';
import type { ReactNode } from 'react';

import type { Trip, TripData } from '@/types/trip';
import {
  useAddTripMutation,
  useDeleteTripMutation,
  useUpdateTripMutation,
} from '@/hooks/useTripMutations';
import { useTripsQuery } from '@/hooks/useTripsQuery';

interface TripContextValue {
  trips: Trip[];
  loading: boolean;
  addTrip: (data: TripData, id?: string) => Promise<void>;
  updateTrip: (id: string, patch: Partial<TripData>) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
}

const TripContext = createContext<TripContextValue | null>(null);

interface TripProviderProps {
  children: ReactNode;
}

export function TripProvider({ children }: TripProviderProps) {
  const { data: trips = [], isLoading } = useTripsQuery();
  const addTripMutation = useAddTripMutation();
  const updateTripMutation = useUpdateTripMutation();
  const deleteTripMutation = useDeleteTripMutation();

  const addTrip = useCallback(
    async (data: TripData, id?: string): Promise<void> => {
      await addTripMutation.mutateAsync({ data, id });
    },
    [addTripMutation]
  );

  const updateTrip = useCallback(
    async (id: string, patch: Partial<TripData>): Promise<void> => {
      await updateTripMutation.mutateAsync({ id, data: patch });
    },
    [updateTripMutation]
  );

  const deleteTrip = useCallback(
    async (id: string): Promise<void> => {
      await deleteTripMutation.mutateAsync(id);
    },
    [deleteTripMutation]
  );

  return (
    <TripContext.Provider
      value={{
        trips,
        loading: isLoading,
        addTrip,
        updateTrip,
        deleteTrip,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

export function useTrips(): TripContextValue {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrips must be used within a TripProvider');
  }
  return context;
}

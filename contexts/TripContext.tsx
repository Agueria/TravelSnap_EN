import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import type { Trip, TripData } from '@/types/trip';
import { loadTrips, saveTrips } from '@/utils/tripStorage';

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
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const tripsRef = useRef<Trip[]>([]);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async (): Promise<void> => {
      try {
        const stored = await loadTrips();
        if (!isMounted) return;
        tripsRef.current = stored;
        setTrips(stored);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    void hydrate();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateAndPersistTrips = async (
    updater: (current: Trip[]) => Trip[]
  ): Promise<void> => {
    const current = tripsRef.current;
    const updated = updater(current);
    if (updated === current) return;

    tripsRef.current = updated;
    setTrips(updated);
    await saveTrips(updated);
  };

  const addTrip = async (data: TripData, id?: string): Promise<void> => {
    const newTrip: Trip = { id: id ?? Date.now().toString(), ...data };
    await updateAndPersistTrips((current) => [newTrip, ...current]);
  };

  const updateTrip = async (id: string, patch: Partial<TripData>): Promise<void> => {
    await updateAndPersistTrips((current) => {
      let didUpdate = false;
      const updated = current.map((trip) => {
        if (trip.id !== id) return trip;
        didUpdate = true;
        return { ...trip, ...patch };
      });

      return didUpdate ? updated : current;
    });
  };

  const deleteTrip = async (id: string): Promise<void> => {
    await updateAndPersistTrips((current) => {
      const updated = current.filter((trip) => trip.id !== id);
      return updated.length === current.length ? current : updated;
    });
  };

  return (
    <TripContext.Provider value={{ trips, loading, addTrip, updateTrip, deleteTrip }}>
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

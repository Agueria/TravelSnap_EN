import * as Location from 'expo-location';
import type { LocationObject } from 'expo-location';
import { useEffect, useState } from 'react';

export interface UseLocationResult {
  location: LocationObject | null;
  error: string | null;
  loading: boolean;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadLocation = async (): Promise<void> => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (!active) {
          return;
        }

        if (status !== 'granted') {
          setError('Location permission denied');
          setLoading(false);
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!active) {
          return;
        }

        setLocation(currentLocation);
      } catch (err) {
        if (active) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadLocation();

    return () => {
      active = false;
    };
  }, []);

  return { location, error, loading };
}

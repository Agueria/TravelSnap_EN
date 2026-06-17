import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Trip, TripCoordinates } from '@/types/trip';

const STORAGE_KEY = 'travelsnap_trips';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isTripCoordinates(value: unknown): value is TripCoordinates {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.latitude === 'number' &&
    typeof value.longitude === 'number'
  );
}

function isTrip(value: unknown): value is Trip {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.destination === 'string' &&
    typeof value.date === 'string' &&
    typeof value.rating === 'number' &&
    (value.imageUri === undefined || typeof value.imageUri === 'string') &&
    (value.galleryUris === undefined || isStringArray(value.galleryUris)) &&
    (value.coordinates === undefined || isTripCoordinates(value.coordinates))
  );
}

export async function saveTrips(trips: Trip[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  } catch (error) {
    console.warn('Failed to save trips to storage.', error);
    throw error;
  }
}

export async function loadTrips(): Promise<Trip[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as unknown;
    return Array.isArray(parsed) && parsed.every(isTrip) ? parsed : [];
  } catch (error) {
    console.warn('Failed to load trips from storage.', error);
    return [];
  }
}

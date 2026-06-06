import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import type { LocationObject } from 'expo-location';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';
import type { Region } from 'react-native-maps';

import ErrorView from '@/components/ErrorView';
import { Colors } from '@/constants/Colors';
import { useTrips } from '@/contexts/TripContext';
import { useLocation } from '@/hooks/useLocation';
import type { Trip, TripCoordinates } from '@/types/trip';

const WARSAW_REGION: Region = {
  latitude: 52.2297,
  longitude: 21.0122,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

const SINGLE_MARKER_DELTA = 0.05;
const MARKER_EDGE_PADDING = { top: 50, right: 50, bottom: 50, left: 50 };
const CALLOUT_IMAGE_BLURHASH = 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.';

type TripWithCoordinates = Trip & {
  coordinates: TripCoordinates;
};

function hasCoordinates(trip: Trip): trip is TripWithCoordinates {
  return Boolean(trip.coordinates);
}

function createInitialRegion(location: LocationObject | null): Region {
  if (!location) {
    return WARSAW_REGION;
  }

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };
}

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const router = useRouter();
  const { trips } = useTrips();
  const { location, error, loading } = useLocation();

  const tripsWithCoords = useMemo(
    () => trips.filter(hasCoordinates),
    [trips]
  );

  const initialRegion = useMemo(() => createInitialRegion(location), [location]);

  const handleOpenSettings = useCallback((): void => {
    void Linking.openSettings();
  }, []);

  const handleCalloutPress = useCallback(
    (id: string): void => {
      router.push({ pathname: '/trip/[id]', params: { id } });
    },
    [router]
  );

  useEffect(() => {
    const coords = tripsWithCoords.map((trip) => trip.coordinates);

    if (!mapRef.current || coords.length === 0) {
      return;
    }

    if (coords.length === 1) {
      const [coordinate] = coords;
      mapRef.current.animateToRegion(
        {
          ...coordinate,
          latitudeDelta: SINGLE_MARKER_DELTA,
          longitudeDelta: SINGLE_MARKER_DELTA,
        },
        350
      );
      return;
    }

    mapRef.current.fitToCoordinates(coords, {
      edgePadding: MARKER_EDGE_PADDING,
      animated: true,
    });
  }, [tripsWithCoords]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error && tripsWithCoords.length === 0) {
    return (
      <ErrorView
        message={error}
        retryLabel="Open Settings"
        onRetry={handleOpenSettings}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={Boolean(location)}
        showsMyLocationButton={Boolean(location)}
      >
        {tripsWithCoords.map((trip) => (
          <Marker
            key={trip.id}
            coordinate={trip.coordinates}
            title={trip.title}
            description={trip.destination}
            pinColor={Colors.accent}
          >
            <Callout onPress={() => handleCalloutPress(trip.id)}>
              <View style={styles.calloutContainer}>
                {trip.imageUri ? (
                  <Image
                    source={{ uri: trip.imageUri }}
                    style={styles.calloutImage}
                    placeholder={{ blurhash: CALLOUT_IMAGE_BLURHASH }}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={200}
                  />
                ) : (
                  <View style={styles.calloutPlaceholder}>
                    <Ionicons name="image-outline" size={24} color={Colors.textSecondary} />
                  </View>
                )}
                <View style={styles.calloutText}>
                  <Text style={styles.calloutTitle} numberOfLines={2}>
                    {trip.title}
                  </Text>
                  <Text style={styles.calloutDestination} numberOfLines={2}>
                    {trip.destination}
                  </Text>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {error ? (
        <View style={styles.errorPanel}>
          <ErrorView
            message={error}
            retryLabel="Open Settings"
            onRetry={handleOpenSettings}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  map: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  calloutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: 220,
    padding: 4,
  },
  calloutImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: Colors.inputBg,
  },
  calloutPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.inputBg,
  },
  calloutText: {
    flex: 1,
    gap: 4,
  },
  calloutTitle: {
    color: '#111827',
    fontSize: 15,
    fontWeight: 'bold',
  },
  calloutDestination: {
    color: '#4B5563',
    fontSize: 13,
  },
  errorPanel: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
});

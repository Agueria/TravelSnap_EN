import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Colors } from '@/constants/Colors';
import { useFetch } from '@/hooks/useFetch';
import type { UnsplashResponse } from '@/types/unsplash';
import { extractCountry } from '@/utils/destination';
import { createUnsplashPhotoUrl, hasUnsplashAccessKey } from '@/utils/unsplash';

const POPULAR_DESTINATIONS = [
  {
    id: 'paris-france',
    name: 'Paris, France',
    description: 'Museums, riverside walks, and classic city views.',
  },
  {
    id: 'cappadocia-turkey',
    name: 'Cappadocia, Turkey',
    description: 'Valleys, cave towns, and sunrise balloon routes.',
  },
  {
    id: 'kyoto-japan',
    name: 'Kyoto, Japan',
    description: 'Temples, gardens, tea houses, and quiet lanes.',
  },
  {
    id: 'rome-italy',
    name: 'Rome, Italy',
    description: 'Historic streets, ruins, fountains, and food stops.',
  },
  {
    id: 'marrakesh-morocco',
    name: 'Marrakesh, Morocco',
    description: 'Markets, courtyards, gardens, and warm colors.',
  },
];

interface Destination {
  id: string;
  name: string;
  description: string;
}

interface DestinationCardProps {
  destination: Destination;
}

function getDestinationPhotoStatus(
  unsplashConfigured: boolean,
  loading: boolean,
  error: string | null,
  hasPhoto: boolean
): string | null {
  if (!unsplashConfigured) {
    return 'Unsplash key missing';
  }

  if (error) {
    return 'Photo unavailable';
  }

  if (!loading && !hasPhoto) {
    return 'No photo found';
  }

  return null;
}

function DestinationCard({ destination }: DestinationCardProps) {
  const photoUrl = createUnsplashPhotoUrl(destination.name);
  const { data, loading, error } = useFetch<UnsplashResponse>(photoUrl);
  const photo = data?.results[0] ?? null;
  const country = extractCountry(destination.name);
  const statusText = getDestinationPhotoStatus(
    hasUnsplashAccessKey(),
    loading,
    error,
    Boolean(photo)
  );

  return (
    <View style={styles.card}>
      <View style={styles.imageFrame}>
        {photo ? (
          <Image source={{ uri: photo.urls.small }} style={styles.cardImage} />
        ) : (
          <View style={styles.photoPlaceholder}>
            {loading ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Ionicons name="image-outline" size={36} color={Colors.textSecondary} />
            )}
            <Text style={styles.photoPlaceholderText}>
              {loading ? 'Loading photo...' : statusText}
            </Text>
          </View>
        )}

        {loading && photo ? (
          <View style={styles.loadingBadge}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        ) : null}
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{destination.name}</Text>
        <Text style={styles.cardCountry}>{country}</Text>
        <Text style={styles.cardDescription}>{destination.description}</Text>
        {photo ? (
          <Text style={styles.attribution}>Photo by {photo.user.name} on Unsplash</Text>
        ) : null}
      </View>
    </View>
  );
}

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Ionicons name="compass" size={28} color={Colors.primary} />
          <View style={styles.headerText}>
            <Text style={styles.title}>Explore</Text>
            <Text style={styles.subtitle}>Popular destinations for your next trip</Text>
          </View>
        </View>

        {POPULAR_DESTINATIONS.map((destination) => (
          <DestinationCard key={destination.id} destination={destination} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
  },
  imageFrame: {
    height: 170,
    backgroundColor: '#1A2744',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  photoPlaceholderText: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  loadingBadge: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    padding: 16,
    gap: 6,
  },
  cardTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardCountry: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  cardDescription: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  attribution: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
});

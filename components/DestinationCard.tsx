import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/Colors';
import { UNSPLASH_ACCESS_KEY, UNSPLASH_BASE_URL } from '@/constants/api';
import { useFetch } from '@/hooks/useFetch';
import type { UnsplashResponse } from '@/types/unsplash';
import { extractCountry } from '@/utils/destination';

const UNSPLASH_KEY_PLACEHOLDER = 'PASTE_UNSPLASH_ACCESS_KEY_HERE';
const DESTINATION_IMAGE_BLURHASH = 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.';

export interface Destination {
  id: string;
  name: string;
  description: string;
}

interface DestinationCardProps {
  destination: Destination;
}

function hasUnsplashAccessKey(): boolean {
  const accessKey = UNSPLASH_ACCESS_KEY.trim();
  return accessKey.length > 0 && accessKey !== UNSPLASH_KEY_PLACEHOLDER;
}

function createUnsplashPhotoUrl(destination: string): string {
  if (!hasUnsplashAccessKey()) {
    return '';
  }

  const query = encodeURIComponent(`${destination} travel landmark`);
  const accessKey = encodeURIComponent(UNSPLASH_ACCESS_KEY.trim());
  return (
    `${UNSPLASH_BASE_URL}/search/photos?query=${query}` +
    `&per_page=1&orientation=landscape&client_id=${accessKey}`
  );
}

function getDestinationPhotoStatus(
  photoUrl: string,
  loading: boolean,
  error: string | null,
  hasPhoto: boolean
): string | null {
  if (!photoUrl) {
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

function DestinationCardComponent({ destination }: DestinationCardProps) {
  const photoUrl = createUnsplashPhotoUrl(destination.name);
  const { data, loading, error } = useFetch<UnsplashResponse>(photoUrl);
  const photo = data?.results[0] ?? null;
  const country = extractCountry(destination.name);
  const statusText = getDestinationPhotoStatus(photoUrl, loading, error, Boolean(photo));

  return (
    <View style={styles.card}>
      <View style={styles.imageFrame}>
        {photo ? (
          <Image
            source={{ uri: photo.urls.small }}
            style={styles.cardImage}
            placeholder={{ blurhash: DESTINATION_IMAGE_BLURHASH }}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={200}
          />
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

export default React.memo(DestinationCardComponent);

const styles = StyleSheet.create({
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

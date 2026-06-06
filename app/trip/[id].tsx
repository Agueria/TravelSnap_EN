import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { CountryCard } from '@/components/CountryCard';
import ErrorView from '@/components/ErrorView';
import RatingStars from '@/components/RatingStars';
import { Colors } from '@/constants/Colors';
import { UNSPLASH_ACCESS_KEY, UNSPLASH_BASE_URL } from '@/constants/api';
import { useTrips } from '@/contexts/TripContext';
import { useFetch } from '@/hooks/useFetch';
import { useFavorites } from '@/hooks/useFavorites';
import type { UnsplashResponse } from '@/types/unsplash';
import { extractCountry } from '@/utils/destination';

const UNSPLASH_KEY_PLACEHOLDER = 'PASTE_UNSPLASH_ACCESS_KEY_HERE';
const HERO_BLURHASH = 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.';

interface HeroStatusOptions {
  unsplashConfigured: boolean;
  photoLoading: boolean;
  photoError: string | null;
  photoData: UnsplashResponse | null;
  hasOnlinePhoto: boolean;
  hasLocalImage: boolean;
}

function hasUnsplashAccessKey(): boolean {
  const accessKey = UNSPLASH_ACCESS_KEY.trim();
  return accessKey.length > 0 && accessKey !== UNSPLASH_KEY_PLACEHOLDER;
}

function createUnsplashPhotoUrl(destination?: string): string {
  if (!destination || !hasUnsplashAccessKey()) {
    return '';
  }

  const query = encodeURIComponent(`${destination} travel landmark`);
  const accessKey = encodeURIComponent(UNSPLASH_ACCESS_KEY.trim());
  return (
    `${UNSPLASH_BASE_URL}/search/photos?query=${query}` +
    `&per_page=1&orientation=landscape&client_id=${accessKey}`
  );
}

function createHeroStatusMessage({
  unsplashConfigured,
  photoLoading,
  photoError,
  photoData,
  hasOnlinePhoto,
  hasLocalImage,
}: HeroStatusOptions): string | null {
  const fallbackMessage = hasLocalImage
    ? 'Showing saved trip photo.'
    : 'No saved trip photo available.';

  if (!unsplashConfigured) {
    return `Unsplash key not configured. ${fallbackMessage}`;
  }

  if (photoError) {
    return `Online photo unavailable. ${fallbackMessage}`;
  }

  if (!photoLoading && photoData !== null && !hasOnlinePhoto) {
    return `No online photo found. ${fallbackMessage}`;
  }

  return null;
}

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { trips, deleteTrip } = useTrips();
  const router = useRouter();
  const { isLoading, isFavorite, toggleFavorite } = useFavorites();

  const trip = trips.find((t) => t.id === id);
  const favorited = isFavorite(id);
  const photoUrl = createUnsplashPhotoUrl(trip?.destination);
  const {
    data: photoData,
    loading: photoLoading,
    error: photoError,
  } = useFetch<UnsplashResponse>(photoUrl);

  const handleDelete = (): void => {
    Alert.alert('Delete Trip', 'This action cannot be undone. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTrip(id);
          router.back();
        },
      },
    ]);
  };

  if (!trip) {
    return (
      <>
        <Stack.Screen options={{ title: 'Trip not found' }} />
        <View style={styles.screen}>
          <ErrorView
            message="Trip not found."
            onRetry={() => router.back()}
            retryLabel="Go back"
          />
        </View>
      </>
    );
  }

  const { title, destination, date, rating, imageUri, galleryUris } = trip;
  const galleryCount = galleryUris?.length ?? 0;
  const countryName = extractCountry(destination);
  const onlinePhoto = photoData?.results[0] ?? null;
  const heroUri = onlinePhoto?.urls.regular ?? imageUri;
  const heroStatusMessage = createHeroStatusMessage({
    unsplashConfigured: photoUrl.length > 0,
    photoLoading,
    photoError,
    photoData,
    hasOnlinePhoto: Boolean(onlinePhoto),
    hasLocalImage: Boolean(imageUri),
  });

  return (
    <>
      <Stack.Screen
        options={{
          title,
          headerRight: () =>
            isLoading ? (
              <View style={styles.headerButton}>
                <ActivityIndicator size="small" color={Colors.textSecondary} />
              </View>
            ) : (
              <Pressable onPress={() => toggleFavorite(id)} style={styles.headerButton}>
                <Ionicons
                  name={favorited ? 'heart' : 'heart-outline'}
                  size={24}
                  color={favorited ? Colors.accent : Colors.textSecondary}
                />
              </Pressable>
            ),
        }}
      />

      <ScrollView style={styles.screen} bounces={false}>
        <View style={styles.heroFrame}>
          {heroUri ? (
            <Image
              source={{ uri: heroUri }}
              style={styles.heroImage}
              placeholder={{ blurhash: HERO_BLURHASH }}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={300}
            />
          ) : (
            <View style={styles.heroPlaceholder}>
              {photoLoading ? (
                <ActivityIndicator size="large" color={Colors.primary} />
              ) : (
                <Ionicons name="image-outline" size={64} color="#4A6FA5" />
              )}
              <Text style={styles.placeholderText}>
                {photoLoading ? 'Loading photo...' : 'No photo'}
              </Text>
            </View>
          )}

          {photoLoading && heroUri ? (
            <View style={styles.heroLoadingOverlay}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : null}
        </View>

        {onlinePhoto ? (
          <View style={styles.attributionBar}>
            <Text style={styles.attributionText}>
              Photo by {onlinePhoto.user.name} on Unsplash
            </Text>
          </View>
        ) : null}

        {heroStatusMessage ? (
          <View style={styles.heroStatusBar}>
            <Ionicons name="cloud-offline-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.heroStatusText}>{heroStatusMessage}</Text>
          </View>
        ) : null}

        <View style={styles.body}>
          <CountryCard countryName={countryName} />

          <View style={styles.actionRow}>
            <Pressable
              style={styles.galleryButton}
              onPress={() => router.push({ pathname: '/trip/gallery/[id]', params: { id } })}
            >
              <Ionicons name="images-outline" size={20} color={Colors.primary} />
              <Text style={styles.galleryButtonText}>Gallery ({galleryCount})</Text>
            </Pressable>
          </View>

          <Text style={styles.tripTitle}>{title}</Text>

          <View style={styles.metaRow}>
            <Ionicons name="location" size={16} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{destination}</Text>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="calendar" size={14} color={Colors.textSecondary} />
            <Text style={[styles.metaText, styles.dateText]}>{date}</Text>
          </View>

          <View style={styles.starsRow}>
            <RatingStars rating={rating} />
          </View>

          <Pressable
            style={styles.editButton}
            onPress={() => router.push(`/trip/edit/${trip.id}`)}
          >
            <Ionicons name="create-outline" size={18} color={Colors.background} />
            <Text style={styles.editButtonText}>Edit trip</Text>
          </Pressable>

          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Back to list</Text>
          </Pressable>

          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={18} color={Colors.textPrimary} />
            <Text style={styles.deleteButtonText}>Delete trip</Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  heroFrame: {
    width: '100%',
    height: 250,
    backgroundColor: '#1A2744',
  },
  heroImage: {
    width: '100%',
    height: 250,
  },
  heroPlaceholder: {
    width: '100%',
    height: 250,
    backgroundColor: '#1A2744',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  placeholderText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  heroLoadingOverlay: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attributionBar: {
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  attributionText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  heroStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  heroStatusText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 12,
  },
  body: {
    padding: 24,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.card,
    borderRadius: 10,
  },
  galleryButtonText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  editButtonText: {
    color: Colors.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
  tripTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  dateText: {
    fontSize: 14,
  },
  starsRow: {
    marginTop: 16,
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  backButtonText: {
    color: Colors.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    backgroundColor: Colors.accent,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteButtonText: {
    color: Colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerButton: {
    marginRight: 8,
    padding: 4,
  },
});

import { useState } from 'react';
import { Alert, Animated, Dimensions, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTrips } from '@/contexts/TripContext';
import { useImagePicker } from '@/hooks/useImagePicker';
import { useScrollFab } from '@/hooks/useScrollFab';
import { deleteImage } from '@/utils/imageStorage';
import PhotoViewerModal from '@/components/PhotoViewerModal';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');
const THUMB_SIZE = (width - 16) / 3;

export default function GalleryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { trips, updateTrip } = useTrips();
  const trip = trips.find((t) => t.id === id);

  const [selectedUri, setSelectedUri] = useState<string | null>(null);
  const { translateY: fabTranslateY, onScroll } = useScrollFab();

  const { handleAddPhoto } = useImagePicker({
    tripId: id,
    onSaved: (uri) => {
      void updateTrip(id, {
        galleryUris: [...(trip?.galleryUris ?? []), uri],
      }).catch((error) => {
        Alert.alert('Could not save photo', String(error));
      });
    },
  });

  const confirmDelete = async (uri: string): Promise<void> => {
    const previousGalleryUris = trip?.galleryUris ?? [];
    const previousImageUri = trip?.imageUri;
    const nextTripPatch = {
      galleryUris: previousGalleryUris.filter((u) => u !== uri),
      imageUri: previousImageUri === uri ? undefined : previousImageUri,
    };

    try {
      await updateTrip(id, nextTripPatch);
    } catch (error) {
      Alert.alert('Could not delete photo', String(error));
      return;
    }

    try {
      await deleteImage(uri);
      setSelectedUri(null);
    } catch (error) {
      if (trip) {
        await updateTrip(id, {
          galleryUris: previousGalleryUris,
          imageUri: previousImageUri,
        }).catch((rollbackError) => {
          console.warn('Failed to roll back gallery deletion.', rollbackError);
        });
      }
      Alert.alert('Could not delete photo', String(error));
    }
  };

  const handleDelete = (uri: string): void => {
    Alert.alert('Delete photo', 'Are you sure?', [
      { text: 'Delete', style: 'destructive', onPress: () => void confirmDelete(uri) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  if (!trip) {
    return (
      <>
        <Stack.Screen options={{ title: 'Gallery' }} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Trip not found.</Text>
        </View>
      </>
    );
  }

  const galleryUris = trip.galleryUris ?? [];
  const photoCount = galleryUris.length;

  return (
    <>
      <Stack.Screen
        options={{ title: `${trip.title} — ${photoCount} photo${photoCount !== 1 ? 's' : ''}` }}
      />

      <View style={styles.screen}>
        <FlatList
          data={galleryUris}
          keyExtractor={(uri) => uri}
          numColumns={3}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          scrollEventThrottle={16}
          onScroll={onScroll}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="images-outline" size={64} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>No photos yet</Text>
              <Text style={styles.emptySubtitle}>Add your first!</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable onPress={() => setSelectedUri(item)}>
              <Image source={{ uri: item }} style={styles.thumb} />
            </Pressable>
          )}
        />

        <Animated.View style={[styles.fab, { transform: [{ translateY: fabTranslateY }] }]}>
          <Pressable style={styles.fabInner} onPress={handleAddPhoto}>
            <Ionicons name="camera-outline" size={28} color={Colors.background} />
          </Pressable>
        </Animated.View>
      </View>

      <PhotoViewerModal
        uri={selectedUri}
        onClose={() => setSelectedUri(null)}
        onDelete={handleDelete}
        onSetAsMain={(uri) => {
          void updateTrip(id, { imageUri: uri })
            .then(() => setSelectedUri(null))
            .catch((error) => {
              Alert.alert('Could not update photo', String(error));
            });
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  grid: {
    padding: 4,
    paddingBottom: 100,
  },
  row: {
    gap: 4,
    marginBottom: 4,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fabInner: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});

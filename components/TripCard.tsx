import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { GestureResponderEvent } from 'react-native';

import { Colors } from '@/constants/Colors';
import type { Trip } from '@/types/trip';

import RatingStars from './RatingStars';

const TRIP_IMAGE_BLURHASH = 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.';

interface TripCardProps {
  trip: Trip;
  onPress: (id: string) => void;
  onDelete?: (id: string) => void;
}

function TripCardComponent({ trip, onPress, onDelete }: TripCardProps) {
  const { id, title, destination, date, rating, imageUri, galleryUris } = trip;
  const galleryCount = galleryUris?.length ?? 0;

  const handlePress = useCallback((): void => {
    onPress(id);
  }, [id, onPress]);

  const handleDeletePress = useCallback(
    (event: GestureResponderEvent): void => {
      event.stopPropagation();
      onDelete?.(id);
    },
    [id, onDelete]
  );

  return (
    <Pressable style={styles.card} onPress={handlePress}>
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={styles.cardImage}
          placeholder={{ blurhash: TRIP_IMAGE_BLURHASH }}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={200}
        />
      ) : null}

      {galleryCount > 0 && (
        <View style={styles.galleryBadge}>
          <Ionicons name="images" size={12} color={Colors.textPrimary} />
          <Text style={styles.galleryBadgeText}>{galleryCount}</Text>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {onDelete ? (
            <Pressable
              onPress={handleDeletePress}
              style={styles.deleteButton}
              accessibilityRole="button"
              accessibilityLabel="Delete trip"
            >
              <Ionicons name="close" size={16} color={Colors.accent} />
            </Pressable>
          ) : null}
        </View>
        <Text style={styles.meta}>
          {destination} | {date}
        </Text>
        <View style={styles.separator} />
        <RatingStars rating={rating} />
      </View>
    </Pressable>
  );
}

export default React.memo(TripCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cardImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  galleryBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 12,
  },
  galleryBadgeText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flex: 1,
  },
  deleteButton: {
    backgroundColor: Colors.accentTransparent,
    padding: 6,
    borderRadius: 12,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  meta: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginVertical: 12,
  },
});

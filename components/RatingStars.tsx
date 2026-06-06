import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ReactElement } from 'react';

import { Colors } from '@/constants/Colors';

interface RatingStarsProps {
  rating: number;
  maxStars?: number;
  onChange?: (rating: number) => void;
  size?: number;
}

export default function RatingStars({
  rating,
  maxStars = 5,
  onChange,
  size = 16,
}: RatingStarsProps) {
  const normalizedRating = Math.max(0, Math.min(rating, maxStars));
  const stars: ReactElement[] = [];

  for (let i = 1; i <= maxStars; i++) {
    const icon = (
      <Ionicons
        name={i <= normalizedRating ? 'star' : 'star-outline'}
        size={size}
        color={Colors.accent}
        style={styles.star}
      />
    );

    stars.push(
      onChange ? (
        <Pressable
          key={i}
          onPress={() => onChange(i)}
          accessibilityRole="button"
          accessibilityLabel={`Rate ${i} star${i === 1 ? '' : 's'}`}
          style={styles.touchTarget}
        >
          {icon}
        </Pressable>
      ) : (
        <View key={i}>{icon}</View>
      )
    );
  }

  return <View style={styles.row}>{stars}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  touchTarget: {
    paddingVertical: 2,
    paddingRight: 4,
  },
  star: {
    marginRight: 4,
  },
});

import { useCallback } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeInDown,
  FadeOutLeft,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import TripCard from '@/components/TripCard';
import type { Trip } from '@/types/trip';

const DELETE_TRANSLATE_X = -500;
const DELETE_TRANSLATION_THRESHOLD = -80;
const DELETE_VELOCITY_THRESHOLD = -500;

interface AnimatedTripCardProps {
  trip: Trip;
  index: number;
  onDelete: (id: string) => void;
  onPress?: (id: string) => void;
}

export default function AnimatedTripCard({
  trip,
  index,
  onDelete,
  onPress,
}: AnimatedTripCardProps) {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);

  const handlePress = useCallback(
    (id: string): void => {
      onPress?.(id);
    },
    [onPress]
  );

  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
    })
    .onFinalize(() => {
      scale.value = withSpring(1, { damping: 10, stiffness: 200 });
    });

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      translateX.value = event.translationX < 0 ? event.translationX : 0;
    })
    .onEnd((event) => {
      const shouldDelete =
        event.translationX < DELETE_TRANSLATION_THRESHOLD ||
        event.velocityX < DELETE_VELOCITY_THRESHOLD;

      if (shouldDelete) {
        translateX.value = withTiming(DELETE_TRANSLATE_X, { duration: 250 }, (finished) => {
          if (finished) {
            runOnJS(onDelete)(trip.id);
          }
        });
        return;
      }

      translateX.value = withSpring(0);
    });

  const composedGesture = Gesture.Simultaneous(tapGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).springify()}
      exiting={FadeOutLeft.springify()}
      style={animatedStyle}
    >
      <GestureDetector gesture={composedGesture}>
        <TripCard trip={trip} onPress={handlePress} onDelete={onDelete} />
      </GestureDetector>
    </Animated.View>
  );
}

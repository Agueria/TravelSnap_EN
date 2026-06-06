import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Colors } from '@/constants/Colors';

interface FABProps {
  onPress: () => void;
}

export default function FAB({ onPress }: FABProps) {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
  }, [scale]);

  const tapGesture = Gesture.Tap().onEnd(() => {
    rotation.value = withSequence(
      withTiming(45, { duration: 120 }),
      withTiming(0, { duration: 160 })
    );
    runOnJS(onPress)();
  });

  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View
        accessibilityLabel="Add trip"
        accessibilityRole="button"
        style={[styles.fab, fabStyle]}
      >
        <Ionicons name="add" size={28} color={Colors.background} />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
});

import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/Colors';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export default function OfflineBanner() {
  const { isOffline } = useOnlineStatus();
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(isOffline ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isOffline ? 1 : 0, { duration: 220 });
  }, [isOffline, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * -48 }],
  }));

  return (
    <Animated.View
      accessibilityRole="alert"
      pointerEvents={isOffline ? 'auto' : 'none'}
      style={[
        styles.banner,
        { paddingTop: Math.max(insets.top, 8) + 8 },
        animatedStyle,
      ]}
    >
      <Text style={styles.title}>You are offline</Text>
      <Text style={styles.subtitle}>Showing saved data</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: Colors.accent,
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.textPrimary,
    fontSize: 12,
    marginTop: 2,
    opacity: 0.85,
    textAlign: 'center',
  },
});

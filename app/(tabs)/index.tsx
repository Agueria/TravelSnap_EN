import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import type { ListRenderItemInfo } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import AnimatedTripCard from '@/components/AnimatedTripCard';
import FAB from '@/components/FAB';
import ScreenHeader from '@/components/ScreenHeader';
import TripStats from '@/components/TripStats';
import EmptyState from '@/components/ui/EmptyState';
import { Colors } from '@/constants/Colors';
import { useTrips } from '@/contexts/TripContext';
import type { Trip } from '@/types/trip';

export default function HomeScreen() {
  const { trips, deleteTrip, loading } = useTrips();
  const router = useRouter();

  const sortedTrips = useMemo(() => {
    return [...trips].sort((a, b) => b.rating - a.rating);
  }, [trips]);

  const handleTripPress = useCallback(
    (id: string) => {
      router.push({ pathname: '/trip/[id]', params: { id } });
    },
    [router]
  );

  const handleDeleteTrip = useCallback(
    (id: string) => {
      void deleteTrip(id);
    },
    [deleteTrip]
  );

  const handleAddTrip = useCallback(() => {
    router.push('/add-trip');
  }, [router]);

  const renderTrip = useCallback(
    ({ item, index }: ListRenderItemInfo<Trip>) => (
      <AnimatedTripCard
        trip={item}
        index={index}
        onPress={handleTripPress}
        onDelete={handleDeleteTrip}
      />
    ),
    [handleDeleteTrip, handleTripPress]
  );

  const renderHeader = useCallback(() => <TripStats trips={trips} />, [trips]);

  const renderEmpty = useCallback(
    () => (
      <EmptyState
        icon="airplane-outline"
        title="No trips yet"
        subtitle="Add your first trip!"
      />
    ),
    []
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader tripCount={trips.length} />
      <Animated.FlatList
        data={sortedTrips}
        keyExtractor={(item) => item.id}
        renderItem={renderTrip}
        itemLayoutAnimation={LinearTransition.springify()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.content}
        style={styles.container}
        initialNumToRender={10}
        windowSize={5}
        maxToRenderPerBatch={8}
        removeClippedSubviews={Platform.OS === 'android'}
      />

      <FAB onPress={handleAddTrip} />
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
    paddingBottom: 96,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

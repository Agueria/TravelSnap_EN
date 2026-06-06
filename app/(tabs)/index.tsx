import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, FlatList, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenHeader from '@/components/ScreenHeader';
import TripCard from '@/components/TripCard';
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
    ({ item }: { item: Trip }) => (
      <TripCard trip={item} onPress={handleTripPress} onDelete={handleDeleteTrip} />
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
      <FlatList
        data={sortedTrips}
        keyExtractor={(item) => item.id}
        renderItem={renderTrip}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.content}
        style={styles.container}
        initialNumToRender={10}
        windowSize={5}
        maxToRenderPerBatch={8}
        removeClippedSubviews={Platform.OS === 'android'}
      />

      <Pressable style={styles.fab} onPress={handleAddTrip}>
        <Ionicons name="add" size={28} color={Colors.background} />
      </Pressable>
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

import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DestinationCard, { type Destination } from '@/components/DestinationCard';
import { Colors } from '@/constants/Colors';

const POPULAR_DESTINATIONS: Destination[] = [
  {
    id: 'paris-france',
    name: 'Paris, France',
    description: 'Museums, riverside walks, and classic city views.',
  },
  {
    id: 'cappadocia-turkey',
    name: 'Cappadocia, Turkey',
    description: 'Valleys, cave towns, and sunrise balloon routes.',
  },
  {
    id: 'kyoto-japan',
    name: 'Kyoto, Japan',
    description: 'Temples, gardens, tea houses, and quiet lanes.',
  },
  {
    id: 'rome-italy',
    name: 'Rome, Italy',
    description: 'Historic streets, ruins, fountains, and food stops.',
  },
  {
    id: 'marrakesh-morocco',
    name: 'Marrakesh, Morocco',
    description: 'Markets, courtyards, gardens, and warm colors.',
  },
];

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Ionicons name="compass" size={28} color={Colors.primary} />
          <View style={styles.headerText}>
            <Text style={styles.title}>Explore</Text>
            <Text style={styles.subtitle}>Popular destinations for your next trip</Text>
          </View>
        </View>

        {POPULAR_DESTINATIONS.map((destination) => (
          <DestinationCard key={destination.id} destination={destination} />
        ))}
      </ScrollView>
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
    paddingBottom: 32,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
});

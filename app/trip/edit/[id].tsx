import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import ErrorView from '@/components/ErrorView';
import TripFormFields from '@/components/TripFormFields';
import { Colors } from '@/constants/Colors';
import { useTrips } from '@/contexts/TripContext';
import { tripSchema } from '@/types/tripSchema';
import type { TripFormData } from '@/types/tripSchema';

const defaultValues: TripFormData = {
  title: '',
  destination: '',
  date: '',
  rating: 3,
  imageUri: undefined,
  galleryUris: [],
};

export default function EditTripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { trips, loading, updateTrip } = useTrips();
  const router = useRouter();
  const trip = useMemo(() => trips.find((item) => item.id === id), [trips, id]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
    mode: 'onBlur',
    defaultValues,
  });

  useEffect(() => {
    if (!trip) {
      return;
    }

    reset({
      title: trip.title,
      destination: trip.destination,
      date: trip.date,
      rating: trip.rating,
      imageUri: trip.imageUri,
      galleryUris: trip.galleryUris,
    });
  }, [trip, reset]);

  const onSubmit = async (data: TripFormData): Promise<void> => {
    if (!trip) {
      return;
    }

    try {
      await updateTrip(trip.id, data);
      router.back();
    } catch (err) {
      Alert.alert('Could not update', String(err));
    }
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Edit trip' }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </>
    );
  }

  if (!trip) {
    return (
      <>
        <Stack.Screen options={{ title: 'Edit trip' }} />
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

  return (
    <>
      <Stack.Screen options={{ title: 'Edit trip' }} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.form}>
          <Text style={styles.formTitle}>Edit trip</Text>

          <TripFormFields control={control} />

          <Pressable
            style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Colors.background} />
            ) : (
              <Text style={styles.saveButtonText}>Update trip</Text>
            )}
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
  },
  form: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.textPrimary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: Colors.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

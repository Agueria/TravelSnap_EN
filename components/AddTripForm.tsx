import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';

import TripFormFields from '@/components/TripFormFields';
import { Colors } from '@/constants/Colors';
import { useTrips } from '@/contexts/TripContext';
import { useImagePicker } from '@/hooks/useImagePicker';
import type { TripCoordinates } from '@/types/trip';
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

async function geocodeDestination(
  destination: string
): Promise<TripCoordinates | undefined> {
  try {
    const [result] = await Location.geocodeAsync(destination);

    if (!result) {
      return undefined;
    }

    return {
      latitude: result.latitude,
      longitude: result.longitude,
    };
  } catch (error) {
    console.warn('Failed to geocode destination.', error);
    return undefined;
  }
}

export default function AddTripForm() {
  const [tripId] = useState(() => Date.now().toString());
  const { addTrip } = useTrips();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
    mode: 'onBlur',
    defaultValues,
  });

  const { handleAddPhoto } = useImagePicker({
    tripId,
    onSaved: (uri) => {
      setValue('imageUri', uri, { shouldDirty: true, shouldValidate: true });
      setValue('galleryUris', [uri], { shouldDirty: true });
    },
    aspect: [16, 9],
  });

  const onSubmit = async (data: TripFormData): Promise<void> => {
    try {
      const coordinates = await geocodeDestination(data.destination);
      const tripData: TripFormData = coordinates ? { ...data, coordinates } : data;

      await addTrip(tripData, tripId);
      reset(defaultValues);
      router.back();
    } catch (err) {
      Alert.alert('Could not save', String(err));
    }
  };

  return (
    <View style={styles.form}>
      <Text style={styles.formTitle}>Add new trip</Text>

      <TripFormFields control={control} />

      <Controller
        control={control}
        name="imageUri"
        render={({ field }) =>
          field.value ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: field.value }} style={styles.preview} />
              <Pressable style={styles.changePhotoButton} onPress={handleAddPhoto}>
                <Text style={styles.changePhotoText}>Change photo</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.photoPlaceholder} onPress={handleAddPhoto}>
              <Ionicons name="camera-outline" size={32} color={Colors.textSecondary} />
              <Text style={styles.photoPlaceholderText}>Add a photo</Text>
            </Pressable>
          )
        }
      />

      <Pressable
        style={[styles.addButton, isSubmitting && styles.addButtonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color={Colors.background} />
        ) : (
          <Text style={styles.addButtonText}>Save</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.textPrimary,
  },
  photoPlaceholder: {
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    borderStyle: 'dashed',
    borderRadius: 8,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  photoPlaceholderText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  previewContainer: {
    marginBottom: 12,
    gap: 8,
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  changePhotoButton: {
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.inputBg,
  },
  changePhotoText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    color: Colors.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

import { Controller } from 'react-hook-form';
import type { Control } from 'react-hook-form';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import RatingStars from '@/components/RatingStars';
import { Colors } from '@/constants/Colors';
import type { TripFormData } from '@/types/tripSchema';

interface TripFormFieldsProps {
  control: Control<TripFormData>;
}

export default function TripFormFields({ control }: TripFormFieldsProps) {
  return (
    <>
      <Controller
        control={control}
        name="title"
        render={({ field, fieldState }) => (
          <View style={styles.field}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={[styles.input, fieldState.error && styles.inputError]}
              placeholder="Trip title"
              placeholderTextColor={Colors.textSecondary}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              returnKeyType="next"
            />
            {fieldState.error ? (
              <Text style={styles.errorText}>{fieldState.error.message}</Text>
            ) : null}
          </View>
        )}
      />

      <Controller
        control={control}
        name="destination"
        render={({ field, fieldState }) => (
          <View style={styles.field}>
            <Text style={styles.label}>Destination</Text>
            <TextInput
              style={[styles.input, fieldState.error && styles.inputError]}
              placeholder="City, Country"
              placeholderTextColor={Colors.textSecondary}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              returnKeyType="next"
            />
            {fieldState.error ? (
              <Text style={styles.errorText}>{fieldState.error.message}</Text>
            ) : null}
          </View>
        )}
      />

      <Controller
        control={control}
        name="date"
        render={({ field, fieldState }) => (
          <View style={styles.field}>
            <Text style={styles.label}>Date</Text>
            <TextInput
              style={[styles.input, fieldState.error && styles.inputError]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.textSecondary}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              autoCapitalize="none"
              keyboardType="numbers-and-punctuation"
              returnKeyType="done"
            />
            {fieldState.error ? (
              <Text style={styles.errorText}>{fieldState.error.message}</Text>
            ) : null}
          </View>
        )}
      />

      <Controller
        control={control}
        name="rating"
        render={({ field, fieldState }) => (
          <View style={styles.field}>
            <Text style={styles.label}>Rating</Text>
            <View style={[styles.ratingInput, fieldState.error && styles.inputError]}>
              <RatingStars rating={field.value} size={28} onChange={field.onChange} />
            </View>
            {fieldState.error ? (
              <Text style={styles.errorText}>{fieldState.error.message}</Text>
            ) : null}
          </View>
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 12,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  inputError: {
    borderColor: Colors.accent,
    borderWidth: 1.5,
  },
  errorText: {
    color: Colors.accent,
    fontSize: 12,
    marginTop: 4,
  },
  ratingInput: {
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 8,
    padding: 12,
  },
});

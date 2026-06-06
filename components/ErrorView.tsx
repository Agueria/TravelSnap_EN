import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/Colors';

interface ErrorViewProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export default function ErrorView({
  message,
  onRetry,
  retryLabel = 'Try again',
}: ErrorViewProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle" size={56} color={Colors.accent} />
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <Pressable style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>{retryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    padding: 24,
    gap: 16,
  },
  message: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  buttonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

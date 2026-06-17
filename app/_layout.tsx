import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import OfflineBanner from '@/components/OfflineBanner';
import { TripProvider } from '@/contexts/TripContext';
import { Colors } from '@/constants/Colors';
import { QueryProvider } from '@/providers/QueryProvider';

const darkHeaderOptions = {
  headerStyle: { backgroundColor: Colors.background },
  headerTintColor: Colors.primary,
};

export default function RootLayout() {
  return (
    <QueryProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <TripProvider>
          <Stack screenOptions={darkHeaderOptions}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="trip/[id]"
              options={{
                title: 'Trip Details',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="add-trip"
              options={{
                title: 'Add Trip',
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="trip/gallery/[id]"
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="trip/edit/[id]"
              options={{
                title: 'Edit Trip',
                animation: 'slide_from_right',
              }}
            />
          </Stack>
          <OfflineBanner />
          <StatusBar style="light" />
        </TripProvider>
      </GestureHandlerRootView>
    </QueryProvider>
  );
}

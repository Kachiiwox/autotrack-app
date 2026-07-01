import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme, View, StyleSheet } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { SyncStatusProvider } from '@/components/SyncStatusContext';
import SyncIndicator from '@/components/SyncIndicator';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SyncStatusProvider>
        <View style={{ flex: 1 }}>
          <AnimatedSplashOverlay />
          <Stack>
            <Stack.Screen name="index" options={{ title: 'Home', headerShown: false }} />
            <Stack.Screen name="explore" options={{ title: 'Explore' }} />
            <Stack.Screen name="customers" options={{ title: 'Customers & Vehicles' }} />
            <Stack.Screen name="repair-jobs" options={{ title: 'Repair Jobs' }} />
            <Stack.Screen name="work-orders" options={{ title: 'Mechanic Tasks' }} />
          </Stack>
          <View style={styles.syncContainer}>
            <SyncIndicator />
          </View>
        </View>
      </SyncStatusProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  syncContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 999
  }
});

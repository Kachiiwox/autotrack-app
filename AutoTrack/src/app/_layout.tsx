import { DarkTheme, DefaultTheme, ThemeProvider, Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme, View, StyleSheet } from 'react-native';
import { useEffect } from 'react';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { SyncStatusProvider } from '@/components/SyncStatusContext';
import SyncIndicator from '@/components/SyncIndicator';
import { AuthProvider, useAuth } from '@/components/AuthContext';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === 'login';

    if (!user && !inAuthGroup) {
      router.replace('/login');
    } else if (user && inAuthGroup) {
      router.replace('/');
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return <View style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }} />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SyncStatusProvider>
        <View style={{ flex: 1 }}>
          <AnimatedSplashOverlay />
          <Stack>
            <Stack.Screen name="index" options={{ title: 'Home', headerShown: false }} />
            <Stack.Screen name="login" options={{ title: 'Login', headerShown: false }} />
            <Stack.Screen name="explore" options={{ title: 'Explore' }} />
            <Stack.Screen name="customers" options={{ title: 'Customers & Vehicles' }} />
            <Stack.Screen name="repair-jobs" options={{ title: 'Repair Jobs' }} />
            <Stack.Screen name="work-orders" options={{ title: 'Mechanic Tasks' }} />
          </Stack>
          {user && (
            <View style={styles.syncContainer}>
              <SyncIndicator />
            </View>
          )}
        </View>
      </SyncStatusProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
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

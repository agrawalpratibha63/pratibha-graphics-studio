import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Syne_700Bold,
  Syne_800ExtraBold,
} from '@expo-google-fonts/syne';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LoadingBlock } from '@/components/ui';
import { colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export { ErrorBoundary } from 'expo-router';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === 'login';
    if (!user && !inAuth) {
      router.replace('/login');
    } else if (user && inAuth) {
      router.replace('/(tabs)');
    }
  }, [loading, user, segments, router]);

  if (loading) return <LoadingBlock />;
  return <>{children}</>;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Syne_700Bold,
    Syne_800ExtraBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <AuthGate>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.bgElevated },
            headerTintColor: colors.text,
            headerTitleStyle: { fontFamily: 'Syne_700Bold' },
            contentStyle: { backgroundColor: colors.bg },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="work/[id]" options={{ title: 'Work' }} />
          <Stack.Screen name="upload" options={{ title: 'Upload work', presentation: 'modal' }} />
          <Stack.Screen name="edit-work/[id]" options={{ title: 'Edit work' }} />
          <Stack.Screen name="categories" options={{ title: 'Categories' }} />
          <Stack.Screen name="edit-intro" options={{ title: 'Edit intro' }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </AuthGate>
    </AuthProvider>
  );
}

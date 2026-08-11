import { Oswald_500Medium, Oswald_700Bold, useFonts } from '@expo-google-fonts/oswald';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useAuth } from '@/src/viewmodels/useAuth';
import { CompleteProfileScreen } from '@/src/views/CompleteProfileScreen';
import { LoginScreen } from '@/src/views/LoginScreen';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Oswald_500Medium,
    Oswald_700Bold,
  });

  const { status, error, signUp, signIn, completeProfile } = useAuth();

  useEffect(() => {
    if (fontsLoaded && status !== 'loading') {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, status]);

  if (!fontsLoaded || status === 'loading') {
    return null;
  }

  if (status === 'signed_out') {
    return (
      <ThemeProvider value={DefaultTheme}>
        <LoginScreen onSignUp={signUp} onSignIn={signIn} error={error} />
        <StatusBar style="dark" />
      </ThemeProvider>
    );
  }

  if (status === 'needs_profile') {
    return (
      <ThemeProvider value={DefaultTheme}>
        <CompleteProfileScreen onComplete={completeProfile} error={error} />
        <StatusBar style="dark" />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="player/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="privacy" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
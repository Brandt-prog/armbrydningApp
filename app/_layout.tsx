import { Oswald_500Medium, Oswald_700Bold, useFonts } from '@expo-google-fonts/oswald';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { DismissKeyboardView } from '@/src/components/DismissKeyboardView';
import { useAuth } from '@/src/viewmodels/useAuth';
import { CompleteProfileScreen } from '@/src/views/CompleteProfileScreen';
import { LoginScreen } from '@/src/views/LoginScreen';
import { PendingApprovalScreen } from '@/src/views/PendingApprovalScreen';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Oswald_500Medium,
    Oswald_700Bold,
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
  });

  const { status, error, signUp, signIn, completeProfile, currentUser, signOut } = useAuth();

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
        <DismissKeyboardView>
          <LoginScreen onSignUp={signUp} onSignIn={signIn} error={error} />
        </DismissKeyboardView>
        <StatusBar style="dark" />
      </ThemeProvider>
    );
  }

  if (status === 'needs_profile') {
    return (
      <ThemeProvider value={DefaultTheme}>
        <DismissKeyboardView>
          <CompleteProfileScreen onComplete={completeProfile} error={error} />
        </DismissKeyboardView>
        <StatusBar style="dark" />
      </ThemeProvider>
    );
  }

  if (status === 'signed_in' && currentUser?.status === 'pending_approval') {
    return (
      <ThemeProvider value={DefaultTheme}>
        <PendingApprovalScreen onSignOut={signOut} />
        <StatusBar style="dark" />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <DismissKeyboardView>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="player/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="privacy" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="how-ranking-works" options={{ presentation: 'modal', headerShown: false }} />
        </Stack>
      </DismissKeyboardView>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
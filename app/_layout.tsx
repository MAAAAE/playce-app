import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ImageBackground, StatusBar } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import { Asset } from 'expo-asset';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Prevent the native splash screen from auto-hiding.
SplashScreen.preventAutoHideAsync();

// Custom Splash Screen Component (UI only)
const SplashScreenComponent = () => {
  const titleY = useSharedValue(30);
  const titleOpacity = useSharedValue(0);
  const subtitleY = useSharedValue(30);
  const subtitleOpacity = useSharedValue(0);

  useEffect(() => {
    titleY.value = withDelay(500, withTiming(0, { duration: 800 }));
    titleOpacity.value = withDelay(500, withTiming(1, { duration: 800 }));
    subtitleY.value = withDelay(1000, withTiming(0, { duration: 800 }));
    subtitleOpacity.value = withDelay(1000, withTiming(1, { duration: 800 }));
  }, []);

  const animatedTitleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const animatedSubtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleY.value }],
  }));

  return (
    <ImageBackground 
      source={require('../assets/images/namsan_final.png')} 
      style={styles.background}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Animated.View style={animatedTitleStyle}>
            <Text style={styles.title}>Play:ce</Text>
          </Animated.View>
          <Animated.View style={animatedSubtitleStyle}>
            <Text style={styles.subtitle}>When Every Place Has a Song</Text>
          </Animated.View>
        </View>
      </View>
    </ImageBackground>
  );
};

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [isSplashFinished, setSplashFinished] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    'Outfit-Medium': require('../assets/fonts/Outfit-Medium.ttf'),
    'Pretendard-Bold': require('../assets/fonts/Pretendard-Bold.ttf'),
    'Pretendard-Regular': require('../assets/fonts/Pretendard-Regular.ttf'),
    'Pretendard-SemiBold': require('../assets/fonts/Pretendard-SemiBold.ttf'),
    'Pretendard-Medium': require('../assets/fonts/Pretendard-Medium.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts and images
        await Asset.fromModule(require('../assets/images/namsan_final.png')).downloadAsync();
        // Artificially delay for two seconds to simulate a slow loading
        // experience. Please remove this if you copy this code.
        // await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        if (fontsLoaded || !fontError) {
            setAppIsReady(true);
        }
      }
    }

    if (fontsLoaded || fontError) {
        prepare();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (appIsReady) {
      const timer = setTimeout(() => setSplashFinished(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [appIsReady]);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      {isSplashFinished ? <RootLayoutNav /> : <SplashScreenComponent />}
    </View>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  titleContainer: {
    position: 'absolute',
    left: '40%',
    transform: [{ translateX: -50 }],
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 48,
    fontFamily: 'Outfit-Medium',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
    color: Colors.secondaryText,
    marginTop: 8,
  },
});
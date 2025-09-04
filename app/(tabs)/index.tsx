import React, { useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar, TouchableWithoutFeedback, Platform, Keyboard, Dimensions, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Tabs } from 'expo-router';
import WaveBackground from '../../components/WaveBackground';
import AppHeader from '../../components/AppHeader';
import MainContent from '../../components/MainContent';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, useDerivedValue } from 'react-native-reanimated';
import { Place } from '@/data/Data';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchAnimation } from '@/hooks/useSearchAnimation';
import PlayceAPI from '@/services/api';

const MainScreen: React.FC = () => {
  const { handleFocus, handleBlur, topContainerAnimatedStyle, bottomContainerAnimatedStyle } = useSearchAnimation();
  const insets = useSafeAreaInsets();
  const [focused, setFocused] = useState(false);
  const [searchText, setSearchText] = useState('');
  const debouncedSearchText = useDebounce(searchText, 500);
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // Keyboard animation shared value
  const keyboardHeight = useSharedValue(0);
  const contentHeight = useSharedValue(0);
  const animatedShift = useSharedValue(0); // final shift applied
  const topInsetSV = useSharedValue(insets.top || 0);
  const bottomInsetSV = useSharedValue(insets.bottom || 0);
  const windowHeight = Dimensions.get('window').height;

  // Update inset shared values if they change
  useEffect(() => {
    topInsetSV.value = insets.top || 0;
    bottomInsetSV.value = insets.bottom || 0;
  }, [insets.top, insets.bottom, topInsetSV, bottomInsetSV]);

  // Derive target shift so that content never crosses safe area top (웹에서는 비활성화)
  useDerivedValue(() => {
    if (Platform.OS === 'web') {
      // 웹에서는 키보드 애니메이션 계산하지 않음
      return;
    }
    
    const topPadding = topInsetSV.value;
    const headerSpace = 46; // header height from AppHeader component
    const safeContentTop = topPadding + headerSpace;
    const bottomPadding = bottomInsetSV.value;
    const availableHeight = windowHeight - safeContentTop - bottomPadding - keyboardHeight.value;
    
    let targetShift = 0;
    if (keyboardHeight.value > 0 && contentHeight.value > availableHeight) {
      const needed = contentHeight.value - availableHeight;
      // Conservative shift - never more than 40% of keyboard height to avoid header overlap
      targetShift = Math.min(needed, keyboardHeight.value * 0.4);
    }
    animatedShift.value = withTiming(targetShift, { duration: 300, easing: Easing.out(Easing.cubic) });
  });

  const animatedKeyboardStyle = useAnimatedStyle(() => {
    if (Platform.OS === 'web') {
      // 웹에서는 키보드 애니메이션 없음
      return {};
    }
    return {
      transform: [{ translateY: -animatedShift.value }],
    };
  });

  // 인기 장소 데이터
  const popularPlaces = [
    { name: 'Gyeongbokgung', imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop&q=80' },
    { name: 'Bukchon', imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=250&fit=crop&q=80' },
    { name: 'Gangnam', imageUrl: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=400&h=250&fit=crop&q=80' },
    { name: 'Hongdae', imageUrl: 'https://images.unsplash.com/photo-1574594723019-f47c3cbb7d6e?w=400&h=250&fit=crop&q=80' },
    { name: 'Myeongdong', imageUrl: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400&h=250&fit=crop&q=80' },
  ];

  const onFocus = () => { handleFocus(); setFocused(true); };
  const onBlur = () => { handleBlur(); setFocused(false); };

  const performSearch = async (text: string) => {
    if (text.length > 0) {
      setIsLoading(true);
      try {
        const results = await PlayceAPI.search.searchAttractions(text);
        setSuggestions(results);
      } catch (error) {
        console.error('Search failed:', error);
        Alert.alert('Search Failed', 'An error occurred while searching. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setSuggestions([]);
    }
  };

  useEffect(() => {
    performSearch(debouncedSearchText);
  }, [debouncedSearchText]);

  const handleSearchSubmit = () => {
    performSearch(searchText);
  };

  // Keyboard show/hide listeners with smooth animation (웹에서는 비활성화)
  useEffect(() => {
    if (Platform.OS === 'web') {
      // 웹에서는 키보드 애니메이션 비활성화
      return;
    }
    
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const h = e?.endCoordinates?.height || 0;
      keyboardHeight.value = h; // raw height; smoothing handled in derived shift
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      keyboardHeight.value = 0;
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardHeight]);



  return (
      <>
        <Tabs.Screen options={{ headerShown: false, tabBarStyle: { display: 'none' } }} />
        <TouchableWithoutFeedback onPress={onBlur}>
          <LinearGradient
            colors={Colors.backgroundGradient}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
              <View style={styles.dimOverlay} />
              <WaveBackground />
            <StatusBar barStyle="light-content" />
            <View style={[styles.safeAreaLike, { paddingTop: insets.top || 0, paddingBottom: insets.bottom || 0 }]}>
              <AppHeader />
              <Animated.View style={[styles.animatedContentWrapper, animatedKeyboardStyle]} onLayout={(e) => { contentHeight.value = e.nativeEvent.layout.height; }}>
                <MainContent
                  focused={focused}
                  topContainerAnimatedStyle={topContainerAnimatedStyle}
                  bottomContainerAnimatedStyle={bottomContainerAnimatedStyle}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  onChangeText={setSearchText}
                  onSubmitEditing={handleSearchSubmit}
                  suggestions={suggestions}
                  isLoading={isLoading}
                  popularPlaces={popularPlaces}
                  searchText={searchText}
                />
              </Animated.View>
            </View>
          </LinearGradient>
        </TouchableWithoutFeedback>
      </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  dimOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  safeAreaLike: {
    flex: 1,
    width: '100%',
  },
  animatedContentWrapper: {
    flex: 1,
    marginTop: -150,
  },
});

export default MainScreen;

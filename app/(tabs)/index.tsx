import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableWithoutFeedback, ScrollView, Platform, Keyboard, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Tabs } from 'expo-router';
import SearchBar from '../../components/SearchBar';
import WaveBackground from '../../components/WaveBackground';
import PlaceCard from '../../components/PlaceCard';
import Animated, { Layout, useSharedValue, useAnimatedStyle, withTiming, Easing, useDerivedValue } from 'react-native-reanimated';
import { MOCK_PLACES, Place } from '@/data/mockData';
import SearchSuggestions from '@/components/SearchSuggestions';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchAnimation } from '@/hooks/useSearchAnimation';

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

    // Derive target shift so that content never crosses safe area top
  useDerivedValue(() => {
    const topPadding = topInsetSV.value + 32; // matches paddingTop usage
    const headerSpace = 60; // estimated header height + desired gap
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

  const animatedKeyboardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -animatedShift.value }],
  }));

  // 인기 장소 데이터
  const popularPlaces = [
    { name: 'Gyeongbokgung', imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400' },
    { name: 'Bukchon', imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400' },
    { name: 'Gangnam', imageUrl: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=400' },
  ];

  const onFocus = () => { handleFocus(); setFocused(true); };
  const onBlur = () => { handleBlur(); setFocused(false); };

  // debouncedSearchText 변화 시 검색
  useEffect(() => {
    if (debouncedSearchText.length > 0) {
      const filtered = MOCK_PLACES.filter(place =>
          place.name.toLowerCase().includes(debouncedSearchText.toLowerCase())
      );
      setSuggestions(filtered);
      setIsLoading(false); // 검색 완료 -> 로딩 상태 OFF

    } else {
      setSuggestions([]);
      setIsLoading(false); // 검색어가 없으면 로딩 비활성화

    }
  }, [debouncedSearchText]); // 의존성 배열을 debouncedSearchText로 변경

  // Keyboard show/hide listeners with smooth animation
  useEffect(() => {
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
            <View style={[styles.safeAreaLike, { paddingTop: (insets.top || 0) + 32, paddingBottom: insets.bottom || 0 }]}> 
                            <View style={styles.header}>
                <Text style={styles.logoText}>Play:ce</Text>
              </View>
              <Animated.View style={[styles.animatedContentWrapper, animatedKeyboardStyle]} onLayout={(e) => { contentHeight.value = e.nativeEvent.layout.height; }}>
                <View style={[styles.content, !focused && styles.contentCentered]}> 
                                    <Animated.View
                    style={[styles.topContainer, topContainerAnimatedStyle, !focused && styles.topInitialPosition]}
                  >
                    <Text style={styles.title}>Experience Korea,</Text>
                    <Text style={[styles.title, styles.secondaryTitle]}>Explore K-POP</Text>
                  </Animated.View>
                  <Animated.View
                    style={[styles.bottomContainer, bottomContainerAnimatedStyle, !focused && styles.bottomInitialPosition]}
                  >
                    <SearchBar
                      onFocus={onFocus}
                      onBlur={onBlur}
                      onChangeText={setSearchText}
                    />
                    <SearchSuggestions
                      suggestions={suggestions.slice(0, 5)}
                      isLoading={isLoading}
                    />
                    {suggestions.length === 0 && (
                      <View style={styles.popularPlacesContainer}>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.cardsContainer}
                        >
                          {popularPlaces.map((place, index) => (
                            <PlaceCard
                              key={index}
                              name={place.name}
                              imageUrl={place.imageUrl}
                              onPress={() => console.log(`Navigate to ${place.name}`)}
                            />
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </Animated.View>
                </View>
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
  backgroundColor: 'rgba(0,0,0,0.5)', // dim 강도 조절 값 조정 (기존 0.35)
  },
  safeAreaLike: {
    flex: 1,
    width: '100%',
  },
  fixedContentWrapper: {
    flex: 1,
  },
  animatedContentWrapper: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    alignItems: 'center',
    // top padding handled by safeAreaLike
  },
  logoText: {
    color: Colors.logo,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Outfit-Medium',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentCentered: {
    justifyContent: 'center',
  },
  topContainer: {
    justifyContent: 'flex-end',
    paddingBottom: 24,
  },
  bottomContainer: {
    justifyContent: 'flex-start',
  },
  topInitialPosition: { marginBottom: 12 },
  bottomInitialPosition: {},
  title: {
    color: Colors.text,
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: -0.72,
    lineHeight: 45,
    fontFamily: 'Outfit-Bold',
  },
  secondaryTitle: {
    color: Colors.secondaryText,
  },
  popularPlacesContainer: {
    marginTop: 20,
  },
  cardsContainer: {
    paddingHorizontal: 0,
    gap: 8,
  },
});

export default MainScreen;

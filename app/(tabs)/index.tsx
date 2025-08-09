import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableWithoutFeedback, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Tabs } from 'expo-router';
import SearchBar from '../../components/SearchBar';
import WaveBackground from '../../components/WaveBackground';
import PlaceCard from '../../components/PlaceCard';
import Animated, { Layout } from 'react-native-reanimated';
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
              <KeyboardAvoidingView
                  style={styles.fixedContentWrapper}
                  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                  keyboardVerticalOffset={0}
              >
                <View style={styles.header}>
                  <Text style={styles.logoText}>Play:ce</Text>
                </View>
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
              </KeyboardAvoidingView>
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

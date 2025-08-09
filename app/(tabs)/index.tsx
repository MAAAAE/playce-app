import React, {useEffect, useState} from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableWithoutFeedback } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Tabs } from 'expo-router';
import WaveBackground from '../../components/WaveBackground';
import SearchBar from '../../components/SearchBar'; // SearchBar 컴포넌트 import
import { useSearchAnimation } from '@/hooks/useSearchAnimation'; // 커스텀 훅 import
import Animated from 'react-native-reanimated';
import {MOCK_PLACES, Place} from '@/data/mockData';
import SearchSuggestions from "@/components/SearchSuggestions";
import {useDebounce} from "@/hooks/useDebounce";

const MainScreen: React.FC = () => {
  const { handleFocus, handleBlur, topContainerAnimatedStyle, bottomContainerAnimatedStyle } = useSearchAnimation();

  const [searchText, setSearchText] = useState('');

  const debouncedSearchText = useDebounce(searchText, 500); // 500ms 지연된 값

  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

  // 이제 debouncedSearchText가 변경될 때만 목업 데이터를 필터링합니다.
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
        <TouchableWithoutFeedback onPress={handleBlur}>
          <LinearGradient
              colors={Colors.backgroundGradient}
              style={styles.container}
          >
            <WaveBackground />
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.header}>
                <Text style={styles.logoText}>Play;ce</Text>
              </View>
              <View style={styles.content}>
                <Animated.View style={[styles.topContainer, topContainerAnimatedStyle]}>
                  <Text style={styles.title}>Experience Korea,</Text>
                  <Text style={styles.title}>Explore K-POP</Text>
                </Animated.View>

                <Animated.View style={[styles.bottomContainer, bottomContainerAnimatedStyle]}>
                  <SearchBar
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      onChangeText={setSearchText} // 입력값을 state와 연결
                  />
                  <SearchSuggestions suggestions={suggestions.slice(0, 5)}
                                     isLoading={isLoading}
                  />
                </Animated.View>
              </View>
            </SafeAreaView>
          </LinearGradient>
        </TouchableWithoutFeedback>
      </>
  );
};

const styles = StyleSheet.create({
  // 스타일은 이전과 거의 동일합니다.
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  logoText: {
    color: Colors.logo,
    fontSize: 22,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
  },
  topContainer: {
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  bottomContainer: {
    justifyContent: 'flex-start',
  },
  title: {
    color: Colors.text,
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 1,
    lineHeight: 45,
  },
});

export default MainScreen;

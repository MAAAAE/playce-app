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
  const popularPlaces: Place[] = [
    { id: '264337', name: 'Gyeongbokgung', address: '161 Sajik-ro, Jongno-gu, Seoul', image: 'http://tong.visitkorea.or.kr/cms/resource/94/3487594_image2_1.jpg', smallImage: 'http://tong.visitkorea.or.kr/cms/resource/94/3487594_image3_1.jpg', sigunguCode: '11110' },
    {
        "id": "561382",
        "name": "Bukchon Hanok Village (북촌한옥마을)",
        "address": "37 Gyedong-gil, Jongno-gu, Seoul",
        "image": "http://tong.visitkorea.or.kr/cms/resource/04/3304404_image2_1.jpg",
        "smallImage": "http://tong.visitkorea.or.kr/cms/resource/04/3304404_image3_1.jpg",
        "sigunguCode": "11110"
    },
    {
        "id": "264571",
        "name": "Gangnam (강남)",
        "address": "Yeoksam-dong, Gangnam-gu, Seoul",
        "image": "http://tong.visitkorea.or.kr/cms/resource/08/1984608_image2_1.jpg",
        "smallImage": "http://tong.visitkorea.or.kr/cms/resource/08/1984608_image3_1.jpg",
        "sigunguCode": "11680"
    },
    {
        "id": "1326972",
        "name": "Hongdae (Hongik University Street) (홍대)",
        "address": "20 Hongik-ro, Mapo-gu, Seoul",
        "image": "",
        "smallImage": "",
        "sigunguCode": "11440"
    },
    {
        "id": "264312",
        "name": "Myeong-dong (명동)",
        "address": "74, Myeongdong-gil, Jung-gu, Seoul",
        "image": "http://tong.visitkorea.or.kr/cms/resource/85/2932485_image2_1.bmp",
        "smallImage": "http://tong.visitkorea.or.kr/cms/resource/85/2932485_image3_1.bmp",
        "sigunguCode": "11140"
    }
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
    ...(Platform.OS === 'web' && {
      maxWidth: 480, // 모바일웹처럼 최대 너비 제한
      alignSelf: 'center', // 중앙 정렬
    }),
  },
  animatedContentWrapper: {
    flex: 1,
    marginTop: -150,
  },
});

export default MainScreen;

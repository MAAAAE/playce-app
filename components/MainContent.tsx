import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { Colors } from '@/constants/Colors';
import SearchBar from './SearchBar';
import SearchSuggestions from './SearchSuggestions';
import PlaceCard from './PlaceCard';
import Animated from 'react-native-reanimated';
import { Place } from '@/data/Data';

interface MainContentProps {
  focused: boolean;
  topContainerAnimatedStyle: any;
  bottomContainerAnimatedStyle: any;
  onFocus: () => void;
  onBlur: () => void;
  onChangeText: (text: string) => void;
  onSubmitEditing: () => void;
  suggestions: Place[];
  isLoading: boolean;
  popularPlaces: Array<{ name: string; imageUrl: string }>;
  searchText?: string; // 검색어 값을 추가
}

const MainContent: React.FC<MainContentProps> = ({
  focused,
  topContainerAnimatedStyle,
  bottomContainerAnimatedStyle,
  onFocus,
  onBlur,
  onChangeText,
  onSubmitEditing,
  suggestions,
  isLoading,
  popularPlaces,
  searchText,
}) => {
  return (
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
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          value={searchText}
        />
        
        <SearchSuggestions
          suggestions={suggestions}
          isLoading={isLoading}
        />
        
        {suggestions.length === 0 && (
          <View style={styles.popularPlacesContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardsContainer}
              style={Platform.OS === 'web' ? { cursor: 'grab' as any } : {}}
              {...(Platform.OS === 'web' && {
                // 웹에서 마우스 드래그 스크롤을 더 자연스럽게
                decelerationRate: 'normal',
              })}
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
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,
    ...(Platform.OS === 'web' && {
      // 웹에서 좀 더 여유 있는 패딩
      paddingHorizontal: 24,
    }),
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
  topInitialPosition: { 
    marginBottom: 12,
  },
  bottomInitialPosition: {},
  title: {
    color: Colors.text,
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: -0.72,
    lineHeight: 45,
    fontFamily: 'Outfit-Medium',
    ...(Platform.OS === 'web' && {
      // 웹에서 텍스트 선택 방지
      userSelect: 'none' as any,
    }),
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
    ...(Platform.OS === 'web' && {
      // 웹에서 카드 간격 조정
      gap: 12,
    }),
  },
});

export default MainContent;

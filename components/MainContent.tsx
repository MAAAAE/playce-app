import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '@/constants/Colors';
import SearchBar from './SearchBar';
import SearchSuggestions from './SearchSuggestions';
import PlaceCard from './PlaceCard';
import Animated from 'react-native-reanimated';
import { Place } from '@/data/mockData';

interface MainContentProps {
  focused: boolean;
  topContainerAnimatedStyle: any;
  bottomContainerAnimatedStyle: any;
  onFocus: () => void;
  onBlur: () => void;
  onChangeText: (text: string) => void;
  suggestions: Place[];
  isLoading: boolean;
  popularPlaces: Array<{ name: string; imageUrl: string }>;
}

const MainContent: React.FC<MainContentProps> = ({
  focused,
  topContainerAnimatedStyle,
  bottomContainerAnimatedStyle,
  onFocus,
  onBlur,
  onChangeText,
  suggestions,
  isLoading,
  popularPlaces,
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
  );
};

const styles = StyleSheet.create({
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

export default MainContent;

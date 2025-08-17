import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  StatusBar, 
  TouchableOpacity,
  Dimensions,
  Image
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useStreamingPlaylist } from '../hooks/useStreamingPlaylist';
import AppBackground from '@/components/AppBackground';
import ReliableImage from '@/components/ReliableImage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PlaylistGenerationScreen = () => {
  const { place, playlistSize } = useLocalSearchParams<{
    place: string;
    playlistSize?: string;
  }>();
  const placeObject = place ? JSON.parse(place) : null;
  
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const {
    currentSong,
    loading,
    error,
    progress,
    generatePlaylist,
    cancelGeneration,
  } = useStreamingPlaylist();
  
  // 컴포넌트 마운트 시 플레이리스트 생성 시작
  useEffect(() => {
    if (placeObject) {
      const request = {
        destination: placeObject.name,
        season: 'All seasons',
        playlistSize: playlistSize ? parseInt(playlistSize) : 5,
      };
      
      generatePlaylist(request).then((result) => {
        if (result) {
          setTimeout(() => {
            router.replace({
              pathname: "/spot/[id]",
              params: {
                id: 'generated',
                playlistData: JSON.stringify(result),
                place: place,
              },
            });
          }, 1000);
        }
      });
    }
  }, [place, playlistSize]);

  const handleCancel = () => {
    cancelGeneration();
    router.back();
  };
  
  // 진행률 바 애니메이션
  const progressBarStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(`${progress * 100}%`, {
        damping: 20,
        stiffness: 200,
      }),
    };
  });
  
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />
      
      <AppBackground style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleCancel}
          >
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
          
          <Animated.Text 
            entering={FadeIn.delay(300)}
            style={styles.title}
          >
            Creating playlist...
          </Animated.Text>
          
          <View style={{ width: 44 }} />
        </View>
        
        {/* Destination Info */}
        <Animated.View 
          entering={FadeInDown.delay(500)}
          style={styles.destinationContainer}
        >
          <Text style={styles.destinationLabel}>Destination</Text>
          <Text style={styles.destinationText}>{placeObject?.name}</Text>
        </Animated.View>
        
        {/* Progress Bar */}
        <Animated.View 
          entering={FadeInDown.delay(700)}
          style={styles.progressContainer}
        >
          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBar, progressBarStyle]} />
          </View>
          <Text style={styles.progressText}>
            {progress > 0 ? `${Math.floor(progress * 100)}%` : 'Preparing...'}
          </Text>
        </Animated.View>
        
        {/* Current Song Card */}
        <View style={styles.songDisplayContainer}>
          {currentSong && (
            <Animated.View
              key={`${currentSong.title}-${currentSong.artist}`}
              entering={FadeIn.duration(800)}
              style={styles.songCard}
            >
              <View style={styles.albumCover}>
                {currentSong.cover ? (
                  <ReliableImage 
                    uri={currentSong.cover}
                    style={styles.albumImage}
                    fallbackIconSize={40}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.placeholderIcon}>
                    <Ionicons name="musical-note" size={40} color="#1C86A0" />
                  </View>
                )}
              </View>
              
              <View style={styles.songDetails}>
                <Text style={styles.songTitle}>{currentSong.title}</Text>
                <Text style={styles.songArtist}>{currentSong.artist}</Text>
              </View>
              
              <Animated.View 
                entering={FadeIn.delay(600)}
                style={styles.checkIcon}
              >
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              </Animated.View>
            </Animated.View>
          )}
        </View>
        
        {/* Error Display */}
        {error && (
          <Animated.View 
            entering={FadeInDown}
            style={styles.errorContainer}
          >
            <Ionicons name="alert-circle" size={24} color="#FF5252" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleCancel}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </AppBackground>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: Colors.text,
    fontSize: 18,
    fontFamily: 'Outfit-Medium',
    textAlign: 'center',
  },
  destinationContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  destinationLabel: {
    color: Colors.secondaryText,
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    marginBottom: 8,
  },
  destinationText: {
    color: Colors.text,
    fontSize: 24,
    fontFamily: 'Outfit-Medium',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#1C86A0',
  },
  progressText: {
    color: Colors.secondaryText,
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    textAlign: 'center',
  },
  songDisplayContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  songCard: {
    width: SCREEN_WIDTH - 40,
    backgroundColor: Colors.cardBg,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  albumCover: {
    width: 60,
    height: 60,
    backgroundColor: '#1C86A0' + '20',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  albumImage: {
    width: '100%',
    height: '100%',
  },
  placeholderIcon: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  songDetails: {
    flex: 1,
  },
  songTitle: {
    color: Colors.text,
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    marginBottom: 4,
  },
  songArtist: {
    color: Colors.secondaryText,
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
  },
  checkIcon: {
    marginLeft: 12,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
    margin: 20,
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF5252',
  },
  errorText: {
    color: '#FF5252',
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
    textAlign: 'center',
    marginVertical: 12,
  },
  retryButton: {
    backgroundColor: '#1C86A0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
  },
});

export default PlaylistGenerationScreen;

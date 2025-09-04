import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Platform } from 'react-native';
import { Colors } from '@/constants/Colors';

interface PlaceCardProps {
  name: string;
  imageUrl?: string;
  onPress?: () => void;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ name, imageUrl, onPress }) => {
  return (
    <TouchableOpacity 
      style={[styles.container, Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}]} 
      onPress={onPress} 
      activeOpacity={0.85}
    >
      <ImageBackground
        source={imageUrl ? { uri: imageUrl } : undefined}
        style={styles.imageBackground}
        imageStyle={styles.image}
        resizeMode="cover"
      >
        {/* Dim layer over photo */}
        <View style={styles.dimLayer} />
        {/* Title top-left */}
        <Text style={styles.text} numberOfLines={1}>{name}</Text>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 160,
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      // 웹에서 호버 효과를 위한 트랜지션
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      },
    }),
  },
  imageBackground: {
    width: '100%',
    height: '100%',
  },
  image: { borderRadius: 16 },
  dimLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  text: {
    color: Colors.secondaryText,
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Pretendard-Bold',
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 2,
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    ...(Platform.OS === 'web' && {
      // 웹에서 텍스트 선택 방지
      userSelect: 'none' as any,
    }),
  },
});

export default PlaceCard;

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { Colors } from '@/constants/Colors';

interface PlaceCardProps {
  name: string;
  imageUrl?: string;
  onPress?: () => void;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ name, imageUrl, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.85}>
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
  },
});

export default PlaceCard;

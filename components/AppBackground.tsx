import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import WaveBackground from './WaveBackground';

interface AppBackgroundProps {
  children: React.ReactNode;
  style?: any;
}

const AppBackground: React.FC<AppBackgroundProps> = ({ children, style }) => {
  return (
    <LinearGradient
      colors={Colors.backgroundGradient}
      style={[styles.container, style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.dimOverlay} />
      <WaveBackground />
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dimOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});

export default AppBackground;

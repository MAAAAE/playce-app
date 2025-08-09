import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface AppHeaderProps {
  title?: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title = "Play:ce" }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.logoText}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    height: 46,
    justifyContent: 'center',
  },
  logoText: {
    color: Colors.logo,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Outfit-Medium',
  },
});

export default AppHeader;

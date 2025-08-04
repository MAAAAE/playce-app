import React from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors'; // 상수 파일에서 색상 가져오기

const MainScreen: React.FC = () => {
  return (
      <LinearGradient
          colors={Colors.backgroundGradient}
          style={styles.container}
      >
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.safeArea}>
          {/* 상단 로고 */}
          <View style={styles.header}>
            <Text style={styles.logoText}>Play;ce</Text>
          </View>

          {/* 메인 콘텐츠 */}
          <View style={styles.content}>
            <Text style={styles.title}>Experience Korea,</Text>
            <Text style={styles.title}>Explore K-POP</Text>

            {/* 검색창 */}
            <View style={styles.searchBar}>
              <Feather name="search" size={20} color={Colors.searchIcon} style={styles.searchIcon} />
              <TextInput
                  style={styles.input}
                  placeholder="Where to?"
                  placeholderTextColor={Colors.searchBarPlaceholder}
              />
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
  );
};

const styles = StyleSheet.create({
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
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    color: Colors.text,
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 1,
    lineHeight: 45,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.searchBarBg,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginTop: 40,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
  },
});

export default MainScreen;

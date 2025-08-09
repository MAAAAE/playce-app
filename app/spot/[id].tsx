import React from 'react';
import { View, Text, StyleSheet, StatusBar, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import Playlist from '../../components/Playlist';
import CongestionChart from "@/components/congestionChart";
import {MOCK_CHART_DATA} from "@/data/mockData";

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_EXPANDED_HEIGHT = 356;
const HEADER_COLLAPSED_HEIGHT = 100;

// 임시 목업 데이터 (실제로는 id를 사용해 서버에서 가져와야 함)
const MOCK_DATA: { [key: string]: { name: string; imageUrl: string; playlist: { id: string; title: string; artist: string; albumArt?: string; }[] } } = {
    '1': { // Gyeongbokgung
        name: 'Gyeongbokgung',
        imageUrl: 'https://conlab.visitkorea.or.kr/api/depot/public/depot-flow/query/download-image/4bd3982f-59df-47a4-8743-3c609f639ccb/it14',
        playlist: [
            { 
                id: 's1', 
                title: 'Daechwita', 
                artist: 'SUGA of BTS',
                albumArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=300&auto=format&fit=crop'
            },
            { 
                id: 's2', 
                title: 'How You Like That', 
                artist: 'BLACKPINK',
                albumArt: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=300&auto=format&fit=crop'
            },
            { 
                id: 's3', 
                title: 'Dynamite', 
                artist: 'BTS',
                albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300&auto=format&fit=crop'
            },
            { 
                id: 's4', 
                title: 'Next Level', 
                artist: 'aespa',
                albumArt: 'https://images.unsplash.com/photo-1618609378039-b572f64c5b42?q=80&w=300&auto=format&fit=crop'
            },
            { 
                id: 's5', 
                title: 'ON', 
                artist: 'BTS',
                albumArt: 'https://images.unsplash.com/photo-1619983081563-430f63602796?q=80&w=300&auto=format&fit=crop'
            },
        ],
    },
};

const SpotDetailScreen = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const spotData = MOCK_DATA[id] || MOCK_DATA['1']; // id가 없으면 기본값 사용
    const todayIndex = new Date().getDate() - 1; // 오늘 날짜(1~30)를 인덱스(0~29)로

    // Animated scroll value
    const scrollY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    // Header height animation
    const headerHeight = useAnimatedStyle(() => {
        const height = interpolate(
            scrollY.value,
            [0, HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT],
            [HEADER_EXPANDED_HEIGHT, HEADER_COLLAPSED_HEIGHT],
            Extrapolation.CLAMP
        );

        return {
            height,
        };
    });

    // Header title opacity (collapsed state)
    const headerTitleOpacity = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [0, HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT],
            [0, 1],
            Extrapolation.CLAMP
        );

        return {
            opacity,
        };
    });

    // Hero title opacity (expanded state)
    const heroTitleOpacity = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [0, HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT],
            [1, 0],
            Extrapolation.CLAMP
        );

        return {
            opacity,
        };
    });

    // Header background opacity (image visibility)
    const headerBackgroundOpacity = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [0, HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT],
            [1, 0],
            Extrapolation.CLAMP
        );

        return {
            opacity,
        };
    });

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" />
            <View style={styles.container}>
                {/* Animated Header */}
                <Animated.View style={[styles.header, headerHeight, { backgroundColor: '#111111' }]}>
                    {/* Image Background - Only visible when expanded */}
                    <Animated.View style={[styles.imageContainer, headerBackgroundOpacity]}>
                        <ImageBackground 
                            source={{ uri: spotData.imageUrl }} 
                            style={styles.headerBackground}
                            resizeMode="cover"
                        >
                            <LinearGradient
                                colors={['rgba(8,8,8,0)', 'rgba(17,17,17,0.93)']}
                                locations={[0.19, 0.93]}
                                style={styles.headerGradient}
                            />
                        </ImageBackground>
                    </Animated.View>

                    {/* Header Content */}
                    <View style={styles.headerContent}>
                        {/* Collapsed Header Title */}
                        <Animated.View style={[styles.collapsedHeader, { paddingTop: insets.top }, headerTitleOpacity]}>
                            <TouchableOpacity 
                                style={styles.backButton}
                                onPress={() => router.back()}
                            >
                                <Ionicons name="chevron-back" size={24} color={Colors.text} />
                            </TouchableOpacity>
                            <Text style={styles.collapsedTitle}>{spotData.name}</Text>
                            <View style={{ width: 44 }} />
                        </Animated.View>

                        {/* Hero Back Button - Independent positioning */}
                        <Animated.View style={[styles.heroBackButtonContainer, { paddingTop: insets.top }, heroTitleOpacity]}>
                            <TouchableOpacity 
                                style={styles.heroBackButton}
                                onPress={() => router.back()}
                            >
                                <Ionicons name="chevron-back" size={24} color={Colors.text} />
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Hero Title */}
                        <Animated.View style={[styles.heroTitleContainer, heroTitleOpacity]}>
                            <Text style={styles.heroTitle}>{spotData.name}</Text>
                        </Animated.View>
                    </View>
                </Animated.View>

                {/* Scrollable Content */}
                <Animated.ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[styles.scrollContent, { paddingTop: HEADER_EXPANDED_HEIGHT }]}
                    onScroll={scrollHandler}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentContainer}>
                        <Playlist songs={spotData.playlist} />
                        <CongestionChart data={MOCK_CHART_DATA} currentIndex={todayIndex} />
                        
                        {/* Bottom gradient overlay */}
                        <LinearGradient
                            colors={['rgba(8,8,8,0)', '#111111']}
                            locations={[0.05, 1]}
                            style={styles.bottomGradient}
                        />
                    </View>
                </Animated.ScrollView>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111111',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: SCREEN_WIDTH,
        zIndex: 1000,
        overflow: 'hidden',
    },
    headerBackground: {
        flex: 1,
        width: '100%',
    },
    imageContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    headerContent: {
        flex: 1,
        position: 'relative',
    },
    headerGradient: {
        flex: 1,
        justifyContent: 'space-between',
    },
    collapsedHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 10,
        minHeight: 50,
    },
    collapsedTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontFamily: 'Outfit-Medium',
        textAlign: 'center',
        flex: 1,
    },
    heroBackButtonContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingBottom: 10,
        minHeight: 50,
        justifyContent: 'flex-end',
    },
    heroTitleContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingBottom: 57,
    },
    heroBackButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroTitle: {
        color: '#FFFFFF',
        fontSize: 24,
        fontFamily: 'Outfit-Medium',
        letterSpacing: -0.48,
        lineHeight: 24,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    contentContainer: {
        backgroundColor: '#111111',
        paddingTop: 20,
        minHeight: '100%',
    },
    bottomGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 230,
        pointerEvents: 'none',
    },
});

export default SpotDetailScreen;

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, ImageBackground, TouchableOpacity, Dimensions, Platform } from 'react-native';
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
import { Place } from '@/data/Data';
import { ChartDataPoint, PlaylistResponseDto } from '@/types/api';
import PlayceAPI from '@/services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_EXPANDED_HEIGHT = 356;
const HEADER_COLLAPSED_HEIGHT = 100;

// 임시 목업 데이터 (실제로는 id를 사용해 서버에서 가져와야 함)
const MOCK_DATA: { [key: string]: { name: string; imageUrl: string; playlist: { id: string; title: string; artist: string; albumArt?: string; }[] } } = {
    '1': { // Gyeongbokgung
        name: 'Gyeongbokgung',
        imageUrl: 'https://conlab.visitkorea.or.kr/api/depot/public/depot-flow/query/download-image/4bd3982f-59df-47a4-8743-3c609f639ccb/it14',
        playlist: [],
    },
};

const SpotDetailScreen = () => {
    const { id, playlistData, place } = useLocalSearchParams<{ 
        id: string; 
        playlistData?: string;
        place?: string;
    }>();
    const placeObject = useMemo(() => place ? JSON.parse(place) as Place : null, [place]);

    const router = useRouter();
    const insets = useSafeAreaInsets();
    
    const spotName = placeObject?.name || MOCK_DATA[id]?.name || 'Unknown Place';
    const spotImageUrl = placeObject?.image || MOCK_DATA[id]?.imageUrl || 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80';

    const [backgroundImageLoaded, setBackgroundImageLoaded] = useState(false);
    const [backgroundImageError, setBackgroundImageError] = useState(false);
    const [congestionData, setCongestionData] = useState<ChartDataPoint[]>([]);

    useEffect(() => {
      console.log('[Debug] placeObject:', JSON.stringify(placeObject, null, 2));
      const fetchCongestionData = async () => {
        if (placeObject?.sigunguCode) {
          try {
            console.log(`[Debug] Fetching congestion data for sigunguCode: ${placeObject.sigunguCode}`);
            const data = await PlayceAPI.congestion.getCongestion(placeObject.sigunguCode);
            console.log('[Debug] Congestion data received:', data);
            setCongestionData(data);
          } catch (error) {
            console.error("[Debug] Failed to fetch congestion data", error);
            setCongestionData([]); // Set to empty on error
          }
        } else {
          // 목업 데이터 생성 (30일치)
          const mockData = Array.from({ length: 30 }, (_, index) => {
            const baseDate = new Date();
            baseDate.setDate(baseDate.getDate() + index);
            const dateString = baseDate.toISOString().slice(0, 10).replace(/-/g, '');
            return {
              day: parseInt(dateString),
              level: Math.floor(Math.random() * 100) // 0-100 사이 랜덤 값
            };
          });
          setCongestionData(mockData);
        }
      };
    
      fetchCongestionData();
    }, [placeObject]);

    const handleBackgroundImageLoad = useCallback(() => {
        setBackgroundImageLoaded(true);
        setBackgroundImageError(false);
    }, []);
    
    const handleBackgroundImageError = useCallback(() => {
        setBackgroundImageError(true);
        setBackgroundImageLoaded(false);
    }, []);
    
    const apiPlaylistData = useMemo(() => {
        if (playlistData) {
            try {
                return JSON.parse(playlistData) as PlaylistResponseDto;
            } catch (error) {
                console.error('플레이리스트 데이터 파싱 실패:', error);
                return null;
            }
        }
        return null;
    }, [playlistData]);
    
    const playlistSongs = useMemo(() => {
        if (apiPlaylistData?.recommendations) {
            return apiPlaylistData.recommendations.map((song, index) => ({
                id: `api-${index}`,
                title: song.title,
                artist: song.artist,
                albumArt: song.cover,
            }));
        }
        return [];
    }, [apiPlaylistData]);

    const todayIndex = useMemo(() => {
        if (congestionData.length === 0) {
            return 0;
        }
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayString = `${year}${month}${day}`;
        const todayNumber = parseInt(todayString, 10);
        
        const index = congestionData.findIndex(d => d.day === todayNumber);
        return index > -1 ? index : 0;
    }, [congestionData]);

    const scrollY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

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
            <View style={styles.outerContainer}>
                <View style={styles.container}>
                    <Animated.View style={[styles.header, headerHeight, { backgroundColor: '#111111' }]}>
                    <Animated.View style={[styles.imageContainer, headerBackgroundOpacity]}>
                        <ImageBackground 
                            source={{ uri: spotImageUrl }}
                            style={styles.headerBackground}
                            resizeMode="cover"
                            onLoad={handleBackgroundImageLoad}
                            onError={handleBackgroundImageError}
                            defaultSource={undefined}
                            fadeDuration={300}
                        >
                            <LinearGradient
                                colors={['rgba(8,8,8,0)', 'rgba(17,17,17,0.93)']}
                                locations={[0.19, 0.93]}
                                style={styles.headerGradient}
                            />
                        </ImageBackground>
                        
                        {backgroundImageError && (
                            <View style={[styles.headerBackground, styles.fallbackBackground]}>
                                <LinearGradient
                                    colors={['rgba(8,8,8,0)', 'rgba(17,17,17,0.93)']}
                                    locations={[0.19, 0.93]}
                                    style={styles.headerGradient}
                                />
                            </View>
                        )}
                    </Animated.View>

                    <View style={styles.headerContent}>
                        <Animated.View style={[styles.collapsedHeader, { paddingTop: insets.top }, headerTitleOpacity]}>
                            <TouchableOpacity 
                                style={styles.backButton}
                                onPress={() => router.back()}
                            >
                                <Ionicons name="chevron-back" size={24} color={Colors.text} />
                            </TouchableOpacity>
                            <Text style={styles.collapsedTitle}>{spotName}</Text>
                            <View style={{ width: 44 }} />
                        </Animated.View>

                        <Animated.View style={[styles.heroBackButtonContainer, { paddingTop: insets.top }, heroTitleOpacity]}>
                            <TouchableOpacity 
                                style={styles.heroBackButton}
                                onPress={() => router.back()}
                            >
                                <Ionicons name="chevron-back" size={24} color={Colors.text} />
                            </TouchableOpacity>
                        </Animated.View>

                        <Animated.View style={[styles.heroTitleContainer, heroTitleOpacity]}>
                            <Text style={styles.heroTitle}>{spotName}</Text>
                        </Animated.View>
                    </View>
                </Animated.View>

                <Animated.ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[styles.scrollContent, { paddingTop: HEADER_EXPANDED_HEIGHT }]}
                    onScroll={scrollHandler}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentContainer}>
                        {playlistSongs.length > 0 ? (
                            <Playlist songs={playlistSongs} />
                        ) : (
                            <View style={{ alignItems: 'center', paddingVertical: 60, paddingHorizontal: 30, marginHorizontal: 20, backgroundColor: '#1C1C1E', borderRadius: 16 }}>
                                <Ionicons name="musical-notes-outline" size={50} color={Colors.secondaryText} style={{ marginBottom: 20 }} />
                                <Text style={{ color: Colors.text, fontSize: 18, fontFamily: 'Outfit-Medium', marginBottom: 10 }}>No Playlist Found</Text>
                                <Text style={{ color: Colors.secondaryText, fontSize: 15, fontFamily: 'Pretendard-Regular', textAlign: 'center', lineHeight: 22 }}>
                                    Our AI couldn't find the right songs for this spot. Try searching for a different place.
                                </Text>
                            </View>
                        )}
                        <CongestionChart data={congestionData} currentIndex={todayIndex} />
                        
                        <LinearGradient
                            colors={['rgba(8,8,8,0)', '#111111']}
                            locations={[0.05, 1]}
                            style={styles.bottomGradient}
                        />
                    </View>
                </Animated.ScrollView>
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        backgroundColor: '#111111',
        ...(Platform.OS === 'web' && {
            alignItems: 'center', // 웹에서 중앙 정렬
        }),
    },
    container: {
        flex: 1,
        backgroundColor: '#111111',
        ...(Platform.OS === 'web' && {
            maxWidth: 480, // 모바일웹처럼 최대 너비 제한
            width: '100%',
        }),
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: SCREEN_WIDTH,
        zIndex: 1000,
        overflow: 'hidden',
        ...(Platform.OS === 'web' && {
            width: '100%', // 웹에서는 컨테이너 너비에 맞춤
        }),
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
        ...(Platform.OS === 'web' && {
            userSelect: 'none' as any,
        }),
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
        ...(Platform.OS === 'web' && {
            cursor: 'pointer' as any,
        }),
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        ...(Platform.OS === 'web' && {
            cursor: 'pointer' as any,
        }),
    },
    heroTitle: {
        color: '#FFFFFF',
        fontSize: 24,
        fontFamily: 'Outfit-Medium',
        letterSpacing: -0.48,
        lineHeight: 24,
        ...(Platform.OS === 'web' && {
            userSelect: 'none' as any,
        }),
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
        ...(Platform.OS === 'web' && {
            paddingHorizontal: 4, // 웹에서 좌우 여백 추가
        }),
    },
    bottomGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 230,
        pointerEvents: 'none',
    },
    fallbackBackground: {
        backgroundColor: '#1a1a1a',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
});

export default SpotDetailScreen;
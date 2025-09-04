import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Colors } from '../constants/Colors';
import ReliableImage from './ReliableImage';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 데이터 타입을 명확히 정의합니다.
export interface Song {
    id: string;
    title: string;
    artist: string;
    albumArt?: string;
}

interface PlaylistProps {
    songs: Song[];
}

const Playlist: React.FC<PlaylistProps> = ({ songs }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    
    // 5개씩 그룹화
    const groupedSongs = [];
    for (let i = 0; i < songs.length; i += 5) {
        groupedSongs.push(songs.slice(i, i + 5));
    }
    
    const totalPages = groupedSongs.length;
    
    const handleScroll = (event: any) => {
        const contentOffset = event.nativeEvent.contentOffset;
        const pageWidth = Platform.OS === 'web' ? 320 : SCREEN_WIDTH - 60 + 20; // 웹에서 조정된 페이지 너비
        
        // 현재 페이지 계산 (다음 페이지 미리보기를 고려한 계산)
        const pageNum = Math.round(contentOffset.x / pageWidth);
        setCurrentPage(pageNum);
    };

    // 웹용 마우스 드래그 핸들러들
    const handleMouseDown = (event: any) => {
        if (Platform.OS === 'web') {
            setIsDragging(true);
            event.preventDefault();
        }
    };

    const handleMouseMove = (event: any) => {
        if (Platform.OS === 'web' && isDragging && scrollViewRef.current) {
            // 마우스 드래그로 스크롤 구현
            const scrollView = scrollViewRef.current as any;
            if (scrollView._component) {
                scrollView._component.scrollLeft -= event.movementX;
            }
        }
    };

    const handleMouseUp = () => {
        if (Platform.OS === 'web') {
            setIsDragging(false);
        }
    };

    const renderSongItem = (item: Song, index: number) => (
        <Animated.View 
            key={item.id}
            style={styles.songItem}
            entering={FadeInRight.delay(index * 100).duration(400)}
        >
            {item.albumArt ? (
                <ReliableImage 
                    uri={item.albumArt}
                    style={styles.albumArt}
                    fallbackIconSize={24}
                    resizeMode="cover"
                    loadDelay={index * 100}
                    retryDelay={2000}
                />
            ) : (
                <View style={styles.albumArt} />
            )}
            <View style={styles.textContainer}>
                <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.songArtist} numberOfLines={1}>{item.artist}</Text>
            </View>
            <TouchableOpacity style={styles.menuButton}>
                <Ionicons name="ellipsis-vertical" size={20} color="#B7B7B7" />
            </TouchableOpacity>
        </Animated.View>
    );

    const renderPage = (pageData: Song[], pageIndex: number) => (
        <View key={pageIndex} style={styles.pageContainer}>
            {pageData.map((song, index) => renderSongItem(song, index))}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.title}>Play:list</Text>
                <Text style={styles.subtitle}>Feel the place through the music.</Text>
            </View>
            
            <View style={styles.playlistContainer}>
                <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    pagingEnabled={false} // 페이징을 비활성화하여 자유롭게 스크롤
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    style={[styles.scrollView, Platform.OS === 'web' ? { cursor: isDragging ? 'grabbing' as any : 'grab' as any } : {}]}
                    contentContainerStyle={styles.scrollContent}
                    snapToInterval={Platform.OS === 'web' ? 320 : SCREEN_WIDTH - 60 + 20} // 웹에서 조정된 스냅 간격
                    snapToAlignment="start"
                    decelerationRate="fast"
                    {...(Platform.OS === 'web' && {
                        // 웹에서 마우스 드래그 스크롤을 더 자연스럽게
                        decelerationRate: 'normal',
                        onMouseDown: handleMouseDown,
                        onMouseMove: handleMouseMove,
                        onMouseUp: handleMouseUp,
                        onMouseLeave: handleMouseUp,
                    })}
                >
                    {groupedSongs.map((pageData, pageIndex) => renderPage(pageData, pageIndex))}
                </ScrollView>
                
                {/* 페이지네이션 도트 */}
                {totalPages > 1 && (
                    <View style={styles.paginationContainer}>
                        {Array.from({ length: totalPages }, (_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.paginationDot,
                                    index === currentPage && styles.activePaginationDot
                                ]}
                            />
                        ))}
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 40,
    },
    headerContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    title: {
        color: Colors.text,
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: 'Outfit-Medium',
        marginBottom: 4,
        ...(Platform.OS === 'web' && {
            userSelect: 'none' as any,
        }),
    },
    subtitle: {
        color: Colors.secondaryText,
        fontSize: 14,
        fontFamily: 'Pretendard-Regular',
        ...(Platform.OS === 'web' && {
            userSelect: 'none' as any,
        }),
    },
    playlistContainer: {
        position: 'relative',
    },
    scrollView: {
        marginHorizontal: -20,
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    pageContainer: {
        width: Platform.OS === 'web' ? 320 : SCREEN_WIDTH - 60, // 웹에서 조정된 페이지 너비
        paddingHorizontal: 0,
        paddingVertical: 8,
        marginRight: 20,
    },
    songItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 0,
        height: 64,
        gap: 12,
    },
    albumArt: {
        width: 48,
        height: 48,
        borderRadius: 6,
        backgroundColor: Colors.searchBarBg,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    songTitle: {
        color: Colors.text,
        fontSize: 15,
        fontWeight: '600',
        fontFamily: 'Pretendard-SemiBold',
        marginBottom: 2,
        ...(Platform.OS === 'web' && {
            userSelect: 'none' as any,
        }),
    },
    songArtist: {
        color: Colors.secondaryText,
        fontSize: 13,
        fontFamily: 'Pretendard-Regular',
        ...(Platform.OS === 'web' && {
            userSelect: 'none' as any,
        }),
    },
    menuButton: {
        padding: 8,
        ...(Platform.OS === 'web' && {
            cursor: 'pointer' as any,
        }),
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
        gap: 8,
    },
    paginationDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    activePaginationDot: {
        backgroundColor: Colors.text,
        opacity: 0.8,
    },
});

export default Playlist;

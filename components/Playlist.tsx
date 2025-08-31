import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
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
    const scrollViewRef = useRef<ScrollView>(null);
    
    // 5개씩 그룹화
    const groupedSongs = [];
    for (let i = 0; i < songs.length; i += 5) {
        groupedSongs.push(songs.slice(i, i + 5));
    }
    
    const totalPages = groupedSongs.length;
    
    const handleScroll = (event: any) => {
        const contentOffset = event.nativeEvent.contentOffset;
        const pageWidth = SCREEN_WIDTH - 60 + 20; // 페이지 너비 + 마진
        
        // 현재 페이지 계산 (다음 페이지 미리보기를 고려한 계산)
        const pageNum = Math.round(contentOffset.x / pageWidth);
        setCurrentPage(pageNum);
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
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    snapToInterval={SCREEN_WIDTH - 60 + 20} // 페이지 너비 + 마진과 일치
                    snapToAlignment="start"
                    decelerationRate="fast"
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
        gap: 10,
    },
    headerContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        gap: 5,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 20,
        fontFamily: 'Pretendard-Bold',
        letterSpacing: -0.4,
        lineHeight: 30,
    },
    subtitle: {
        color: '#B7B7B7',
        fontSize: 16,
        fontFamily: 'Pretendard-Regular',
        letterSpacing: -0.32,
        lineHeight: 16,
    },
    playlistContainer: {
        paddingVertical: 10,
    },
    scrollView: {
        height: 400, // 5개 아이템 * 80px
    },
    scrollContent: {
        paddingRight: 20, // 마지막 페이지 이후 여백
    },
    pageContainer: {
        width: SCREEN_WIDTH - 60, // 다음 페이지가 더 많이 보이도록 너비 조정
        paddingHorizontal: 0,
        paddingVertical: 10,
        marginRight: 20, // 페이지 간격 줄임
    },
    songItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        height: 80,
        gap: 20,
    },
    albumArt: {
        width: 60,
        height: 60,
        backgroundColor: '#B7B7B7',
        borderRadius: 16, // Figma 디자인에 맞게 조정
    },
    textContainer: {
        flex: 1,
        gap: 4,
    },
    menuButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    songTitle: {
        color: '#E8E8E8',
        fontSize: 18,
        fontFamily: 'Pretendard-SemiBold',
        letterSpacing: -0.36,
        lineHeight: 18,
    },
    songArtist: {
        color: '#E8E8E8',
        fontSize: 14,
        fontFamily: 'Pretendard-Regular',
        letterSpacing: -0.28,
        lineHeight: 21,
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        gap: 8,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#B7B7B7',
        opacity: 0.3,
    },
    activePaginationDot: {
        backgroundColor: '#1C86A0',
        opacity: 1,
    },
});

export default Playlist;

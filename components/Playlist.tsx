import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Colors } from '../constants/Colors';
import ReliableImage from './ReliableImage';
import Animated, { FadeInRight } from 'react-native-reanimated';

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
    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.title}>Play:list</Text>
                <Text style={styles.subtitle}>Feel the place through the music.</Text>
            </View>
            
            <View style={styles.playlistContainer}>
                <FlatList
                    data={songs}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                        <Animated.View 
                            style={styles.songItem}
                            entering={FadeInRight.delay(index * 200).duration(600)}
                        >
                            {item.albumArt ? (
                                <ReliableImage 
                                    uri={item.albumArt}
                                    style={styles.albumArt}
                                    fallbackIconSize={24}
                                    resizeMode="cover"
                                    loadDelay={index * 500}
                                    retryDelay={2000}
                                />
                            ) : (
                                <View style={styles.albumArt} />
                            )}
                            <View style={styles.textContainer}>
                                <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
                                <Text style={styles.songArtist} numberOfLines={1}>{item.artist}</Text>
                            </View>
                        </Animated.View>
                    )}
                    scrollEnabled={false}
                />
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
        borderRadius: 12,
    },
    textContainer: {
        flex: 1,
        gap: 4,
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
});

export default Playlist;

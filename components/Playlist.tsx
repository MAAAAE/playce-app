import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Colors } from '../constants/Colors';

// 데이터 타입을 명확히 정의합니다.
export interface Song {
    id: string;
    title: string;
    artist: string;
}

interface PlaylistProps {
    songs: Song[];
}

const Playlist: React.FC<PlaylistProps> = ({ songs }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Play;list</Text>
            <Text style={styles.subtitle}>Feel the place through the music.</Text>
            <FlatList
                data={songs}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.songItem}>
                        <View style={styles.albumArt} />
                        <View style={styles.textContainer}>
                            <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
                            <Text style={styles.songArtist} numberOfLines={1}>{item.artist}</Text>
                        </View>
                    </View>
                )}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 30, // 이전 섹션과의 간격
    },
    title: {
        color: Colors.text,
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtitle: {
        color: Colors.searchBarPlaceholder, // 부제목에 연한 색상 사용
        fontSize: 14,
        marginTop: 4,
        marginBottom: 20, // 리스트와의 간격
    },
    songItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    albumArt: {
        width: 50,
        height: 50,
        backgroundColor: Colors.searchBarBg, // 검색창과 유사한 배경색
        borderRadius: 8, // 부드러운 둥근 모서리
    },
    textContainer: {
        flex: 1, // 텍스트가 길어지면 줄바꿈되도록
        marginLeft: 15, // 앨범 아트와의 간격
    },
    songTitle: {
        color: Colors.text,
        fontSize: 16,
        fontWeight: '600', // semi-bold
    },
    songArtist: {
        color: Colors.searchBarPlaceholder,
        fontSize: 14,
        marginTop: 4,
    },
    separator: {
        height: 20, // 각 노래 항목 사이의 세로 간격
    },
});

export default Playlist;

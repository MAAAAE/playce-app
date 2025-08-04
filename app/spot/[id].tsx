import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import DetailHeader from '../../components/DetailHeader';
import Playlist, { Song } from '../../components/Playlist';
import CongestionChart from "@/components/congestionChart";
import {MOCK_CHART_DATA} from "@/data/mockData";

// 임시 목업 데이터 (실제로는 id를 사용해 서버에서 가져와야 함)
const MOCK_DATA = {
    '1': { // Gyeongbokgung
        name: 'Gyeongbokgung',
        imageUrl: 'https://images.unsplash.com/photo-1542649215-c812d4f58f4a?q=80&w=2940&auto=format&fit=crop',
        playlist: [
            { id: 's1', title: 'Daechwita', artist: 'Agust D' },
            { id: 's2', title: 'IDOL', artist: 'BTS' },
            { id: 's3', title: 'How You Like That', artist: 'BLACKPINK' },
        ],
    },
};


const SpotDetailScreen = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const spotData = MOCK_DATA[id] || MOCK_DATA['1']; // id가 없으면 기본값 사용
    const todayIndex = new Date().getDate() - 1; // 오늘 날짜(1~30)를 인덱스(0~29)로

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" />
            <ScrollView style={styles.container}>
                <DetailHeader imageUrl={spotData.imageUrl} />

                <View style={styles.contentContainer}>
                    <Text style={styles.spotTitle}>{spotData.name}</Text>

                    {/* TODO: "Where should we head next?" 검색창 */}

                    <Playlist songs={spotData.playlist} />

                    <CongestionChart data={MOCK_CHART_DATA} currentIndex={todayIndex} />

                </View>
            </ScrollView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    contentContainer: {
        padding: 20,
    },
    spotTitle: {
        color: Colors.text,
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    // Playlist 컴포넌트의 스타일도 여기에 포함되어야 합니다.
});

export default SpotDetailScreen;

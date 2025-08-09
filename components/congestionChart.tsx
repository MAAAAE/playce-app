import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';
import { ChartDataPoint } from '@/data/mockData';
import Svg, { Path } from 'react-native-svg';
import * as path from 'svg-path-properties';

interface SVGPoint {
    x: number;
    y: number;
}

// 차트의 크기를 정의
const CHART_WIDTH = Dimensions.get('window').width - 80; // 좌우 여백 40
const CHART_HEIGHT = 120;

// 차트 데이터를 SVG 경로 데이터로 변환하는 헬퍼 함수
const lineToPath = (points: SVGPoint[]) => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    points.forEach(p => {
        d += ` L ${p.x} ${p.y}`;
    });
    return d;
};

interface CongestionChartProps {
    data: ChartDataPoint[];
    currentIndex: number; // 오늘 날짜에 해당하는 데이터 인덱스
}

const CongestionChart: React.FC<CongestionChartProps> = ({ data, currentIndex }) => {
    // data를 SVG 좌표로 변환
    const points = useMemo(() => {
        return data.map((point, index) => {
            const x = (index / (data.length - 1)) * CHART_WIDTH;
            const y = CHART_HEIGHT - (point.level / 100) * CHART_HEIGHT;
            return { x, y };
        });
    }, [data]);

    const linePath = useMemo(() => lineToPath(points), [points]);
    const properties = useMemo(() => new path.svgPathProperties(linePath), [linePath]);
    const { x, y } = properties.getPointAtLength(properties.getTotalLength() * (currentIndex / (data.length - 1)));

    const currentLevel = data[currentIndex]?.level;
    const levelText = currentLevel < 40 ? 'LOW' : currentLevel < 75 ? 'MODERATE' : 'HIGH';

    return (
        <View style={styles.container}>
            <Text style={styles.title}>When to Play;ce</Text>
            <Text style={styles.subtitle}>Avoid the rush. Catch the best moment.</Text>

            <View style={styles.chartContainer}>
                <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
                    <Path d={linePath} stroke={Colors.searchBarPlaceholder} strokeWidth={2} fill="none" />
                </Svg>
            </View>
            <Text style={styles.footerText}>30-day crowd level forecast</Text>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        marginTop: 40,
        backgroundColor: Colors.searchBarBg,
        borderRadius: 20,
        padding: 20,
    },
    title: {
        color: Colors.text,
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtitle: {
        color: Colors.searchBarPlaceholder,
        fontSize: 14,
        marginTop: 4,
        marginBottom: 20,
    },
    chartContainer: {
        position: 'relative',
        height: CHART_HEIGHT,
        width: CHART_WIDTH,
        alignSelf: 'center',
    },
    indicator: {
        position: 'absolute',
        alignItems: 'center',
        width: 60,
    },
    indicatorBox: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#4CAF50', // LOW 색상
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
    },
    indicatorText: {
        color: '#4CAF50',
        fontWeight: 'bold',
        fontSize: 12,
    },
    indicatorStem: {
        width: 1,
        height: 20,
        backgroundColor: '#4CAF50',
        marginTop: 5,
    },
    footerText: {
        color: Colors.searchBarPlaceholder,
        fontSize: 10,
        textAlign: 'center',
        marginTop: 10,
    },
});

export default CongestionChart;

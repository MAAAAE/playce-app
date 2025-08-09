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
const CHART_WIDTH = 303; // 피그마 디자인에 맞춤
const CHART_HEIGHT = 80;

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

    const currentLevel = data[currentIndex]?.level;
    const levelText = currentLevel < 40 ? 'Low' : currentLevel < 75 ? 'Moderate' : 'High';
    const levelColor = currentLevel < 40 ? '#3EAC3A' : currentLevel < 75 ? '#FFA500' : '#FF4444';

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.title}>When to Play:ce</Text>
                <Text style={styles.subtitle}>Avoid the rush. Catch the best moment.</Text>
            </View>

            <View style={styles.chartContainer}>
                <View style={styles.chartBackground}>
                    {/* Crowd Level Indicator */}
                    <View style={[styles.levelIndicator, { borderColor: levelColor }]}>
                        <Text style={styles.levelLabel}>crowd level</Text>
                        <Text style={[styles.levelValue, { color: '#E8E8E8' }]}>{levelText}</Text>
                        <Text style={styles.levelDate}>July 1</Text>
                    </View>

                    {/* Chart */}
                    <View style={styles.svgContainer}>
                        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
                            <Path 
                                d={linePath} 
                                stroke="#FFFFFF" 
                                strokeWidth={2} 
                                fill="none" 
                                opacity={0.8}
                            />
                        </Svg>
                    </View>

                    <Text style={styles.footerText}>30-day crowd level forecast</Text>
                </View>
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
        gap: 4,
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
    chartContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    chartBackground: {
        width: 335,
        height: 220,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#464646',
        paddingHorizontal: 16,
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 16,
    },
    levelIndicator: {
        backgroundColor: 'rgba(0, 0, 0, 0.16)',
        borderRadius: 15,
        borderWidth: 0.938,
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 9.375,
        alignItems: 'center',
        width: 93.75,
    },
    levelLabel: {
        color: '#959595',
        fontSize: 9.375,
        fontFamily: 'Pretendard-Regular',
        letterSpacing: -0.1875,
        lineHeight: 9.375,
    },
    levelValue: {
        fontSize: 15,
        fontFamily: 'Pretendard-SemiBold',
        letterSpacing: -0.3,
        lineHeight: 15,
    },
    levelDate: {
        color: '#959595',
        fontSize: 9.375,
        fontFamily: 'Pretendard-Regular',
        letterSpacing: -0.1875,
        lineHeight: 9.375,
    },
    svgContainer: {
        width: CHART_WIDTH,
        height: CHART_HEIGHT,
    },
    footerText: {
        color: '#959595',
        fontSize: 12,
        fontFamily: 'Pretendard-Bold',
        lineHeight: 12,
        textAlign: 'center',
    },
});

export default CongestionChart;

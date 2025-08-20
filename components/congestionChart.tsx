import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { Colors } from '@/constants/Colors';
import { ChartDataPoint } from '@/types/api';
import Svg, { Path, Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedGestureHandler,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';

interface SVGPoint {
    x: number;
    y: number;
}

// 차트의 크기를 정의
const CHART_WIDTH = 303; // 피그마 디자인에 맞춤
const CHART_HEIGHT = 80;

// 차트 데이터를 부드러운 곡선 SVG 경로 데이터로 변환하는 헬퍼 함수
const createSmoothPath = (points: SVGPoint[]): string => {
    if (points.length < 2) return '';
    
    let d = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
        const currentPoint = points[i];
        const previousPoint = points[i - 1];
        
        if (i === 1) {
            // 첫 번째 곡선: 시작점에서 두 번째 점으로
            const controlPoint1 = {
                x: previousPoint.x + (currentPoint.x - previousPoint.x) * 0.5,
                y: previousPoint.y
            };
            const controlPoint2 = {
                x: currentPoint.x - (currentPoint.x - previousPoint.x) * 0.5,
                y: currentPoint.y
            };
            d += ` C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${currentPoint.x} ${currentPoint.y}`;
        } else {
            // 중간 곡선들: 이전 점의 방향을 고려한 부드러운 연결
            const previousControlPoint = points[i - 2];
            const nextPoint = points[Math.min(i + 1, points.length - 1)];
            
            const controlPoint1 = {
                x: previousPoint.x + (currentPoint.x - previousControlPoint.x) * 0.2,
                y: previousPoint.y + (currentPoint.y - previousControlPoint.y) * 0.2
            };
            const controlPoint2 = {
                x: currentPoint.x - (nextPoint.x - previousPoint.x) * 0.2,
                y: currentPoint.y - (nextPoint.y - previousPoint.y) * 0.2
            };
            d += ` C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${currentPoint.x} ${currentPoint.y}`;
        }
    }
    
    return d;
};

interface CongestionChartProps {
    data: ChartDataPoint[];
    currentIndex?: number; // 오늘 날짜에 해당하는 데이터 인덱스 (선택사항)
}

interface Context extends Record<string, unknown> {
  startX: number;
}

const CongestionChart: React.FC<CongestionChartProps> = ({ data, currentIndex = 0 }) => {
    const [selectedIndex, setSelectedIndex] = useState(currentIndex);
    const translateX = useSharedValue(0);
    const lastHapticIndex = useSharedValue(currentIndex);
    // data를 SVG 좌표로 변환
    const points = useMemo(() => {
        return data.map((point, index) => {
            const x = (index / (data.length - 1)) * CHART_WIDTH;
            const y = CHART_HEIGHT - (point.level / 100) * CHART_HEIGHT;
            return { x, y };
        });
    }, [data]);

    const linePath = useMemo(() => createSmoothPath(points), [points]);

    // 제스처 핸들러
    const gestureHandler = useAnimatedGestureHandler<any, Context>({
        onStart: (_, context) => {
            context.startX = translateX.value;
        },
        onActive: (event, context) => {
            translateX.value = context.startX + event.translationX;
            
            // X 좌표를 배열 인덱스로 변환
            const relativeX = Math.max(0, Math.min(CHART_WIDTH, event.absoluteX - 56)); // 컨테이너 여백 고려 (20 + 16 + 20)
            const index = Math.round((relativeX / CHART_WIDTH) * (data.length - 1));
            
            if (index >= 0 && index < data.length && index !== lastHapticIndex.value) {
                runOnJS(setSelectedIndex)(index);
                lastHapticIndex.value = index;
                runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
            }
        },
        onEnd: () => {
            translateX.value = 0;
        },
    });

    const currentLevel = data[selectedIndex]?.level || data[currentIndex]?.level || 0;
    const levelText = currentLevel < 40 ? 'Low' : currentLevel < 75 ? 'Medium' : 'High';
    const levelColor = currentLevel < 40 ? '#3EAC3A' : currentLevel < 75 ? '#FFD448' : '#FF5733';

    const formattedDate = useMemo(() => {
        const dayNumber = data[selectedIndex]?.day;
        if (!dayNumber) return '';
        const dayString = String(dayNumber);
        if (dayString.length !== 8) return ''; // Should still be 8 digits
        const month = dayString.substring(4, 6);
        const dayOfMonth = dayString.substring(6, 8);
        return `${month}/${dayOfMonth}`;
    }, [data, selectedIndex]);

    // 선택된 점의 좌표
    const selectedPoint = points[selectedIndex] || points[currentIndex];

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
                        <Text style={styles.levelDate}>{formattedDate}</Text>
                    </View>

                    {/* Chart */}
                    <PanGestureHandler onGestureEvent={gestureHandler}>
                        <Animated.View style={styles.svgContainer}>
                            <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
                                {/* 차트 선 */}
                                <Path 
                                    d={linePath} 
                                    stroke="#FFFFFF" 
                                    strokeWidth={2} 
                                    fill="none" 
                                    opacity={0.8}
                                />
                                {/* 선택된 점 */}
                                {selectedPoint && (
                                    <Circle
                                        cx={selectedPoint.x}
                                        cy={selectedPoint.y}
                                        r={6}
                                        fill="#FFFFFF"
                                        stroke="#FFFFFF"
                                        strokeWidth={2}
                                        opacity={0.9}
                                    />
                                )}
                            </Svg>
                        </Animated.View>
                    </PanGestureHandler>

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
        paddingBottom: 20, // 하단 여백 추가
    },
    chartBackground: {
        width: 335,
        height: 240, // 높이를 220에서 240으로 증가
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#464646',
        paddingHorizontal: 16,
        paddingVertical: 20,
        paddingBottom: 24, // 하단 패딩 추가
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
        lineHeight: 15, // 줄 간격 증가
        textAlign: 'center',
        marginTop: 4, // 상단 여백 추가
        opacity: 0.9, // 약간의 투명도로 더 부드럽게
    },
});

export default CongestionChart;

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform, TouchableWithoutFeedback } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { Colors } from '@/constants/Colors';
import { ChartDataPoint } from '@/types/api';
import Svg, { Path, Circle, Rect, Text as SvgText } from 'react-native-svg';
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

const CHART_HEIGHT = 120;
const VERTICAL_PADDING = 10; // 상하 여백 추가

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
    const [svgWidth, setSvgWidth] = useState(0);
    const [selectedIndex, setSelectedIndex] = useState(currentIndex);
    const translateX = useSharedValue(0);
    const lastHapticIndex = useSharedValue(currentIndex);

    const onLayout = (event: any) => {
        const { width } = event.nativeEvent.layout;
        setSvgWidth(width - 32); // 16 padding on each side
    };

    // data를 SVG 좌표로 변환
    const points = useMemo(() => {
        if (data.length === 0 || svgWidth === 0) return [];
        return data.map((point, index) => {
            const x = (index / (data.length - 1)) * svgWidth;
            const y = (CHART_HEIGHT - VERTICAL_PADDING * 2) - (point.level / 100) * (CHART_HEIGHT - VERTICAL_PADDING * 2) + VERTICAL_PADDING;
            return { x, y };
        });
    }, [data, svgWidth]);

    const linePath = useMemo(() => createSmoothPath(points), [points]);

    // 제스처 핸들러
    const gestureHandler = useAnimatedGestureHandler<any, Context>({
        onStart: (_, context) => {
            context.startX = translateX.value;
        },
        onActive: (event, context) => {
            translateX.value = context.startX + event.translationX;
            
            // X 좌표를 배열 인덱스로 변환
            const relativeX = Math.max(0, Math.min(svgWidth, event.absoluteX - 56)); // 컨테이너 여백 고려 (20 + 16 + 20)
            const index = Math.round((relativeX / svgWidth) * (data.length - 1));
            
            if (index >= 0 && index < data.length && index !== lastHapticIndex.value) {
                runOnJS(setSelectedIndex)(index);
                lastHapticIndex.value = index;
                
                // 웹에서는 햅틱 피드백 대신 vibration API 사용하거나 생략
                if (Platform.OS !== 'web') {
                    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
                } else {
                    // 웹에서는 대안적 피드백 (진동 API가 있다면)
                    runOnJS(() => {
                        try {
                            if ('vibrate' in navigator) {
                                navigator.vibrate(10);
                            }
                        } catch (e) {
                            // 무시
                        }
                    })();
                }
            }
        },
        onEnd: () => {
            translateX.value = 0;
        },
    });

    // 웹용 마우스 핸들러
    const handleWebPointerMove = (event: any) => {
        if (Platform.OS === 'web' && event.nativeEvent) {
            const rect = event.currentTarget.getBoundingClientRect();
            const relativeX = Math.max(0, Math.min(svgWidth, event.nativeEvent.clientX - rect.left));
            const index = Math.round((relativeX / svgWidth) * (data.length - 1));
            
            if (index >= 0 && index < data.length && index !== selectedIndex) {
                setSelectedIndex(index);
                // 웹에서 햅틱 피드백
                try {
                    if ('vibrate' in navigator) {
                        navigator.vibrate(10);
                    }
                } catch (e) {
                    // 무시
                }
            }
        }
    };

    const currentLevel = data[selectedIndex]?.level || data[currentIndex]?.level || 0;
    const levelText = currentLevel < 40 ? 'Low' : currentLevel < 75 ? 'Medium' : 'High';
    const levelColor = currentLevel < 40 ? '#3EAC3A' : currentLevel < 75 ? '#FFD448' : '#FF5733';

    const formatDateForBar = (dayNumber: number) => {
        if (!dayNumber) return '';
        const dayString = String(dayNumber);
        if (dayString.length !== 8) return '';
        const month = dayString.substring(4, 6);
        const dayOfMonth = dayString.substring(6, 8);
        return `${month}/${dayOfMonth}`;
    };

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
                <View style={styles.chartBackground} onLayout={onLayout}>
                    {/* Crowd Level Indicator */}
                    <View style={[styles.levelIndicator, { borderColor: levelColor }]}>
                        <Text style={styles.levelLabel}>crowd level</Text>
                        <Text style={[styles.levelValue, { color: '#E8E8E8' }]}>{levelText}</Text>
                        <Text style={styles.levelDate}>{formattedDate}</Text>
                    </View>

                    {/* Chart */}
                    {Platform.OS === 'web' ? (
                        <TouchableWithoutFeedback>
                            <Animated.View 
                                style={[styles.svgContainer, { cursor: 'pointer' as any }]}
                                onPointerMove={handleWebPointerMove}
                            >
                                <Svg width={svgWidth} height={CHART_HEIGHT}>
                                    {data.map((point, index) => {
                                        const slotWidth = svgWidth / data.length;
                                        const barWidth = slotWidth * 0.8; // Use 80% of the slot for the bar
                                        const x = index * slotWidth + (slotWidth - barWidth) / 2; // Center bar in slot

                                        const barHeight = (point.level / 100) * (CHART_HEIGHT - VERTICAL_PADDING * 2 - 20); // -20 for date space
                                        const y = (CHART_HEIGHT - VERTICAL_PADDING * 2 - 20) - barHeight + VERTICAL_PADDING;
                                        const isSelected = index === selectedIndex;
                                        const isHighBar = point.level > 90;

                                        return (
                                            <React.Fragment key={index}>
                                                <Rect
                                                    x={x}
                                                    y={y}
                                                    width={barWidth}
                                                    height={barHeight}
                                                    fill={isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)'}
                                                    opacity={isSelected ? 1 : 0.7}
                                                    rx={4}
                                                />
                                                {isSelected && (
                                                    <SvgText
                                                        x={x + barWidth / 2}
                                                        y={isHighBar ? y + 15 : y - 5}
                                                        fill={isHighBar ? '#000000' : '#FFFFFF'}
                                                        fontSize="12"
                                                        fontWeight="bold"
                                                        textAnchor="middle"
                                                    >
                                                        {`${point.level.toFixed(0)}%`}
                                                    </SvgText>
                                                )}
                                                <SvgText
                                                    x={x + barWidth / 2}
                                                    y={CHART_HEIGHT - 15}
                                                    fill="rgba(255, 255, 255, 0.7)"
                                                    fontSize="10"
                                                    textAnchor="end"
                                                    transform={`rotate(-45, ${x + barWidth / 2}, ${CHART_HEIGHT - 15})`}
                                                >
                                                    {formatDateForBar(point.day)}
                                                </SvgText>
                                            </React.Fragment>
                                        );
                                    })}
                                </Svg>
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    ) : (
                        <PanGestureHandler onGestureEvent={gestureHandler}>
                            <Animated.View style={styles.svgContainer}>
                                <Svg width={svgWidth} height={CHART_HEIGHT}>
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
                    )}

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
        height: 300, // 높이를 280에서 300으로 증가
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

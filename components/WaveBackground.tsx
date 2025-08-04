import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
    useSharedValue,
    withRepeat,
    withTiming,
    useAnimatedProps,
    Easing,
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';

const { width } = Dimensions.get('window');
const WAVE_HEIGHT = 100;
const WAVE_SPEED = 4000; // ms

const AnimatedPath = Animated.createAnimatedComponent(Path);

const Wave = ({ color, progress }) => {
    const animatedProps = useAnimatedProps(() => {
        // progress 값(0~1)에 따라 웨이브의 시작점을 이동시켜 움직이는 효과를 줍니다.
        const startX = -width * progress.value;
        const endX = startX + width * 2; // 화면 너비의 두 배만큼 웨이브를 길게 그림

        // SVG Path 데이터: C는 곡선(Cubic Bezier)을 의미합니다.
        const d = `M ${startX} ${WAVE_HEIGHT} C ${startX + width / 2} ${WAVE_HEIGHT * 2}, ${startX + width / 2} 0, ${startX + width} ${WAVE_HEIGHT} C ${startX + width * 1.5} ${WAVE_HEIGHT * 2}, ${startX + width * 1.5} 0, ${endX} ${WAVE_HEIGHT} L ${endX} 1000 L ${startX} 1000 Z`;

        return {
            d: d,
        };
    });

    return <AnimatedPath fill={color} animatedProps={animatedProps} />;
};

const WaveBackground = () => {
    const progress1 = useSharedValue(0);
    const progress2 = useSharedValue(0.5); // 두 번째 웨이브는 다른 지점에서 시작

    useEffect(() => {
        progress1.value = withRepeat(withTiming(1, { duration: WAVE_SPEED, easing: Easing.linear }), -1);
        progress2.value = withRepeat(withTiming(1, { duration: WAVE_SPEED * 1.5, easing: Easing.linear }), -1);
    }, []);

    return (
        <View style={styles.container}>
            <Svg height="100%" width="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* 웨이브의 fill 색상을 반투명 색상으로 변경합니다. */}
                <Wave color={Colors.wave.wave2} progress={progress2} />
                <Wave color={Colors.wave.wave1} progress={progress1} />
            </Svg>
        </View>

    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent', // 이 부분을 수정
    },
});

export default WaveBackground;

import { Keyboard, Platform } from 'react-native';
import { useSharedValue, withTiming, useAnimatedStyle, interpolate, Easing } from 'react-native-reanimated';

export const useSearchAnimation = () => {
    // 애니메이션 상태를 관리하는 공유 값 (0: 기본 상태, 1: 검색창 포커스 상태)
    const isFocused = useSharedValue(0);

    const handleFocus = () => {
        if (Platform.OS === 'web') {
            // 웹에서는 부드러운 애니메이션으로 변경
            isFocused.value = withTiming(1, {
                duration: 200,
                easing: Easing.out(Easing.ease),
            });
        } else {
            isFocused.value = withTiming(1, {
                duration: 450,
                easing: Easing.out(Easing.cubic),
            });
        }
    };

    const handleBlur = () => {
        if (Platform.OS === 'web') {
            // 웹에서는 키보드 dismiss 하지 않음
            isFocused.value = withTiming(0, {
                duration: 200,
                easing: Easing.out(Easing.ease),
            });
        } else {
            isFocused.value = withTiming(0, {
                duration: 420,
                easing: Easing.out(Easing.cubic),
            });
            Keyboard.dismiss(); // 네이티브에서만 키보드 내리기
        }
    };

    // 상단 컨테이너(제목)의 애니메이션 스타일
    const topContainerAnimatedStyle = useAnimatedStyle(() => {
        if (Platform.OS === 'web') {
            // 웹에서는 더 미묘한 애니메이션
            return {
                flex: interpolate(isFocused.value, [0, 1], [1, 0.95]),
                opacity: interpolate(isFocused.value, [0, 1], [1, 0.8]),
            };
        }
        return {
            flex: interpolate(isFocused.value, [0, 1], [1, 0.9]),
            opacity: 1,
        };
    });

    // 하단 컨테이너(검색창)의 애니메이션 스타일
    const bottomContainerAnimatedStyle = useAnimatedStyle(() => {
        if (Platform.OS === 'web') {
            // 웹에서는 더 미묘한 애니메이션
            return {
                flex: interpolate(isFocused.value, [0, 1], [1, 1.05]),
            };
        }
        return {
            flex: interpolate(isFocused.value, [0, 1], [1, 1.1]),
        };
    });

    return {
        handleFocus,
        handleBlur,
        topContainerAnimatedStyle,
        bottomContainerAnimatedStyle,
        isFocused,
    };
};

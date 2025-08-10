import { Keyboard } from 'react-native';
import { useSharedValue, withTiming, useAnimatedStyle, interpolate, Easing } from 'react-native-reanimated';

export const useSearchAnimation = () => {
    // 애니메이션 상태를 관리하는 공유 값 (0: 기본 상태, 1: 검색창 포커스 상태)
    const isFocused = useSharedValue(0);

    const handleFocus = () => {
        isFocused.value = withTiming(1, {
            duration: 450,
            easing: Easing.out(Easing.cubic),
        });
    };

    const handleBlur = () => {
        isFocused.value = withTiming(0, {
            duration: 420,
            easing: Easing.out(Easing.cubic),
        });
        Keyboard.dismiss(); // 키보드 내리기
    };

    // 상단 컨테이너(제목)의 애니메이션 스타일
    const topContainerAnimatedStyle = useAnimatedStyle(() => {
        return {
            flex: interpolate(isFocused.value, [0, 1], [1, 0.9]), // 살짝만 압축
            opacity: 1, // 항상 표시
        };
    });

    // 하단 컨테이너(검색창)의 애니메이션 스타일
    const bottomContainerAnimatedStyle = useAnimatedStyle(() => {
        return {
            flex: interpolate(isFocused.value, [0, 1], [1, 1.1]),
            // 더 부드럽게 공간 확보, marginTop 이동 제거
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

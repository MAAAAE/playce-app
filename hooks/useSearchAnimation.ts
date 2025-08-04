import { Keyboard } from 'react-native';
import { useSharedValue, withTiming, useAnimatedStyle, interpolate } from 'react-native-reanimated';

export const useSearchAnimation = () => {
    // 애니메이션 상태를 관리하는 공유 값 (0: 기본 상태, 1: 검색창 포커스 상태)
    const isFocused = useSharedValue(0);

    const handleFocus = () => {
        isFocused.value = withTiming(1, { duration: 300 });
    };

    const handleBlur = () => {
        isFocused.value = withTiming(0, { duration: 300 });
        Keyboard.dismiss(); // 키보드 내리기
    };

    // 상단 컨테이너(제목)의 애니메이션 스타일
    const topContainerAnimatedStyle = useAnimatedStyle(() => {
        return {
            flex: interpolate(isFocused.value, [0, 1], [1, 0.2]), // 포커스 시 flex 줄이기
            opacity: interpolate(isFocused.value, [0, 1], [1, 0]), // 포커스 시 투명하게
        };
    });

    // 하단 컨테이너(검색창)의 애니메이션 스타일
    const bottomContainerAnimatedStyle = useAnimatedStyle(() => {
        return {
            flex: interpolate(isFocused.value, [0, 1], [1, 2]), // 포커스 시 flex 늘리기
        };
    });

    return {
        handleFocus,
        handleBlur,
        topContainerAnimatedStyle,
        bottomContainerAnimatedStyle,
    };
};

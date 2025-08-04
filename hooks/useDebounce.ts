import { useState, useEffect } from 'react';

// value: 디바운스할 대상 값 (예: 검색어)
// delay: 지연 시간 (밀리초)
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // value가 변경된 후 delay 시간만큼 기다렸다가 debouncedValue를 업데이트
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // value가 바뀌면 이전 타이머를 취소하고 새 타이머를 설정
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]); // value나 delay가 변경될 때만 이펙트를 다시 실행

    return debouncedValue;
}

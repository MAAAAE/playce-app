import React, { useState, useCallback, useRef } from 'react';
import { Image, View, ImageProps, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface ReliableImageProps extends Omit<ImageProps, 'source'> {
  uri: string;
  fallbackIcon?: string;
  fallbackIconSize?: number;
  fallbackIconColor?: string;
  placeholderStyle?: any;
  maxRetries?: number;
  retryDelay?: number;
  loadDelay?: number; // 초기 로딩 지연 시간
  onImageLoaded?: () => void; // 이미지 로딩 완료 콜백
}

const ReliableImage: React.FC<ReliableImageProps> = ({
  uri,
  style,
  fallbackIcon = 'musical-note',
  fallbackIconSize = 32,
  fallbackIconColor = '#1C86A0',
  placeholderStyle,
  maxRetries = 3,
  retryDelay = 3000,
  loadDelay = 0,
  onImageLoaded,
  ...props
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [attemptingLoad, setAttemptingLoad] = useState(false);
  const retryTimeoutRef = useRef<number | null>(null);
  const loadTimeoutRef = useRef<number | null>(null);

  // URI 유효성 검사 (먼저 정의)
  const isValidUri = uri && uri.startsWith('http');

  const handleImageLoad = useCallback(() => {
    console.log(`✅ 이미지 로드 성공:`, uri);
    setImageLoaded(true);
    setImageError(false);
    // setAttemptingLoad는 false로 하지 않음 - 이미지를 계속 보여주기 위해
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
    
    // 부모 컴포넌트에 이미지 로딩 완료 알림
    onImageLoaded?.();
  }, [uri, onImageLoaded]);

  const handleImageError = useCallback(() => {
    console.log(`❌ 이미지 로드 실패 (시도 ${retryCount + 1}/${maxRetries + 1}):`, uri);
    setAttemptingLoad(false);
    
    if (retryCount < maxRetries) {
      // 재시도 시 더 긴 지연 시간 적용 (지수 백오프)
      const backoffDelay = retryDelay * Math.pow(2, retryCount);
      setRetryCount(prev => prev + 1);
      setImageLoaded(false);
      setImageError(false);
      
      console.log(`🔄 ${backoffDelay}ms 후 재시도 ${retryCount + 2}/${maxRetries + 1}:`, uri);
      retryTimeoutRef.current = setTimeout(() => {
        setAttemptingLoad(true);
        // 강제로 key를 변경하여 이미지 컴포넌트 재마운트
        setImageLoaded(false);
      }, backoffDelay);
    } else {
      // 최대 재시도 횟수 초과
      console.log(`💔 최대 재시도 횟수 초과:`, uri);
      setImageError(true);
      setImageLoaded(false);
    }
  }, [retryCount, maxRetries, retryDelay, uri]);

  // URI가 변경되면 상태 초기화
  const [currentUri, setCurrentUri] = useState(uri);
  if (currentUri !== uri) {
    setCurrentUri(uri);
    setImageLoaded(false);
    setImageError(false);
    setRetryCount(0);
    setAttemptingLoad(false);
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
  }

  // 초기 로딩 시작
  React.useEffect(() => {
    if (!attemptingLoad && !imageLoaded && !imageError && isValidUri) {
      const initialDelay = loadDelay + (Math.random() * 1000); // 랜덤 지연을 1초로 증가
      console.log(`🚀 이미지 로딩 시작 (${Math.round(initialDelay)}ms 지연):`, uri);
      
      loadTimeoutRef.current = setTimeout(() => {
        setAttemptingLoad(true);
      }, initialDelay);
    }
    
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
    };
  }, [uri, attemptingLoad, imageLoaded, imageError, loadDelay, isValidUri]);

  if (!isValidUri || imageError) {
    return (
      <View style={[style, placeholderStyle, styles.placeholder]}>
        <Ionicons 
          name={fallbackIcon as any} 
          size={fallbackIconSize} 
          color={fallbackIconColor} 
        />
      </View>
    );
  }

  if (!attemptingLoad) {
    return (
      <View style={[style, placeholderStyle, styles.placeholder]}>
        <Ionicons 
          name={fallbackIcon as any} 
          size={fallbackIconSize} 
          color={fallbackIconColor} 
        />
      </View>
    );
  }

  return (
    <View style={style}>
      <Image
        {...props}
        key={`${uri}-${retryCount}`}
        source={{ 
          uri,
          cache: 'force-cache',
        }}
        style={[StyleSheet.absoluteFillObject]}
        onLoad={handleImageLoad}
        onError={handleImageError}
        defaultSource={undefined}
        fadeDuration={0}
      />
      
      {/* 로딩 중일 때만 플레이스홀더 표시 */}
      {!imageLoaded && (
        <Animated.View 
          exiting={FadeOut.duration(300)}
          style={[StyleSheet.absoluteFillObject, styles.placeholder]}
        >
          <Ionicons 
            name={fallbackIcon as any} 
            size={fallbackIconSize} 
            color={fallbackIconColor} 
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(28, 134, 160, 0.2)',
  },
});

export default ReliableImage;

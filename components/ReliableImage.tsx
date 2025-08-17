import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Image, View, ImageProps, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeOut } from 'react-native-reanimated';

interface ReliableImageProps extends Omit<ImageProps, 'source'> {
  uri: string;
  fallbackIcon?: string;
  fallbackIconSize?: number;
  fallbackIconColor?: string;
  placeholderStyle?: any;
  maxRetries?: number;
  retryDelay?: number;          // 기본 2^n 백오프의 base(ms)
  loadDelay?: number;           // 초기 로딩 지연
  onImageLoaded?: () => void;   // 성공 콜백
  enableUrlFallback?: boolean;  // URL 대체(사이즈/호스트) 전략
}

const ReliableImage: React.FC<ReliableImageProps> = ({
  uri,
  style,
  fallbackIcon = 'musical-note',
  fallbackIconSize = 32,
  fallbackIconColor = '#1C86A0',
  placeholderStyle,
  maxRetries = 3,
  retryDelay = 2000,
  loadDelay = 0,
  onImageLoaded,
  enableUrlFallback = true,
  ...props
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [attemptingLoad, setAttemptingLoad] = useState(false);
  const [currentImageUri, setCurrentImageUri] = useState(uri);
  const [currentUri, setCurrentUri] = useState(uri);

  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isValidUri = !!currentImageUri && currentImageUri.startsWith('http');

  /** 쿼리 파라미터 붙이기 (캐시 버스터) */
  const appendQuery = (url: string, q: Record<string, string>) => {
    try {
      const u = new URL(url);
      Object.entries(q).forEach(([k, v]) => u.searchParams.set(k, v));
      return u.toString();
    } catch {
      // URL API가 실패할 경우 (드문 케이스) 수동으로
      const hasQ = url.includes('?');
      const extra = Object.entries(q)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
      return `${url}${hasQ ? '&' : '?'}${extra}`;
    }
  };

  /** Apple 이미지 마지막 사이즈 세그먼트만 안전하게 교체 */
  const swapAppleSize = (u: string, size: number) =>
    u.replace(/\/\d+x\d+bb\.(jpg|png|webp)(\?.*)?$/i, `/${size}x${size}bb.jpg$2`);

  /** URL 대체 전략: 사이즈 + 엣지 호스트(is1-ssl~is6-ssl) 스왑 */
  const getAlternativeUri = useCallback(
    (originalUri: string, attemptNumber: number): string => {
      if (!enableUrlFallback || !/mzstatic\.com/.test(originalUri)) return originalUri;

      const sizes = [100, 200, 60, 300]; // 다양한 라우팅 유도
      const size = sizes[attemptNumber % sizes.length];

      // 1) 사이즈 세그먼트 변경
      let alt = swapAppleSize(originalUri, size);

      // 2) 엣지 호스트 라운드로빈
      alt = alt.replace(/https:\/\/is(\d)-ssl\./, (_m, _d) => {
        const next = 1 + (attemptNumber % 6);
        return `https://is${next}-ssl.`;
      });

      return alt;
    },
    [enableUrlFallback]
  );

  /** source 생성: 재시도 시 cache:'reload' + 캐시버스터 적용 */
  const buildSource = (baseUri: string, retry: number) => {
    const withBuster =
      retry > 0
        ? appendQuery(baseUri, {
            rn_retry: String(retry),
            ts: String(Date.now()),
          })
        : baseUri;

    const source: any = { uri: withBuster };
    if (retry > 0) {
      // 재시도부터는 디스크/메모리 캐시 무시하고 재요청
      source.cache = 'reload';
    }
    return source;
  };

  /** 성공 핸들러 */
  const handleImageLoad = useCallback(() => {
    console.log(`✅ 이미지 로드 성공:`, currentImageUri);
    setImageLoaded(true);
    setImageError(false);
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
    onImageLoaded?.();
  }, [currentImageUri, onImageLoaded]);

  /** 실패 핸들러 */
  const handleImageError = useCallback(
    (error: any) => {
      const message = error?.nativeEvent?.error || 'Unknown error';
      console.log(
        `❌ 이미지 로드 실패 (시도 ${retryCount + 1}/${maxRetries + 1}):`,
        currentImageUri
      );
      console.log(
        `🔍 에러 상세:`,
        JSON.stringify(
          {
            message,
            uri: currentImageUri,
            attempt: retryCount + 1,
            maxRetries: maxRetries + 1,
          },
          null,
          2
        )
      );

      setAttemptingLoad(false);

      if (retryCount < maxRetries) {
        // 현재 시도한 URL을 기준으로 "단계적 변형"
        const altFrom = currentImageUri;
        const nextBase = getAlternativeUri(altFrom, retryCount + 1);
        const nextWithBuster = appendQuery(nextBase, {
          rn_retry: String(retryCount + 1),
          ts: String(Date.now()),
        });

        console.log('🔄 ALT from', altFrom, '→', nextWithBuster);

        const backoffDelay = retryDelay * Math.pow(2, retryCount);
        setRetryCount((prev) => prev + 1);
        setImageLoaded(false);
        setImageError(false);
        setCurrentImageUri(nextWithBuster);

        console.log(
          `🔄 ${backoffDelay}ms 후 재시도 ${retryCount + 2}/${maxRetries + 1}:`,
          nextWithBuster
        );

        retryTimeoutRef.current = setTimeout(() => {
          setAttemptingLoad(true);
          // key 변경 효과는 retryCount로 충분 (Image remount 유도)
        }, backoffDelay);
      } else {
        console.log(`💔 최대 재시도 횟수 초과:`, currentImageUri);
        setImageError(true);
        setImageLoaded(false);
      }
    },
    [retryCount, maxRetries, retryDelay, currentImageUri, getAlternativeUri]
  );

  /** 외부에서 uri가 바뀌면 상태 초기화 */
  if (currentUri !== uri) {
    setCurrentUri(uri);
    setCurrentImageUri(uri);
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

  /** 초기 로딩 트리거 (랜덤 지연 포함) */
  useEffect(() => {
    if (!attemptingLoad && !imageLoaded && !imageError && isValidUri) {
      const initialDelay = loadDelay + Math.random() * 1000;
      console.log(`🚀 이미지 로딩 시작 (${Math.round(initialDelay)}ms 지연):`, currentImageUri);

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
  }, [attemptingLoad, imageLoaded, imageError, loadDelay, isValidUri, currentImageUri]);

  /** 플레이스홀더 (잘못된 URI or 최종 실패) */
  if (!isValidUri || imageError) {
    return (
      <View style={[style, placeholderStyle, styles.placeholder]}>
        <Ionicons name={fallbackIcon as any} size={fallbackIconSize} color={fallbackIconColor} />
      </View>
    );
  }

  /** 아직 로딩 시작 전 */
  if (!attemptingLoad) {
    return (
      <View style={[style, placeholderStyle, styles.placeholder]}>
        <Ionicons name={fallbackIcon as any} size={fallbackIconSize} color={fallbackIconColor} />
      </View>
    );
  }

  return (
    <View style={style}>
      <Image
        {...props}
        key={`${currentImageUri}-${retryCount}`} // 재시도마다 remount
        source={buildSource(currentImageUri, retryCount)}
        style={[StyleSheet.absoluteFillObject]}
        onLoad={handleImageLoad}
        onError={handleImageError}
        defaultSource={undefined}
        fadeDuration={0}
      />

      {!imageLoaded && (
        <Animated.View
          exiting={FadeOut.duration(300)}
          style={[StyleSheet.absoluteFillObject, styles.placeholder]}
        >
          <Ionicons name={fallbackIcon as any} size={fallbackIconSize} color={fallbackIconColor} />
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

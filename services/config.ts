// API 설정 및 환경 관리

export const API_CONFIG = {
  // 환경별 베이스 URL
  BASE_URL: {
    development: 'http://localhost:8080',
    staging: 'https://staging-api.playce.com',
    production: 'https://api.playce.com',
  },
  
  // API 버전
  VERSION: 'v1',
  
  // 타임아웃 설정 (밀리초)
  TIMEOUT: 100000,
  
  // 헤더 설정
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
} as const;

// 환경 감지 함수
export const getEnvironment = (): keyof typeof API_CONFIG.BASE_URL => {
  // Expo 개발 환경
  if (__DEV__) {
    return 'development';
  }
  
  // TODO: 실제 배포 시에는 환경 변수로 구분
  // const env = process.env.EXPO_PUBLIC_ENV || 'production';
  // return env as keyof typeof API_CONFIG.BASE_URL;
  
  return 'production';
};

// 베이스 URL 가져오기
export const getBaseUrl = (): string => {
  const env = getEnvironment();
  return API_CONFIG.BASE_URL[env];
};

// API 엔드포인트 정의
export const ENDPOINTS = {
  // 플레이리스트 생성 API
  PLAYLIST: '/playlist/generate',
  // 스트리밍 플레이리스트 생성 API
  PLAYLIST_STREAM: '/playlist/generate/stream',
} as const;

// 완전한 API URL 생성
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = getBaseUrl();
  const version = API_CONFIG.VERSION;
  return `${baseUrl}/api/${version}${endpoint}`;
};

// API 키 또는 인증 토큰 관리 (향후 확장용)
export const getAuthHeaders = (): Record<string, string> => {
  // TODO: 실제 인증 구현 시 토큰 추가
  // const token = await getStoredToken();
  // if (token) {
  //   return { ...API_CONFIG.HEADERS, Authorization: `Bearer ${token}` };
  // }
  
  return API_CONFIG.HEADERS;
};

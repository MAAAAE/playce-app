// API 타입 정의

export interface PlaylistRequestDto {
  destination: string; // 필수: 한국 여행지 (예: "서울 경복궁", "부산 해운대", "제주 성산일출봉")
  season?: string; // 선택: 계절 정보 (기본값: "사계절")
  playlistSize?: number; // 선택: 플레이리스트 크기 5-10 (기본값: 20)
}

export interface PlaylistResponseDto {
  destination: string;
  recommendations: SongRecommendation[];
}

export interface SongRecommendation {
  title: string; // 영문 제목
  artist: string; // 아티스트명
  reason: string; // 추천 이유 (1줄)
  cover: string; // 앨범 커버 URL
}

// 스트리밍 응답 타입
export interface StreamingSongData {
  title: string;
  artist: string;
  reason: string;
  cover: string;
  index: number; // 곡 순서
  total: number; // 전체 곡 수
}

export interface StreamingStatus {
  type: 'song' | 'complete' | 'error';
  data?: StreamingSongData | PlaylistResponseDto;
  error?: string;
}

// API 에러 응답 타입
export interface ApiErrorResponse {
  message: string;
  timestamp: string;
}

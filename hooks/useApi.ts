// React Hook for API calls - 검색창에서 관광지 플레이리스트 호출

import { useState } from 'react';
import PlayceAPI from '../services/api';
import { PlaylistRequestDto, PlaylistResponseDto } from '../types/api';

// API 호출 결과 타입
export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

// 검색창에서 사용할 플레이리스트 호출 훅
export const usePlaylistSearch = (): {
  searchPlaylist: (request: PlaylistRequestDto) => Promise<PlaylistResponseDto | null>;
  loading: boolean;
  error: Error | null;
} => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  const searchPlaylist = async (request: PlaylistRequestDto): Promise<PlaylistResponseDto | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await PlayceAPI.playlist.getPlaylistRecommendations(request);
      return result;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    searchPlaylist,
    loading,
    error,
  };
};

// 에러 메시지 헬퍼
export const getErrorMessage = (error: Error): string => {
  return error.message || '플레이리스트를 불러오는데 실패했습니다.';
};

// Playce API 서비스

import {httpClient, httpGet, HttpResponse} from './httpClient';
import { ENDPOINTS } from './config';
import {
  PlaylistRequestDto,
  PlaylistResponseDto,
} from '../types/api';
import { Place } from '@/data/mockData';

// 검색 API 서비스
export class SearchService {
  static async searchAttractions(keyword: string): Promise<Place[]> {
    if (!keyword.trim()) {
      return [];
    }

    try {
      const endpoint = `${ENDPOINTS.ATTRACTIONS_SEARCH}?keyword=${keyword}`;
      const response: HttpResponse<Place[]> = await httpGet(endpoint);
      return response.data;
    } catch (error) {

      console.error('Search API 호출 실패:', error);
      throw error;
    }
  }
}

// 플레이리스트 API 서비스
export class PlaylistService {
  /**
   * 여행지 기반 플레이리스트 추천을 요청합니다
   */
  static async getPlaylistRecommendations(
    request: PlaylistRequestDto
  ): Promise<PlaylistResponseDto> {
    // 요청 검증
    this.validatePlaylistRequest(request);
    
    try {
      const response: HttpResponse<PlaylistResponseDto> = await httpClient(
        ENDPOINTS.PLAYLIST,
        {
          method: 'POST',
          body: request,
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Playlist API 호출 실패:', error);
      throw error;
    }
  }
  
  /**
   * 요청 데이터 검증
   */
  private static validatePlaylistRequest(request: PlaylistRequestDto): void {
    // destination 필수 필드 검증
    if (!request.destination?.trim()) {
      throw new Error('destination은 필수 필드입니다.');
    }
    
    // playlistSize 범위 검증 (5-10, 기본값 20)
    if (request.playlistSize !== undefined) {
      if (request.playlistSize < 5 || request.playlistSize > 10) {
        throw new Error('playlistSize는 5-10 범위여야 합니다.');
      }
    }
  }
}

// 메인 API 클래스 (모든 서비스를 통합)
export class PlayceAPI {
  static playlist = PlaylistService;
  static search = SearchService;
}

// 기본 내보내기
export default PlayceAPI;

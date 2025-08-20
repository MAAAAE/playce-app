// 스트리밍 API 클라이언트 - React Native SSE 구현

import { buildApiUrl, getAuthHeaders } from './config';
import { PlaylistRequestDto, StreamingSongData, PlaylistResponseDto } from '../types/api';
import EventSource from 'react-native-sse';

export class StreamingApiClient {
  private eventSource: EventSource | null = null;
  
  /**
   * 스트리밍으로 플레이리스트를 생성합니다 (React Native SSE 사용)
   */
  async generatePlaylistStream(
    request: PlaylistRequestDto,
    callbacks: {
      onSong: (song: StreamingSongData) => void;
      onComplete: (playlist: PlaylistResponseDto) => void;
      onError: (error: string) => void;
    }
  ): Promise<void> {
    try {
      this.closeConnection();
      
      const url = buildApiUrl('/playlist/generate/stream');
      const authHeaders = await getAuthHeaders();
      
      const eventSourceConfig = {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify(request),
        pollingInterval: 0, // Disables polling, relies on server-sent events
        debug: false,
      };
      
      this.eventSource = new EventSource(url, eventSourceConfig);
      
      this.eventSource.addEventListener('open', () => {
        // Connection opened
      });
      
      this.eventSource.addEventListener('message', (event: any) => {
        this.handleEventData(event.data, request, callbacks);
      });
      
      // Custom event for playlist updates
      this.eventSource.addEventListener('playlist-update', (event: any) => {
        this.handleEventData(event.data, request, callbacks);
      });
      
      this.eventSource.addEventListener('error', (event: any) => {
        if (event.type === 'error') {
          callbacks.onError(event.message ? `Connection error: ${event.message}` : 'Unknown connection error');
        } else if (event.type === 'exception') {
          callbacks.onError(`Exception: ${event.message || 'An unknown exception occurred'}`);
        }
        this.closeConnection();
      });
      
    } catch (error) {
      callbacks.onError(error instanceof Error ? error.message : 'Failed to start streaming connection.');
    }
  }
  
  /**
   * 이벤트 데이터 처리 (공통 로직)
   */
  private handleEventData(
    data: string,
    request: PlaylistRequestDto,
    callbacks: {
      onSong: (song: StreamingSongData) => void;
      onComplete: (playlist: PlaylistResponseDto) => void;
      onError: (error: string) => void;
    }
  ): void {
    if (data === '[DONE]') {
      const playlistData: PlaylistResponseDto = {
        destination: request.destination,
        recommendations: [], // Recommendations will be filled by the onSong callbacks
      };
      callbacks.onComplete(playlistData);
      this.closeConnection();
      return;
    }
    
    try {
      const serverData = JSON.parse(data);
      this.handleServerMessage(serverData, request, callbacks);
    } catch (parseError) {
      // Ignore parsing errors for non-JSON messages
    }
  }

  /**
   * 서버 메시지 처리
   */
  private handleServerMessage(
    serverData: any, 
    request: PlaylistRequestDto,
    callbacks: {
      onSong: (song: StreamingSongData) => void;
      onComplete: (playlist: PlaylistResponseDto) => void;
      onError: (error: string) => void;
    }
  ): void {
    switch (serverData.type) {
      case 'SONG':
        if (serverData.data) {
          const songData: StreamingSongData = {
            title: serverData.data.title,
            artist: serverData.data.artist,
            reason: serverData.data.reason,
            cover: serverData.data.cover,
            index: serverData.data.index,
            total: request.playlistSize || 5,
          };
          callbacks.onSong(songData);
        }
        break;
      case 'COMPLETE':
        const playlistData: PlaylistResponseDto = {
          destination: request.destination,
          recommendations: [],
        };
        callbacks.onComplete(playlistData);
        this.closeConnection();
        break;
      case 'START':
      case 'PROGRESS':
        // Informational messages, do nothing
        break;
      default:
        // Unknown message type
        break;
    }
  }
  
  /**
   * SSE 연결을 종료합니다
   */
  closeConnection(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}

// 싱글톤 인스턴스
export const streamingApi = new StreamingApiClient();
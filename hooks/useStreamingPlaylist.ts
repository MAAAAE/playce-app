// 스트리밍 플레이리스트 생성을 위한 React Hook

import { useState, useCallback, useRef } from 'react';
import { streamingApi } from '../services/streamingApi';
import { PlaylistRequestDto, StreamingSongData, PlaylistResponseDto } from '../types/api';

export interface UseStreamingPlaylistResult {
  currentSong: StreamingSongData | null;
  loading: boolean;
  error: string | null;
  progress: number;
  generatePlaylist: (request: PlaylistRequestDto) => Promise<PlaylistResponseDto | null>;
  cancelGeneration: () => void;
}

export const useStreamingPlaylist = (): UseStreamingPlaylistResult => {
  const [currentSong, setCurrentSong] = useState<StreamingSongData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const completedPlaylistRef = useRef<PlaylistResponseDto | null>(null);
  const completedSongsRef = useRef<StreamingSongData[]>([]);
  
  const generatePlaylist = useCallback(async (request: PlaylistRequestDto): Promise<PlaylistResponseDto | null> => {
    setLoading(true);
    setError(null);
    setCurrentSong(null);
    setProgress(0);
    completedPlaylistRef.current = null;
    completedSongsRef.current = [];
    
    return new Promise((resolve) => {
      streamingApi.generatePlaylistStream(request, {
        onSong: (song: StreamingSongData) => {
          completedSongsRef.current = [...completedSongsRef.current, song];
          setCurrentSong(song);
          
          const newProgress = song.total > 0 ? completedSongsRef.current.length / song.total : 0;
          setProgress(newProgress);
        },
        
        onComplete: (playlist: PlaylistResponseDto) => {
          const completedPlaylist: PlaylistResponseDto = {
            destination: request.destination,
            recommendations: completedSongsRef.current.map(song => ({
              title: song.title,
              artist: song.artist,
              reason: song.reason,
              cover: song.cover,
            }))
          };
          
          setLoading(false);
          setProgress(1);
          completedPlaylistRef.current = completedPlaylist;
          resolve(completedPlaylist);
        },
        
        onError: (errorMessage: string) => {
          setLoading(false);
          setError(errorMessage);
          setProgress(0);
          resolve(null);
        }
      });
    });
  }, []);
  
  const cancelGeneration = useCallback(() => {
    streamingApi.closeConnection();
    setLoading(false);
    setError(null);
    setProgress(0);
  }, []);
  
  return {
    currentSong,
    loading,
    error,
    progress,
    generatePlaylist,
    cancelGeneration,
  };
};

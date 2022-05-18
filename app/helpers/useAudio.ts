import * as React from 'react';
import { useInterval } from './useInterval';

export const useAudio = (url: string | undefined) => {
  const audioRef = React.useRef<HTMLAudioElement>();
  React.useEffect(() => {
    audioRef.current = new Audio(url);
    audioRef.current.volume = 0.6; // nobody wants music to start blasting into their ears
  }, [url]);

  const [isPlaying, setIsPlaying] = React.useState(false);
  React.useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play();
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying]);

  const [currentTime, _setCurrentTime] = React.useState(0);
  const [volume, _setVolume] = React.useState<number>(0.6);
  const [playbackRate, _setPlaybackRate] = React.useState<number>(1);

  // keep react state in sync with the audio element's currentTime
  useInterval(() => _setCurrentTime(Math.round(audioRef.current?.currentTime ?? 0)), isPlaying ? 500 : null);

  // wrapper around _setCurrentTime to update the actual currentTime of the audio element
  const setCurrentTime = React.useCallback((value: number) => {
    _setCurrentTime(value);
    if (audioRef.current != null && audioRef.current.currentTime !== value) {
      audioRef.current.currentTime = value;
    }
  }, []);

  // wrapper around _setVolume to update the actual volume of the audio element
  const setVolume = React.useCallback((volume: number) => {
    _setVolume(volume);
    if (audioRef.current != null) {
      audioRef.current.volume = volume;
    }
  }, []);

  // wrapper around _setPlaybackRate to update the actual playbackRate of the audio element
  const setPlaybackRate = React.useCallback((playbackRate: number) => {
    _setPlaybackRate(playbackRate);
    if (audioRef.current != null) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, []);

  return {
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    volume,
    setVolume,
    playbackRate,
    setPlaybackRate,
    audioRef,
  };
};

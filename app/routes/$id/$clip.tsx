import * as React from 'react';
import { useHref, useMatches, useParams, useTransition } from 'remix';
import type { LinksFunction, MetaFunction } from 'remix';
import { useAudio } from '~/helpers/useAudio';
import { Button } from '~/helpers/Button';
import { Slider } from '~/helpers/Slider';
import { IconButton } from '~/helpers/IconButton';
import { formatToMinutesAndSeconds } from '~/helpers/time';
import { Share2, Youtube, Play, Pause, Volume, Volume1, Volume2, VolumeX } from 'react-feather';
import { useSliderState } from '@react-stately/slider';
import styles from './$clip.css';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: Slider.styles },
  { rel: 'stylesheet', href: Button.styles },
  { rel: 'stylesheet', href: IconButton.styles },
  { rel: 'stylesheet', href: styles },
];

export const meta: MetaFunction = ({ params, parentsData }) => {
  const { songName, artist } = parentsData['routes/$id'];
  const [start, end] = (params.clip as string).split(',').map(Number).map(formatToMinutesAndSeconds);

  return {
    title: `riffs | ${songName} - ${artist}`,
    'og:title': `riffs | ${songName} - ${artist}`,
    'twitter:title': `riffs | ${songName} - ${artist}`,
    description: `Listen to ${start}-${end} "${songName} - ${artist}"`,
    'og:description': `Listen to ${start}-${end} "${songName} - ${artist}"`,
    'twitter:description': `Listen to ${start}-${end} "${songName} - ${artist}"`,
  };
};

export default function $clip() {
  const { id, clip } = useParams();
  const transition = useTransition();

  if (!id || !clip) {
    throw new Error('Invalid route');
  }

  const { songName, artist } = useMatches().find(({ pathname }) => pathname == `/${id}`)?.data!;
  const currentHref = useHref('');
  const fileRef = React.useRef<File>();
  const [start, end] = clip.split(',').map(Number);

  const {
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    volume,
    setVolume,
    playbackRate,
    setPlaybackRate,
    audioRef,
  } = useAudio(`/resource/${id}/${clip}`);

  // stop audio when navigating away
  if (transition.state === 'loading') {
    audioRef.current?.pause();
  }

  const duration = audioRef.current?.duration ?? Math.round(end - start);

  React.useEffect(() => {
    (async () => {
      const blob = await fetch(`/resource/${id}/${clip}`).then((res) => res.blob());
      fileRef.current = new File([blob], `${songName}-${clip}.mp3`, { type: 'audio/mpeg' });
    })();
  }, [clip, id, songName]);

  const currentTimeSliderState = useSliderState({
    numberFormatter: React.useMemo(() => new Intl.NumberFormat(), []),
    minValue: start,
    maxValue: end,
    defaultValue: [start],
    value: [start + currentTime],
    onChange: React.useCallback(([value]) => setCurrentTime(value - start), [setCurrentTime, start]),
  });

  const handleShare = () => {
    if (fileRef.current && navigator.canShare?.({ files: [fileRef.current] })) {
      navigator.share({
        files: [fileRef.current],
        text: `Check out this riff from ${artist}`,
        url: `${window.origin}${currentHref}`,
      });
    } else if (navigator.share) {
      navigator.share({
        title: `Check out this riff from ${artist}`,
        text: `${window.origin}${currentHref}`,
      });
    }
  };

  return (
    <>
      <div className='media-controls'>
        <IconButton
          aria-label='Change volume'
          onClick={() => {
            switch (volume) {
              case 0:
                return setVolume(0.3);
              case 0.3:
                return setVolume(0.6);
              case 0.6:
                return setVolume(0.9);
              case 0.9:
                return setVolume(0);
            }
          }}
        >
          <VolumeX data-active={volume === 0} strokeWidth={1.5} aria-hidden />
          <Volume data-active={volume === 0.3} strokeWidth={1.5} aria-hidden />
          <Volume1 data-active={volume === 0.6} strokeWidth={1.5} aria-hidden />
          <Volume2 data-active={volume === 0.9} strokeWidth={1.5} aria-hidden />
        </IconButton>

        <IconButton onClickCapture={() => setIsPlaying((p) => !p)} aria-label='Play/pause the song'>
          <Pause data-active={isPlaying} strokeWidth={1.5} aria-hidden />
          <Play data-active={!isPlaying} strokeWidth={1.5} aria-hidden />
        </IconButton>

        <IconButton
          onClick={() => {
            switch (playbackRate) {
              case 0.5:
                return setPlaybackRate(1);
              case 1:
                return setPlaybackRate(1.5);
              case 1.5:
                return setPlaybackRate(2);
              case 2:
                return setPlaybackRate(0.5);
            }
          }}
        >
          <span className='playback-rate' data-active={playbackRate === 0.5} aria-hidden={playbackRate !== 0.5}>
            0.5x
          </span>
          <span className='playback-rate' data-active={playbackRate === 1} aria-hidden={playbackRate !== 1}>
            1x
          </span>
          <span className='playback-rate' data-active={playbackRate === 1.5} aria-hidden={playbackRate !== 1.5}>
            1.5x
          </span>
          <span className='playback-rate' data-active={playbackRate === 2} aria-hidden={playbackRate !== 2}>
            2x
          </span>
        </IconButton>
      </div>

      <div className='media-slider-wrapper'>
        <div>{formatToMinutesAndSeconds(start)}</div>

        <Slider maxValue={duration} defaultValue={[0]} step={1} state={currentTimeSliderState}>
          <Slider.Thumb className='progress-thumb' aria-label='Seek audio clip' supressOutput />
        </Slider>

        <div>{formatToMinutesAndSeconds(end)}</div>
      </div>

      <div className='button-bar'>
        <Button onClick={() => handleShare()}>
          <span>Share</span>
          <Share2 strokeWidth={1.5} />
        </Button>
        <Button variant='outline' href={`https://youtu.be/${id}`} target='_blank'>
          <span>YouTube</span>
          <Youtube strokeWidth={1.5} />
        </Button>
      </div>
    </>
  );
}

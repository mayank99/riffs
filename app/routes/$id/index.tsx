import * as React from 'react';
import { useParams, Link, useTransition, useMatches } from 'remix';
import type { LinksFunction } from 'remix';
import { useInterval } from '~/helpers/useInterval';
import { Slider } from '~/helpers/Slider';
import { useSliderState } from '@react-stately/slider';
import styles from './index.css';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: Slider.styles },
  { rel: 'stylesheet', href: styles },
];

export default function Index() {
  const { id = '' } = useParams();
  const transition = useTransition();

  // get duration from parent loader
  const duration = useMatches().find(({ pathname }) => pathname == `/${id}`)?.data.duration ?? 0;

  const center = Math.floor(duration / 2);

  const clipSliderState = useSliderState({
    numberFormatter: React.useMemo(() => new Intl.NumberFormat(), []),
    maxValue: duration,
    defaultValue: [center - 15, center + 15],
  });

  const audioRef = React.useRef<HTMLAudioElement>();
  React.useEffect(() => {
    audioRef.current = new Audio(`/resource/${id}`);
  }, [id]);

  const [isPlaying, setIsPlaying] = React.useState(false);
  React.useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play();
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying]);

  const [currentTime, setCurrentTime] = React.useState(0);
  useInterval(() => setCurrentTime(Math.round(audioRef.current?.currentTime ?? 0)), isPlaying ? 1000 : null);

  const currentTimeSliderState = useSliderState({
    numberFormatter: React.useMemo(() => new Intl.NumberFormat(), []),
    maxValue: duration,
    defaultValue: [0],
    value: [currentTime],
    onChange: React.useCallback(([value]) => {
      setCurrentTime(value);
      if (audioRef.current != null && audioRef.current.currentTime !== value) {
        audioRef.current.currentTime = value;
      }
    }, []),
  });

  return (
    <>
      <button className='play-pause-button' onClick={() => setIsPlaying((p) => !p)} aria-label='Play/pause the song'>
        {isPlaying ? <SvgPause /> : <SvgPlay />}
      </button>

      <div className='slider-container'>
        <Slider maxValue={duration} defaultValue={[0]} step={1} state={currentTimeSliderState}>
          <Slider.Thumb className='progress-thumb' aria-label='Current time' />
        </Slider>

        <Slider
          maxValue={duration}
          defaultValue={[center - 15, center + 15]}
          step={1}
          state={clipSliderState}
          style={{
            '--highlight-inset': `auto ${100 - clipSliderState.getThumbPercent(1) * 100}% auto ${
              clipSliderState.getThumbPercent(0) * 100
            }%`,
          }}
        >
          <Slider.Thumb className='clip-thumb' aria-label='Start time for riff' />
          <Slider.Thumb className='clip-thumb' aria-label='End time for riff' />
        </Slider>
      </div>

      <Link
        to={`${clipSliderState.getThumbValue(0)},${clipSliderState.getThumbValue(1)}`}
        className={`clip-action ${transition.state !== 'idle' ? 'loading' : ''}`}
      >
        <span className='clip-action-content'>Clip</span>
      </Link>
    </>
  );
}

const SvgPlay = () => (
  <svg width='15' height='15' viewBox='0 0 15 15' fill='none'>
    <path
      d='M3.24182 2.32181C3.3919 2.23132 3.5784 2.22601 3.73338 2.30781L12.7334 7.05781C12.8974 7.14436 13 7.31457 13 7.5C13 7.68543 12.8974 7.85564 12.7334 7.94219L3.73338 12.6922C3.5784 12.774 3.3919 12.7687 3.24182 12.6782C3.09175 12.5877 3 12.4252 3 12.25V2.75C3 2.57476 3.09175 2.4123 3.24182 2.32181ZM4 3.57925V11.4207L11.4288 7.5L4 3.57925Z'
      fill='currentColor'
      fillRule='evenodd'
      clipRule='evenodd'
    />
  </svg>
);

const SvgPause = () => (
  <svg width='15' height='15' viewBox='0 0 15 15' fill='none'>
    <path
      d='M6.04995 2.74998C6.04995 2.44623 5.80371 2.19998 5.49995 2.19998C5.19619 2.19998 4.94995 2.44623 4.94995 2.74998V12.25C4.94995 12.5537 5.19619 12.8 5.49995 12.8C5.80371 12.8 6.04995 12.5537 6.04995 12.25V2.74998ZM10.05 2.74998C10.05 2.44623 9.80371 2.19998 9.49995 2.19998C9.19619 2.19998 8.94995 2.44623 8.94995 2.74998V12.25C8.94995 12.5537 9.19619 12.8 9.49995 12.8C9.80371 12.8 10.05 12.5537 10.05 12.25V2.74998Z'
      fill='currentColor'
      fillRule='evenodd'
      clipRule='evenodd'
    ></path>
  </svg>
);

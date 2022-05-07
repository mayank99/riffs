import * as React from 'react';
import type { LinksFunction, LoaderFunction } from 'remix';
import { useParams } from 'remix';
import { Link } from 'remix';
import { useTransition } from 'remix';
import { useLoaderData } from 'remix';
import dl from 'ytdl-core';
import { useSlider, useSliderThumb } from '@react-aria/slider';
import type { SliderState } from '@react-stately/slider';
import { useSliderState } from '@react-stately/slider';
import styles from './$id.css';

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: styles }];

export const loader: LoaderFunction = async ({ params }) => {
  const { id = '' } = params;
  const { videoDetails } = await dl.getInfo(id, { requestOptions: {} });

  return {
    songName: videoDetails.media.song ?? videoDetails.title,
    artist: videoDetails.media.artist ?? videoDetails.ownerChannelName.replace(' - Topic', ''),
    duration: videoDetails.lengthSeconds,
  };
};

export default function $id() {
  const { id = '' } = useParams();
  const { songName, artist, duration } = useLoaderData();
  const transition = useTransition();

  const center = Math.floor(duration / 2);

  const sliderState = useSliderState({
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

  return (
    <>
      <h2>
        {songName}
        {'\n'}
        {artist}
      </h2>
      <button className='play-pause-button' onClick={() => setIsPlaying((p) => !p)} aria-label='Play/pause the song'>
        {isPlaying ? <SvgPause /> : <SvgPlay />}
      </button>
      <RangeSlider maxValue={duration} defaultValue={[center - 15, center + 15]} step={1} state={sliderState} />
      <Link
        to={`${sliderState.getThumbValue(0)},${sliderState.getThumbValue(1)}`}
        className={`clip-action ${transition.state !== 'idle' ? 'loading' : ''}`}
      >
        <span className='clip-action-content'>Clip</span>
      </Link>
    </>
  );
}

const RangeSlider = ({
  state,
  ...props
}: {
  maxValue: number;
  defaultValue: [number, number];
  step: number;
  state: SliderState;
}) => {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const { groupProps, trackProps, outputProps } = useSlider(props, state, trackRef);

  const htmlFors = React.useMemo(() => outputProps.htmlFor?.split(' '), [outputProps.htmlFor]);

  return (
    <div
      {...groupProps}
      className='slider'
      style={{
        '--highlight-inset': `auto ${100 - state.getThumbPercent(1) * 100}% auto ${state.getThumbPercent(0) * 100}%`,
      }}
    >
      <div {...trackProps} className='track' ref={trackRef}>
        <Thumb index={0} state={state} trackRef={trackRef} id={htmlFors?.[0]} aria-label='Start time for riff' />
        <Thumb index={1} state={state} trackRef={trackRef} id={htmlFors?.[1]} aria-label='End time for riff' />
      </div>
    </div>
  );
};

const Thumb = (props: {
  state: SliderState;
  trackRef: React.RefObject<HTMLDivElement>;
  index: number;
  id?: string;
  'aria-label': string;
}) => {
  const { state, trackRef, index, id, 'aria-label': ariaLabel } = props;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { thumbProps, inputProps } = useSliderThumb({ index, trackRef, inputRef }, state);
  return (
    <div {...thumbProps} className='thumb' style={{ '--left': `${state.getThumbPercent(index) * 100}%` }}>
      <div className='visually-hidden'>
        <input ref={inputRef} {...inputProps} aria-label={ariaLabel} aria-labelledby={undefined} />
      </div>
      <output htmlFor={id}>{formatToMinutesAndSeconds(state.getThumbValue(index))}</output>
    </div>
  );
};

const formatToMinutesAndSeconds = (value: number) => {
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

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

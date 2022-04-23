import * as React from 'react';
import type { LinksFunction, LoaderFunction } from 'remix';
import { useParams } from 'remix';
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
  const { id } = useParams();
  const { songName, artist, duration } = useLoaderData();

  const center = Math.floor(duration / 2);

  const state = useSliderState({
    numberFormatter: React.useMemo(() => new Intl.NumberFormat(), []),
    maxValue: duration,
    defaultValue: [center - 15, center + 15],
  });

  return (
    <>
      <h2>
        {songName}
        {'\n'}
        {artist}
      </h2>
      <RangeSlider maxValue={duration} defaultValue={[center - 15, center + 15]} step={1} state={state} />
      <a href={`/resource/${id}/${state.getThumbValue(0)},${state.getThumbValue(1)}`} className='clip-action'>
        <span className='clip-action-content'>Clip</span>
      </a>
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

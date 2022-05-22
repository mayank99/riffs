import * as React from 'react';
import { useParams, useTransition, useMatches, Form, redirect, useActionData, json } from 'remix';
import type { LinksFunction, ActionFunction } from 'remix';
import { useAudio } from '~/helpers/useAudio';
import { Slider } from '~/helpers/Slider';
import { Button } from '~/helpers/Button';
import { IconButton } from '~/helpers/IconButton';
import { useSliderState } from '@react-stately/slider';
import { Play, Pause, FastForward, Rewind } from 'react-feather';
import styles from './index.css';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: Slider.styles },
  { rel: 'stylesheet', href: Button.styles },
  { rel: 'stylesheet', href: IconButton.styles },
  { rel: 'stylesheet', href: styles },
];

export const action: ActionFunction = async ({ params, request }) => {
  const { id } = params;
  const { clip } = Object.fromEntries(await request.formData());

  const response = await fetch(`${new URL(request.url).origin}/resource/${id}/${clip}`);

  if (!response.ok) {
    return json({ error: await response.text() }, { status: response.status });
  }

  return redirect(`/${id}/${clip}`);
};

export default function Index() {
  const { id = '' } = useParams();
  const transition = useTransition();
  const actionData = useActionData();

  // get duration from parent loader
  const duration = useMatches().find(({ pathname }) => pathname == `/${id}`)?.data.duration ?? 0;

  const center = Math.floor(duration / 2);

  const clipSliderState = useSliderState({
    numberFormatter: React.useMemo(() => new Intl.NumberFormat(), []),
    maxValue: duration,
    defaultValue: [center - 15, center + 15],
  });

  const { isPlaying, setIsPlaying, currentTime, setCurrentTime, audioRef } = useAudio(`/resource/${id}`);

  // stop audio when navigating away
  if (transition.state === 'loading') {
    audioRef.current?.pause();
  }

  const currentTimeSliderState = useSliderState({
    numberFormatter: React.useMemo(() => new Intl.NumberFormat(), []),
    maxValue: duration,
    defaultValue: [0],
    value: [currentTime],
    onChange: React.useCallback(([value]) => setCurrentTime(value), [setCurrentTime]),
  });

  return (
    <>
      <div className='media-controls'>
        <IconButton
          onClick={() => setCurrentTime(Math.max(currentTime - 10, 0))}
          aria-label='Rewind 10 seconds'
          disabled={currentTime === 0}
        >
          <Rewind data-active strokeWidth={1.5} aria-hidden />
        </IconButton>

        <IconButton onClickCapture={() => setIsPlaying((p) => !p)} aria-label='Play/pause the song'>
          <Pause data-active={isPlaying} strokeWidth={1.5} aria-hidden />
          <Play data-active={!isPlaying} strokeWidth={1.5} aria-hidden />
        </IconButton>

        <IconButton
          onClick={() => setCurrentTime(Math.round(Math.min(currentTime + 10, duration)))}
          aria-label='Fast forward 10 seconds'
          disabled={currentTime === Math.round(duration)}
        >
          <FastForward data-active strokeWidth={1.5} aria-hidden />
        </IconButton>
      </div>

      <div className='slider-container'>
        <Slider maxValue={duration} defaultValue={[0]} step={1} state={currentTimeSliderState}>
          <Slider.Thumb className='progress-thumb' aria-label='Current time' supressOutput />
        </Slider>

        <Slider
          maxValue={duration}
          defaultValue={[center - 15, center + 15]}
          step={1}
          state={clipSliderState}
          style={{
            '--highlight-inset': [
              'auto',
              `${100 - clipSliderState.getThumbPercent(1) * 100}%`,
              'auto',
              `${clipSliderState.getThumbPercent(0) * 100}%`,
            ].join(' '),
          }}
        >
          <Slider.Thumb className='clip-thumb' aria-label='Start time for riff' />
          <Slider.Thumb className='clip-thumb' aria-label='End time for riff' />
        </Slider>
      </div>

      <Form method='post'>
        <Button
          name='clip'
          value={`${clipSliderState.getThumbValue(0)},${clipSliderState.getThumbValue(1)}`}
          loading={transition.state !== 'idle'}
        >
          Clip
        </Button>
        {transition.state !== 'idle' && <p className='visually-hidden'>Creating clip</p>}
      </Form>

      <output className='error'>
        {transition.state === 'idle' && actionData?.error ? `Error: ${actionData.error}` : ' '}
      </output>
    </>
  );
}

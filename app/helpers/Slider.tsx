import * as React from 'react';
import { useSlider, useSliderThumb } from '@react-aria/slider';
import type { SliderState } from '@react-stately/slider';
import styles from './Slider.css';
import { useSafeContext } from './useSafeContext';
import { formatToMinutesAndSeconds } from './time';

/**
 * Slider component build using react-aria. Needs state from `useSliderState`
 * and requires one or more `Slider.Thumb`s to be passed as children.
 */
export const Slider = ({
  state,
  className,
  children,
  style,
  ...props
}: {
  maxValue: number;
  defaultValue: number[];
  step: number;
  state: SliderState;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const { groupProps, trackProps, outputProps } = useSlider(
    {
      ...props,
      // react-aria produces thousands of warnings which are not useful because we already have aria-label on every thumb
      'aria-label': 'shut up',
    },
    state,
    trackRef
  );

  return (
    <SliderContext.Provider value={{ outputProps, trackRef, state }}>
      <div {...groupProps} className={`slider ${className ?? ''}`} style={style}>
        <div {...trackProps} className='track' ref={trackRef}>
          {React.Children.map(children, (child, index) => {
            return React.isValidElement(child) ? React.cloneElement(child, { index }) : child;
          })}
        </div>
      </div>
    </SliderContext.Provider>
  );
};

export const Thumb = (props: {
  index?: number;
  'aria-label': string;
  className?: string;
  /**
   * This will render the tooltip in a `<div>` instead of `<output>`.
   * Handy when the slider updates too frequently to be useful in screen reader announcements.
   */
  supressOutput?: boolean;
}) => {
  const { index, 'aria-label': ariaLabel, supressOutput, className, ...rest } = props;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { state, outputProps, trackRef } = useSafeContext(SliderContext);

  if (index === undefined) {
    throw new Error('Thumb must have an index');
  }

  const { thumbProps, inputProps } = useSliderThumb({ index, trackRef, inputRef }, state);

  const inputId = React.useMemo(() => outputProps.htmlFor?.split(' ')[index], [index, outputProps.htmlFor]);

  return (
    <div
      {...thumbProps}
      className={`thumb ${className ?? ''}`}
      style={{
        '--left': `${(state.getThumbPercent(index) * 100).toFixed(2)}%`,
        '--transition-duration': state.isThumbDragging(index) ? '0s' : '500ms',
      }}
      {...rest}
    >
      <div className='visually-hidden'>
        <input
          ref={inputRef}
          {...inputProps}
          type='range'
          aria-label={ariaLabel}
          aria-labelledby={undefined}
          aria-valuetext={formatToMinutesAndSeconds(state.getThumbValue(index))}
        />
      </div>
      {supressOutput ? (
        <div className='output'>{formatToMinutesAndSeconds(state.getThumbValue(index))}</div>
      ) : (
        <output className='output' htmlFor={inputId}>
          {formatToMinutesAndSeconds(state.getThumbValue(index))}
        </output>
      )}
    </div>
  );
};

const SliderContext = React.createContext<{
  outputProps: React.ComponentPropsWithRef<'output'>;
  trackRef: React.RefObject<HTMLDivElement>;
  state: SliderState;
} | null>(null);
SliderContext.displayName = 'SliderContext';

Slider.Thumb = Thumb;
Slider.styles = styles;

export default Slider;

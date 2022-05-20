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
  const { groupProps, trackProps, outputProps } = useSlider(props, state, trackRef);

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

export const Thumb = (props: { index?: number; 'aria-label': string; className?: string }) => {
  const { index, 'aria-label': ariaLabel, className, ...rest } = props;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { state, outputProps, trackRef } = useSafeContext(SliderContext);

  if (index === undefined) {
    throw new Error('Thumb must have an index');
  }

  const { thumbProps, inputProps } = useSliderThumb({ index, trackRef, inputRef }, state);

  const htmlFors = React.useMemo(() => outputProps.htmlFor?.split(' '), [outputProps.htmlFor]);

  return (
    <div
      {...thumbProps}
      className={`thumb ${className ?? ''}`}
      style={{
        '--left': `${(state.getThumbPercent(index) * 100).toFixed(2)}%`,
        '--transition-duration': state.isThumbDragging(index) ? '0s' : '500ms',
      }}
      id={htmlFors?.[index]}
      {...rest}
    >
      <div className='visually-hidden'>
        <input ref={inputRef} {...inputProps} aria-label={ariaLabel} aria-labelledby={undefined} />
      </div>
      <output htmlFor={htmlFors?.[index]}>{formatToMinutesAndSeconds(state.getThumbValue(index))}</output>
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

import * as React from 'react';
import styles from './IconButton.css';

/**
 * Icon button that supports switching between one or more icons.
 * Pass svg icons as children, with `data-active='true'` for the one to show.
 */
export const IconButton = ({ className, ...rest }: React.ComponentProps<'button'>) => {
  return <button className={`icon-button ${className ?? ''}`} type='button' {...rest} />;
};
IconButton.styles = styles;

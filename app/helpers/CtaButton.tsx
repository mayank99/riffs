import * as React from 'react';
import styles from './CtaButton.css';

/** A call-to-action button with a loading state. */
export const CtaButton = ({
  loading,
  children,
  className,
  onClick,
  ...props
}: React.ComponentProps<'button'> & { loading?: boolean }) => {
  return (
    <button className={`cta-button ${loading ? 'loading' : ''} ${className ?? ''}`} disabled={!!loading} {...props}>
      <span className='cta-button-content'>{children}</span>
    </button>
  );
};

CtaButton.styles = styles;

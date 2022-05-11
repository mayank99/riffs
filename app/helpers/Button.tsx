import * as React from 'react';
import styles from './Button.css';

/**
 * A button that supports primary (cta), secondary (outline), and loading styles.
 * Can be rendered as a button or as a link if `href` is passed
 */
export const Button: Overloaded = ({ loading, variant = 'cta', children, className, ...rest }) => {
  const props: (ButtonProps | AnchorProps) & { [k: string]: unknown } = {
    className: `button ${variant === 'outline' ? 'outline' : ''} ${className ?? ''}`,
    'data-state': loading ? 'loading' : undefined,
    ...rest,
    children: (
      <span className='button-content'>
        {children}
        {loading && <span className='button-loader' />}
      </span>
    ),
  };

  if (hasHref(props)) {
    return <a {...props} />; // eslint-disable-line jsx-a11y/anchor-has-content -- content comes from children
  } else {
    return <button disabled={!!loading} {...props} />;
  }
};

Button.styles = styles;

// ----------------------------------------------------------------------------------------
// all TS stuff lives below
// lesson to future self: just create multiple components, polymorphism is never worth it
// ----------------------------------------------------------------------------------------

const hasHref = (props: ButtonProps | AnchorProps): props is AnchorProps => 'href' in props;
type ExtraProps = { variant?: 'cta' | 'outline'; loading?: boolean };
type ButtonProps = React.ComponentProps<'button'> & { href?: undefined } & ExtraProps;
type AnchorProps = React.ComponentProps<'a'> & { href?: string } & ExtraProps;
type Overloaded = {
  (props: ButtonProps): JSX.Element;
  (props: AnchorProps): JSX.Element;
  styles: string;
};

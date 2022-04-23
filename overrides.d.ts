import 'react'; // eslint-disable-line react/no-typos

// add inline CSS variable support
declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number;
  }
}

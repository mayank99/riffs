import * as React from 'react';

/**
 * Dan Abramov's declarative hook around `setInterval`
 * @see https://overreacted.io/making-setinterval-declarative-with-react-hooks/
 */
export const useInterval = (callback: Function, delay: number | null) => {
  const savedCallback = React.useRef<Function>();

  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  React.useEffect(() => {
    const tick = () => void savedCallback.current?.();
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

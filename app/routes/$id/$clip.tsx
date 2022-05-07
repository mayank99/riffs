import * as React from 'react';
import type { LinksFunction } from 'remix';
import { useHref, useParams } from 'remix';
import styles from './$clip.css';

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: styles }];

export default function $clip() {
  const { id, clip } = useParams();

  if (!id || !clip) {
    throw new Error('Invalid route');
  }

  const audioUrl = useHref(`/resource/${id}/${clip}`);

  return (
    <>
      <audio
        src={audioUrl}
        controls
        ref={(el) => {
          if (el) {
            el.volume = 0.6; // nobody wants music to start blasting into their ears
          }
        }}
      />
    </>
  );
}

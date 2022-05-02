import * as React from 'react';
import type { LinksFunction } from 'remix';
import { useHref, useParams } from 'remix';
import styles from './$id.$clip.css';

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: styles }];

export default function $clip() {
  const { id, clip } = useParams();

  if (!id || !clip) {
    throw new Error('Invalid route');
  }

  const audioUrl = useHref(`/resource/${id}/${clip}`);

  return (
    <>
      <audio src={audioUrl} controls />
    </>
  );
}

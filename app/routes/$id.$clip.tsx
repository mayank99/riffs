import * as React from 'react';
import { useHref } from 'remix';
import { useParams } from 'remix';

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

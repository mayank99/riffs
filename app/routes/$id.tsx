import * as React from 'react';
import type { LinksFunction, LoaderFunction } from 'remix';
import { useLoaderData, Outlet } from 'remix';
import { dl } from '~/helpers/dl.server';
import styles from './$id.css';

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: styles }];

export const loader: LoaderFunction = async ({ params }) => {
  const { id = '' } = params;
  const { title, channel, duration } = await dl(id, { dumpJson: true });

  return {
    songName: title,
    artist: channel,
    duration,
  };
};

export default function $id() {
  const { songName, artist } = useLoaderData();

  return (
    <>
      <h2>
        {songName}
        {'\n'}
        {artist}
      </h2>
      <Outlet />
    </>
  );
}

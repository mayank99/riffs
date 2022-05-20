import * as React from 'react';
import type { LinksFunction, LoaderFunction } from 'remix';
import { useLoaderData, Outlet } from 'remix';
import { dl } from '~/helpers/dl.server';
import styles from './$id.css';

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: styles }];

export const loader: LoaderFunction = async ({ params }) => {
  const { id = '' } = params;
  const { videoDetails } = await dl.getInfo(id, { requestOptions: {} });

  return {
    songName: videoDetails.media.song ?? videoDetails.title,
    artist: videoDetails.media.artist ?? videoDetails.ownerChannelName.replace(' - Topic', ''),
    duration: videoDetails.lengthSeconds,
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

import * as React from 'react';
import type { LinksFunction } from 'remix';
import { useHref, useParams } from 'remix';
import { Button } from '~/helpers/Button';
import { formatToMinutesAndSeconds } from '~/helpers/time';
import { Share2, Youtube } from 'react-feather';
import styles from './$clip.css';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: Button.styles },
  { rel: 'stylesheet', href: styles },
];

export default function $clip() {
  const { id, clip } = useParams();

  if (!id || !clip) {
    throw new Error('Invalid route');
  }

  const audioUrl = useHref(`/resource/${id}/${clip}`);
  const currentUrlPath = useHref('');
  const [start, end] = clip.split(',').map(Number).map(formatToMinutesAndSeconds);

  const fileRef = React.useRef<File>();
  React.useEffect(() => {
    (async () => {
      const blob = await fetch(audioUrl).then((res) => res.blob());
      fileRef.current = new File([blob], `${id}-${clip}.mp3`, { type: 'audio/mpeg' });
    })();
  }, [audioUrl, clip, id]);

  const handleShare = () => {
    if (fileRef.current && navigator.canShare?.({ files: [fileRef.current] })) {
      navigator.share({
        files: [fileRef.current],
        text: 'Listen to this clip',
        url: `${window.origin}${currentUrlPath}`,
      });
    }
  };

  return (
    <>
      <p>
        {start} - {end}
      </p>
      <audio
        src={audioUrl}
        controls
        ref={(el) => {
          if (el) {
            el.volume = 0.6; // nobody wants music to start blasting into their ears
          }
        }}
      />
      <div className='button-bar'>
        <Button onClick={() => handleShare()}>
          <span>Share</span>
          <Share2 strokeWidth={1.5} />
        </Button>
        <Button variant='outline' href={`https://youtu.be/${id}`} target='_blank'>
          <span>YouTube</span>
          <Youtube strokeWidth={1.5} />
        </Button>
      </div>
    </>
  );
}

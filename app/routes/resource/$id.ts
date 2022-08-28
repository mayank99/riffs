import type { LoaderFunction } from 'remix';
import { dl } from '~/helpers/dl.server';

export const loader: LoaderFunction = async ({ params }) => {
  const { id: idOrUrl = '' } = params;
  const stream = dl(idOrUrl, {
    filter: (format) => format.hasAudio && !format.hasVideo && format.container === 'mp4',
    quality: 'lowestaudio',
  });

  let buffer = Buffer.from([]);
  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk]);
  }

  return new Response(buffer, {
    headers: {
      'Content-Length': `${buffer.length}`,
      'Cache-Control': 's-maxage=31536000, max-age=31536000',
      'Content-Type': 'audio/mp4',
    },
  });
};

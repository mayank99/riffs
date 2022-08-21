import type { LoaderFunction } from 'remix';
import { dl } from '~/helpers/dl.server';
import fs from 'fs';
import os from 'os';
import path from 'path';

export const loader: LoaderFunction = async ({ params }) => {
  const { id: idOrUrl = '' } = params;

  await dl(
    idOrUrl,
    {
      referer: 'youtube.com',
      userAgent: 'googlebot',
      // downloads the worst m4a or fallback to worst mp4 or fallback to any worst audio
      format: 'wa[ext=m4a] / wa[ext=mp4] / wa[vcodec=none]',
      output: `${idOrUrl}.m4a`,
    },
    { cwd: os.tmpdir() }
  );

  const filePath = path.join(os.tmpdir(), `${idOrUrl}.m4a`);
  const buffer = await fs.promises.readFile(filePath);
  fs.promises.rm(filePath);

  return new Response(buffer, {
    headers: {
      'Content-Type': `audio/mpeg`,
      'Content-Length': `${buffer.length}`,
      'Cache-Control': 's-maxage=31536000, max-age=31536000',
    },
  });
};

import type { LoaderFunction } from 'remix';
import { dl } from '~/helpers/dl.server';
import fs from 'fs';
import os from 'os';
import path from 'path';

const spawn = require('child_process').spawn;
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

export const loader: LoaderFunction = async ({ params }) => {
  const { id: idOrUrl = '', clip = '' } = params;

  const [start, end] = clip.split(',').map((x) => parseInt(x, 10));
  if (end - start > 100) {
    return new Response('clip too long', { status: 418 });
  }

  const inputPath = path.join(os.tmpdir(), 'input.m4a');
  // if (fs.existsSync(inputPath)) {
  //   fs.promises.unlink(inputPath);
  // }

  const outputPath = path.join(os.tmpdir(), 'output.m4a');
  if (fs.existsSync(outputPath)) {
    fs.promises.unlink(outputPath);
  }

  const { title: songName } = await dl(
    `https://www.youtube.com/watch?v=${idOrUrl}`,
    {
      referer: 'youtube.com',
      userAgent: 'googlebot',
      // downloads the best m4a or fallback to best mp4 or fallback to any best audio
      format: 'ba[ext=m4a] / ba[ext=mp4] / ba[vcodec=none]',
      output: `input.m4a`,
    },
    { cwd: os.tmpdir() }
  );

  const runFfmpeg = new Promise((resolve) => {
    spawn(ffmpegPath, ['-i', inputPath, '-ss', `${start}`, '-t', `${end - start}`, '-acodec', 'copy', outputPath], {
      stdio: ['inherit'],
    }).on('close', () => {
      // fs.promises.rm(inputPath);
      resolve(null);
    });
  });
  await runFfmpeg;

  const output = await fs.promises.readFile(outputPath);

  fs.promises.rm(outputPath);

  return new Response(output.buffer, {
    status: 200,
    headers: {
      'Content-Type': `audio/mpeg`,
      'Content-Disposition': `filename="${encodeURIComponent(songName)}.m4a"`,
      'Cache-Control': 's-maxage=31536000, max-age=31536000',
      // 'Content-Length': `${output.length}`,
    },
  });
};

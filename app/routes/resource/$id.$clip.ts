import type { LoaderFunction } from 'remix';
import { dl } from '~/helpers/dl.server';
import fs from 'fs';
import os from 'os';
import path from 'path';

const spawn = require('child_process').spawn;
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

export const loader: LoaderFunction = async ({ params }) => {
  const { id: idOrUrl = '', clip = '' } = params;
  const originalStream = dl(idOrUrl, {
    filter: (format) => format.hasAudio && !format.hasVideo && format.container === 'mp4',
    quality: 'highestaudio',
  });

  const [start, end] = clip.split(',').map((x) => parseInt(x, 10));
  if (end - start > 100) {
    return new Response('clip too long', { status: 418 });
  }

  const inputPath = path.join(os.tmpdir(), 'input.mp4');
  if (fs.existsSync(inputPath)) {
    fs.promises.unlink(inputPath);
  }

  const outputPath = path.join(os.tmpdir(), 'output.mp4');
  if (fs.existsSync(outputPath)) {
    fs.promises.unlink(outputPath);
  }

  await fs.promises.writeFile(inputPath, originalStream);

  const runFfmpeg = new Promise((resolve) => {
    spawn(ffmpegPath, ['-i', inputPath, '-ss', `${start}`, '-t', `${end - start}`, '-acodec', 'copy', outputPath], {
      stdio: ['inherit'],
    }).on('close', () => {
      fs.promises.rm(inputPath);
      resolve(null);
    });
  });

  const getTruncatedSongName = dl.getInfo(idOrUrl).then((info) => info?.videoDetails.media.song?.substring(0, 20));

  // run ffmpeg and fetch metadata at the same time
  const [songName] = await Promise.all([getTruncatedSongName, runFfmpeg]);

  const output = await fs.promises.readFile(outputPath);

  fs.promises.rm(outputPath);

  return new Response(output.buffer, {
    status: 200,
    headers: {
      'Content-Type': `audio/mp4`,
      'Content-Disposition': `filename="${songName}.${start}-${end}.mp4"`,
      'Cache-Control': 's-maxage=31536000, max-age=31536000',
      // 'Content-Length': `${output.length}`,
    },
  });
};

import { LoaderFunction } from 'remix';
import dl from 'ytdl-core';
import fs from 'fs';
import os from 'os';
import path from 'path';

const spawn = require('child_process').spawn;
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

export const loader: LoaderFunction = async ({ params }) => {
  const { id: idOrUrl = '', clip = '' } = params;
  const originalStream = dl(idOrUrl, { filter: 'audioonly', quality: 'highestaudio' });

  const [start, end] = clip.split(',').map((x) => parseInt(x, 10));
  if (end - start > 100) {
    throw new Error('clip too long');
  }

  const inputPath = path.join(os.tmpdir(), 'input.webm');
  const outputPath = path.join(os.tmpdir(), 'output.webm');
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
      'Content-Type': `audio/mpeg`,
      'Content-Disposition': `filename="${songName}.${start}-${end}.mp3"`,
      // 'Cache-Control': 's-maxage=31536000, max-age=31536000',
      // 'Content-Length': `${outputData.length}`,
    },
  });
};

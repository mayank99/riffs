import { LoaderFunction } from 'remix';
import dl from 'ytdl-core';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';

export const loader: LoaderFunction = async ({ params }) => {
  const { id: idOrUrl = '', clip = '' } = params;
  const originalStream = dl(idOrUrl, { filter: 'audioonly', quality: 'highestaudio' });
  // const info = await dl.getInfo(id);
  // const { container = 'webm' } = dl.chooseFormat(info.formats, { filter: 'audioonly', quality: 'highestaudio' });

  const [start, end] = clip.split(',').map((x) => parseInt(x, 10));
  if (end - start > 100) {
    throw new Error('clip too long');
  }

  const inputPath = path.join(os.tmpdir(), 'input.webm');
  const outputPath = path.join(os.tmpdir(), 'output.webm');
  await fs.promises.writeFile(inputPath, originalStream);

  await new Promise((resolve) => {
    spawn(ffmpegPath, ['-i', inputPath, '-ss', `${start}`, '-t', `${end - start}`, '-acodec', 'copy', outputPath], {
      stdio: ['inherit'],
    }).on('close', (_) => {
      fs.promises.rm(inputPath);
      resolve(null);
    });
  });

  const output = await fs.promises.readFile(outputPath);
  fs.promises.rm(outputPath);

  return new Response(output.buffer, {
    status: 200,
    headers: {
      'Content-Type': `audio/webm`,
      // 'Cache-Control': 's-maxage=31536000, max-age=31536000',
      // 'Content-Length': `${outputData.length}`,
      // 'Content-Disposition': `filename="${outputFileName}"`,
    },
  });
};

// import { createFFmpeg } from '@ffmpeg/ffmpeg';

// export const loader: LoaderFunction = async ({ params }) => {
//   const { id = '', clip = '' } = params;
//   const [start, end] = clip.split(',').map((x) => parseInt(x, 10));

//   if (end - start > 100) {
//     throw new Error('clip too long');
//   }

//   const info = await dl.getInfo(id);
//   const { container = 'webm' } = dl.chooseFormat(info.formats, { filter: 'audioonly', quality: 'highestaudio' });
//   const stream = dl(id, { filter: 'audioonly', quality: 'highestaudio' });

//   const inputFileName = `${id}.${container}`;
//   const outputFileName = `${
//     info.videoDetails?.media?.song ?? info.videoDetails?.title.substr(0, 30) ?? id
//   } - ${start}-${end}.${container}`;

//   let buffer = Buffer.from([]);
//   for await (const chunk of stream) {
//     buffer = Buffer.concat([buffer, chunk]);
//   }

//   const ffmpeg = await getffmpegInstance();
//   ffmpeg.FS('writeFile', inputFileName, buffer);
//   await ffmpeg.run('-i', inputFileName, '-ss', `${start}`, '-t', `${end - start}`, '-acodec', 'copy', outputFileName);

//   const outputData = ffmpeg.FS('readFile', outputFileName);
//   ffmpeg.FS('unlink', inputFileName);
//   ffmpeg.FS('unlink', outputFileName);

//   return new Response(outputData, {
//     status: 200,
//     headers: {
//       'Content-Type': `audio/${container}`,
//       'Content-Length': `${outputData.length}`,
//       'Cache-Control': 's-maxage=31536000, max-age=31536000',
//       'Content-Disposition': `filename="${outputFileName}"`,
//     },
//   });
// };

// const ffmpegInstance = createFFmpeg({
//   corePath: require.resolve('@ffmpeg/core'),
// });
// async function getffmpegInstance() {
//   if (!ffmpegInstance.isLoaded()) {
//     await ffmpegInstance.load();
//   }
//   return ffmpegInstance;
// }

import { LoaderFunction } from 'remix';
import dl from 'ytdl-core';
import { createFFmpeg } from '@ffmpeg/ffmpeg';

export const loader: LoaderFunction = async ({ params }) => {
  const { id = '', clip = '' } = params;
  const [start, end] = clip.split(',').map((x) => parseInt(x, 10));

  if (end - start > 100) {
    throw new Error('clip too long');
  }

  const info = await dl.getInfo(id);
  const { container = 'webm' } = dl.chooseFormat(info.formats, { filter: 'audioonly', quality: 'highestaudio' });
  const stream = dl(id, { filter: 'audioonly', quality: 'highestaudio' });

  const inputFileName = `${id}.${container}`;
  const outputFileName = `${
    info.videoDetails?.media?.song ?? info.videoDetails?.title.substr(0, 30) ?? id
  } - ${start}-${end}.${container}`;

  let buffer = Buffer.from([]);
  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk]);
  }

  const ffmpeg = await getffmpegInstance();
  ffmpeg.FS('writeFile', inputFileName, buffer);
  await ffmpeg.run('-i', inputFileName, '-ss', `${start}`, '-t', `${end - start}`, '-acodec', 'copy', outputFileName);

  const outputData = ffmpeg.FS('readFile', outputFileName);
  ffmpeg.FS('unlink', inputFileName);
  ffmpeg.FS('unlink', outputFileName);

  return new Response(outputData, {
    status: 200,
    headers: {
      'Content-Type': `audio/${container}`,
      'Content-Length': `${outputData.length}`,
      'Cache-Control': 's-maxage=31536000, max-age=31536000',
      'Content-Disposition': `filename="${outputFileName}"`,
    },
  });
};

const ffmpegInstance = createFFmpeg({
  corePath: require.resolve('@ffmpeg/core'),
});
async function getffmpegInstance() {
  if (!ffmpegInstance.isLoaded()) {
    await ffmpegInstance.load();
  }
  return ffmpegInstance;
}

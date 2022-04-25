import type { LoaderFunction } from 'remix';
import os from 'os';
import fs from 'fs';
import path from 'path';
import dl from 'ytdl-core';
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const awf = require('@craft-cloud/audiowaveform-static-aws');
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;

export const loader: LoaderFunction = async () => {
  const originalStream = dl('QNvsMEZqt5Y', { filter: 'audioonly', quality: 'highestaudio' });

  const inputPath1 = path.join(os.tmpdir(), 'input.opus');
  const inputPath2 = path.join(os.tmpdir(), 'input.mp3');
  const outputPath1 = path.join(os.tmpdir(), 'test.dat');
  const outputPath2 = path.join(os.tmpdir(), 'test.png');
  await fs.promises.writeFile(inputPath1, originalStream);

  // {
  //   const { stdout, stderr } = await exec(`${ffmpeg} -i ${inputPath1} -ab 128k -f mp3 ${inputPath2}`);
  //   console.log('stdout:', stdout);
  //   console.error('stderr:', stderr);
  // }

  {
    const { stdout, stderr } = await exec(
      `${awf()} -i ${inputPath1} --input-format opus -o ${outputPath2} -z 300 -s 60.0 -e 90.0 -w 1000 -h 200`
    );
    console.log('stdout:', stdout);
    console.error('stderr:', stderr);
  }

  // {
  //   const { stdout, stderr } = await exec(`${awf()} -i ${outputPath1} -o ${outputPath2}`);
  //   console.log('stdout:', stdout);
  //   console.error('stderr:', stderr);
  // }

  const png = await fs.promises.readFile(outputPath2);
  return new Response(png.buffer, { status: 200, headers: { 'Content-Type': 'image/png' } });
};

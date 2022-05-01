import type { LoaderFunction } from 'remix';
import os from 'os';
import fs from 'fs';
import path from 'path';
import dl from 'ytdl-core';
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const awf = require('@craft-cloud/audiowaveform-static-aws');
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;
// const spawn = require('child_process').spawn;

export const loader: LoaderFunction = async () => {
  const originalStream = dl('QNvsMEZqt5Y', { filter: 'audioonly', quality: 'highestaudio' });

  const inputPath1 = path.join(os.tmpdir(), 'input');
  const inputPath2 = path.join(os.tmpdir(), 'input.mp3');
  const outputPath = path.join(os.tmpdir(), 'test.png');

  [inputPath1, inputPath2, outputPath].forEach((p) => {
    if (fs.existsSync(p)) {
      fs.unlinkSync(p);
    }
  });

  await fs.promises.writeFile(inputPath1, originalStream);

  {
    const { stdout, stderr } = await exec(`${ffmpeg} -i ${inputPath1} -f mp3 ${inputPath2}`);
    console.log('stdout:', stdout);
    console.error('stderr:', stderr);
  }

  // await new Promise((resolve) => {
  //   spawn(ffmpeg, ['-i', inputPath1, '-f', 'mp3', inputPath2], {
  //     stdio: ['inherit'],
  //   }).on('close', () => {
  //     resolve(null);
  //   });
  // });

  console.log('ffmpeg done!');

  {
    const { stdout, stderr } = await exec(`${awf()} -i ${inputPath2} -o ${outputPath} -b 8 --pixels-per-second 4`);
    console.log('stdout:', stdout);
    console.error('stderr:', stderr);
  }

  console.log('audiowaveform done!');

  const png = await fs.promises.readFile(outputPath);
  return new Response(png.buffer, { status: 200, headers: { 'Content-Type': 'image/png' } });
};

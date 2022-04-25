import type { LoaderFunction } from 'remix';
import os from 'os';
import fs from 'fs';
import path from 'path';
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const awf = require('@craft-cloud/audiowaveform-static-aws');

export const loader: LoaderFunction = async ({ request }) => {
  let str = '';

  const originalStream = await fetch(`${new URL(request.url).origin}/resource/QNvsMEZqt5Y`).then((res) =>
    res.arrayBuffer()
  );

  const inputPath = path.join(os.tmpdir(), 'input.webm');
  const outputPath1 = path.join(os.tmpdir(), 'test.dat');
  const outputPath2 = path.join(os.tmpdir(), 'test.png');
  await fs.promises.writeFile(inputPath, Buffer.from(originalStream));

  {
    const { stdout, stderr } = await exec(`${awf()} -i ${inputPath} -o ${outputPath1} --input-format ogg`);
    console.log('stdout:', stdout);
    console.error('stderr:', stderr);
  }

  {
    const { stdout, stderr } = await exec(`${awf()} -i ${outputPath1} -o ${outputPath2}`);
    console.log('stdout:', stdout);
    console.error('stderr:', stderr);
  }

  const png = await fs.promises.readFile(outputPath2);
  return new Response(png.buffer, { status: 200, headers: { 'Content-Type': 'image/png' } });
};

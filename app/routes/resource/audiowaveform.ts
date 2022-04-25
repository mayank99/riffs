import type { LoaderFunction } from 'remix';
import os from 'os';
import fs from 'fs';
import path from 'path';
const awf = require('@craft-cloud/audiowaveform-static-aws');
const { exec } = require('child_process');

export const loader: LoaderFunction = async ({ request }) => {
  let str = '';

  const originalStream = await fetch(`${new URL(request.url).origin}/resource/QNvsMEZqt5Y`).then((res) =>
    res.arrayBuffer()
  );

  const inputPath = path.join(os.tmpdir(), 'input.mp3');
  const outputPath1 = path.join(os.tmpdir(), 'test.dat');
  const outputPath2 = path.join(os.tmpdir(), 'test.png');

  if (originalStream) {
    await fs.promises.writeFile(inputPath, Buffer.from(originalStream));
  }

  await new Promise((resolve) => {
    exec(`${awf()} --i ${inputPath} -o ${outputPath1} -b 8`, (error, stdout, stderr) => {
      if (error) {
        str = `error: ${error.message}`;
        resolve(null);
      }

      if (stderr) {
        str = `stderr: ${stderr}`;
        resolve(null);
      }

      str = `stdout:\n${stdout}`;
      resolve(null);
    });
  });

  await new Promise((resolve) => {
    exec(`${awf()} --i ${outputPath1} -o ${outputPath2} -z 512`, (error, stdout, stderr) => {
      if (error) {
        str = `error: ${error.message}`;
        resolve(null);
      }

      if (stderr) {
        str = `stderr: ${stderr}`;
        resolve(null);
      }

      str = `stdout:\n${stdout}`;
      resolve(null);
    });
  });

  await new Promise((res) => setTimeout(() => res(true), 5000));

  const png = await fs.promises.readFile(outputPath2);
  return png;
};

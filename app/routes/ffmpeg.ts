import { LoaderFunction } from 'remix';
import { spawn } from 'child_process';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';

export const loader: LoaderFunction = async ({ params }) => {
  console.log(ffmpegPath);

  const proc = spawn(ffmpegPath, ['-version']);
  const stdout: string = await new Promise((res) => {
    let str = '';
    proc.stdout.setEncoding('utf8');
    proc.stdout.on('data', (data) => {
      str += data;
    });
    proc.stderr.setEncoding('utf8');
    proc.stderr.on('data', console.log);
    proc.on('close', () => res(str));
  });

  return new Response(stdout, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
};

// Runs the Express API (:4000) and the Vite dev server (:5173) together.
import { spawn } from 'child_process';

const procs = [
  ['API ', 'npm', ['--prefix', 'server', 'run', 'dev']],
  ['WEB ', 'npm', ['--prefix', 'client', 'run', 'dev']],
];

const children = procs.map(([tag, cmd, args]) => {
  const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], shell: false });
  const pipe = (stream) =>
    stream.on('data', (b) =>
      String(b)
        .split('\n')
        .filter(Boolean)
        .forEach((line) => console.log(`[${tag}] ${line}`))
    );
  pipe(child.stdout);
  pipe(child.stderr);
  return child;
});

const bye = () => {
  children.forEach((c) => c.kill('SIGTERM'));
  process.exit(0);
};
process.on('SIGINT', bye);
process.on('SIGTERM', bye);

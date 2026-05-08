import { spawn } from 'node:child_process';
import http from 'node:http';

const devServerUrl = 'http://127.0.0.1:4173';

function run(command, args, extraEnv = {}) {
  return spawn(command, args, {
    stdio: 'inherit',
    env: { ...process.env, ...extraEnv }
  });
}

function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const ping = () => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });

      req.on('error', () => {
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`开发服务器启动超时：${url}`));
          return;
        }
        setTimeout(ping, 500);
      });
    };

    ping();
  });
}

const devServer = run('corepack', ['pnpm', 'dev']);

let electronProcess;

const shutdown = () => {
  if (electronProcess && !electronProcess.killed) electronProcess.kill('SIGTERM');
  if (devServer && !devServer.killed) devServer.kill('SIGTERM');
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

try {
  await waitForServer(devServerUrl);
  electronProcess = run('npx', ['electron', '.'], { VITE_DEV_SERVER_URL: devServerUrl });
  electronProcess.on('exit', (code) => {
    shutdown();
    process.exit(code ?? 0);
  });
} catch (error) {
  shutdown();
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

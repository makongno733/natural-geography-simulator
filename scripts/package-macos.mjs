import { cp, mkdir, rm, chmod } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const releaseDir = path.join(root, 'release');
const distDir = path.join(root, 'dist');
const draftHtmlPath = path.join(root, 'atmosphere-draft.html');
const appDir = path.join(releaseDir, '大气结构教学系统.app');
const resourcesSiteDir = path.join(appDir, 'Contents', 'Resources', 'site');
const pkgRootDir = path.join(releaseDir, 'pkgroot');
const appTargetDir = path.join(pkgRootDir, 'Applications', '大气结构教学系统.app');
const pkgPath = path.join(releaseDir, '大气结构教学系统.pkg');
const launchPath = path.join(appDir, 'Contents', 'MacOS', 'launch');

async function run(cmd, args) {
  await new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit' });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited with code ${code}`));
    });
    child.on('error', reject);
  });
}

await rm(resourcesSiteDir, { recursive: true, force: true });
await mkdir(path.dirname(resourcesSiteDir), { recursive: true });
await cp(distDir, resourcesSiteDir, { recursive: true });
await cp(draftHtmlPath, path.join(resourcesSiteDir, 'atmosphere-draft.html'));
await chmod(launchPath, 0o755);

await rm(pkgRootDir, { recursive: true, force: true });
await mkdir(path.dirname(appTargetDir), { recursive: true });
await cp(appDir, appTargetDir, { recursive: true });

await rm(pkgPath, { force: true });
await run('pkgbuild', [
  '--root',
  pkgRootDir,
  '--identifier',
  'com.kongnoma.atmosphere.app',
  '--version',
  '1.0.0',
  '--install-location',
  '/',
  pkgPath
]);

import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const distDir = path.resolve('dist');
const assetsDir = path.join(distDir, 'assets');
const indexPath = path.join(distDir, 'index.html');

const html = await readFile(indexPath, 'utf8');
const assetNames = await readdir(assetsDir);

const cssName = assetNames.find((name) => name.endsWith('.css'));
const jsName = assetNames.find((name) => name.endsWith('.js'));

if (!cssName || !jsName) {
  throw new Error('未找到内联所需的 CSS 或 JS 资源。');
}

const css = await readFile(path.join(assetsDir, cssName), 'utf8');
const js = await readFile(path.join(assetsDir, jsName), 'utf8');
const safeCss = css.replace(/<\/style/gi, '<\\/style');
const safeJs = js.replace(/<\/script/gi, '<\\/script');

const inlined = html
  .replace(/<script type="module" crossorigin src="\.\/assets\/[^"]+"><\/script>/, () => `<script type="module">\n${safeJs}\n</script>`)
  .replace(/<link rel="stylesheet" crossorigin href="\.\/assets\/[^"]+">/, () => `<style>${safeCss}</style>`);

await writeFile(indexPath, inlined, 'utf8');

// Render a set of preview stills with a single bundle: node scripts/stills.mjs 30 60 90 ...
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const frames = process.argv.slice(2).map(Number);
const outDir = process.env.STILLS_DIR ?? path.resolve('out/stills');
const browserExecutable = process.env.REMOTION_BROWSER ?? null;
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: 'JazaraBrandFilm', browserExecutable});
for (const frame of frames) {
  const output = path.join(outDir, `f${String(frame).padStart(3, '0')}.png`);
  await renderStill({serveUrl, composition, frame, output, browserExecutable, scale: Number(process.env.SCALE ?? 0.5)});
  console.log('rendered', output);
}

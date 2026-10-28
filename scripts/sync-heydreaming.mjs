import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
const flag = args.indexOf('--site');
const site = resolve(flag >= 0 ? args[flag + 1] : resolve(root, '../../reelmint'));
const check = args.includes('--check');
const json = readFileSync(resolve(root, 'prompts.json'));
const data = JSON.parse(json);
const pairs = [[resolve(root, 'prompts.json'), resolve(site, 'lib/seo/image-prompts.data.json')]];
for (const entry of data.prompts) {
  for (const field of ['preview', 'thumbnail']) {
    const path = entry[field];
    assert.match(path, /^assets\/(previews|thumbs)\/[a-z0-9_-]+\.webp$/);
    pairs.push([resolve(root, path), resolve(site, 'public/image-prompts', path.slice('assets/'.length))]);
  }
}
for (const [from, to] of pairs) {
  if (check) assert.ok(readFileSync(from).equals(readFileSync(to)), `Catalog drift: ${to}`);
  else { mkdirSync(dirname(to), { recursive: true }); copyFileSync(from, to); }
}
console.log(`${check ? 'Verified' : 'Synced'} catalog and ${pairs.length - 1} images: ${site}`);

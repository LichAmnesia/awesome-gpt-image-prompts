import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const data = JSON.parse(readFileSync(resolve(root, 'prompts.json'), 'utf8'));
assert.equal(data.prompts.length, 100);
assert.equal(data.total, 100);
assert.equal(new Set(data.prompts.map(entry => entry.id)).size, 100);
assert.equal(new Set(data.prompts.map(entry => entry.slug)).size, 100);
const categories = new Set(data.categories.map(category => category.id));
for (const entry of data.prompts) {
  assert.match(entry.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert(categories.has(entry.category));
  assert(entry.prompt.length > 100 && entry.prompt.length <= 2000);
  assert.equal(readFileSync(resolve(root, entry.promptFile), 'utf8').trim(), entry.prompt);
  for (const path of [entry.preview, entry.thumbnail]) {
    assert.match(path, /^assets\/(?:previews|thumbs)\/\d{3}_[a-z0-9-]+\.webp$/);
    assert(existsSync(resolve(root, path)), `Missing ${path}`);
    const bytes = readFileSync(resolve(root, path));
    assert.equal(bytes.subarray(0, 4).toString(), 'RIFF');
    assert.equal(bytes.subarray(8, 12).toString(), 'WEBP');
  }
  const landing = new URL(entry.landingUrl);
  assert.equal(landing.origin, 'https://heydreaming.com');
  assert.equal(landing.pathname, '/gpt-image-prompts');
  assert.equal(landing.searchParams.get('id'), String(entry.id));
  assert.equal(entry.detailUrl, `https://heydreaming.com/gpt-image-prompts/${entry.slug}`);
  const generate = new URL(entry.generateUrl);
  assert.equal(generate.pathname, '/dashboard/image');
  assert.equal(generate.searchParams.get('prompt'), entry.slug);
  assert.equal(generate.searchParams.get('provider'), 'openai');
  assert(!('provider' in entry) && !('source' in entry) && !('uid' in entry) && !('job_id' in entry));
}
console.log('PASS: all 100 image / TXT / prompt / landing / detail / generation pairs.');

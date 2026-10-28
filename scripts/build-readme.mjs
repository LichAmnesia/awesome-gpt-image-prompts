import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const catalog = JSON.parse(readFileSync(resolve(root, 'prompts.json'), 'utf8'));
const check = process.argv.includes('--check');
const zhCategories = {
  illustration: '绘画插画', photography: '摄影质感', anime: '动漫',
  'cinematic-fantasy': '电影与幻想', 'ink-paper': '水墨与纸艺',
  '3d-miniatures': '3D 与微缩', 'graphic-design': '平面设计',
};

function tracked(entry) {
  const url = new URL(entry.landingUrl);
  url.searchParams.set('utm_source', 'github');
  url.searchParams.set('utm_medium', 'prompt-library');
  url.searchParams.set('utm_campaign', 'awesome-gpt-image-prompts');
  url.searchParams.set('utm_content', String(entry.id));
  return url.href;
}

function render(zh) {
  const gallery = 'https://heydreaming.com/gpt-image-prompts';
  const lines = [
    '# Awesome GPT Image Prompts', '',
    zh ? '**100 个图像 prompt，100 种创作起点。**摄影、插画、动漫、幻想、水墨、3D 与平面设计。' : '**100 image prompts. A hundred places to begin.** Photography, illustration, anime, fantasy, ink, 3D, and graphic design.', '',
    `[English](README.md) · [简体中文](README.zh-CN.md) · [${zh ? '浏览全部图片' : 'Explore the gallery'}](${gallery})`, '',
    zh ? '每个案例包含图片预览、完整 prompt、独立网页和 HeyDreaming 生成入口。点击图片或 **Try this prompt**，直接打开对应案例。' : 'Each example includes a preview, the complete prompt, its own page, and a HeyDreaming generation entry. Click an image or **Try this prompt** to open that exact example.', '',
    '<table><tr>',
    ...[catalog.prompts[1], catalog.prompts[7], catalog.prompts[2]].map(entry => `<td width="33%"><a href="${tracked(entry)}"><img src="${entry.thumbnail}" alt="${entry.title}" width="300" /></a><br /><a href="${tracked(entry)}">${entry.title} ↗</a></td>`),
    '</tr></table>', '',
    `**[${zh ? '在 HeyDreaming 浏览完整图库' : 'Browse all 100 on HeyDreaming'} →](${gallery})**`, '',
    zh ? '## 如何使用' : '## How to use', '',
    zh ? '1. 选一张喜欢的图，打开它的案例页。\n2. 复制完整 prompt，修改主体、场景、配色或镜头。\n3. 点击 **Try this prompt**：登录后会保留所选 prompt，预填到图片生成器中。\n4. 检查 prompt 和画幅，再主动点击生成。' : '1. Pick an image and open its example page.\n2. Copy the full prompt. Change the subject, setting, palette, or camera angle.\n3. Choose **Try this prompt** to carry the selected prompt into the image generator, including through sign-in.\n4. Review the prompt and aspect ratio, then choose Generate.', '',
    zh ? '## 按风格浏览' : '## Browse by style', '',
    '| Style | Prompts |', '| --- | ---: |',
    ...catalog.categories.map(category => `| [${zh ? zhCategories[category.id] : category.name}](#style-${category.id}) | ${catalog.prompts.filter(entry => entry.category === category.id).length} |`), '',
    zh ? '## 图片与 Prompt' : '## Images & prompts', '',
  ];
  for (const category of catalog.categories) {
    lines.push(`<a id="style-${category.id}"></a>`, '', `## ${zh ? zhCategories[category.id] : category.name}`, '');
    for (const entry of catalog.prompts.filter(item => item.category === category.id)) {
      lines.push(`<a id="prompt-${entry.id}"></a>`, '', `### ${String(entry.id).padStart(3, '0')}. ${entry.title}`, '',
        `<a href="${tracked(entry)}"><img src="${entry.preview}" alt="${entry.title}" width="520" loading="lazy" /></a>`, '',
        entry.description, '', `**${entry.aspect}** · ${entry.tags.join(' · ')}`, '',
        '<details>', `<summary>${zh ? '展开完整 Prompt' : 'View the full prompt'}</summary>`, '',
        '```text', entry.prompt, '```', '', '</details>', '',
        `**[${zh ? '在 HeyDreaming 使用这个 Prompt' : 'Try this prompt on HeyDreaming'} →](${tracked(entry)})** · [${zh ? '独立页面' : 'Permalink'}](${entry.detailUrl}) · [TXT](${entry.promptFile})`, '', '---', '');
    }
  }
  lines.push(zh ? '## 数据与链接' : '## Data & links', '',
    zh ? '- [prompts.json](prompts.json)：100 条结构化记录，包括稳定 ID、prompt、配图路径和对应网页。\n- [prompts/](prompts/)：每个 prompt 一个 TXT 文件。\n- [assets/previews/](assets/previews/)：100 张案例预览。\n- [贡献指南](CONTRIBUTING.md)：提交新案例或修正。' : '- [prompts.json](prompts.json): 100 structured entries with stable IDs, prompts, preview paths, and individual page links.\n- [prompts/](prompts/): one TXT file per prompt.\n- [assets/previews/](assets/previews/): 100 example previews.\n- [Contributing](CONTRIBUTING.md): submit an example or correction.', '',
    zh ? '每个案例的分享链接使用 `https://heydreaming.com/gpt-image-prompts?id=<id>`，独立页面使用 `/gpt-image-prompts/<slug>`。ID 与 slug 保持稳定。' : 'Share links use `https://heydreaming.com/gpt-image-prompts?id=<id>`. Dedicated pages use `/gpt-image-prompts/<slug>`. IDs and slugs remain stable.', '',
    zh ? '使用 `npm run build` 从目录数据生成 README；使用 `npm run verify` 检查配图、文本、ID 和链接映射。' : 'Run `npm run build` to generate the READMEs from the catalog. Run `npm run verify` to validate previews, prompt text, IDs, and link mappings.', '',
    `**[${zh ? '探索下一张图' : 'Find your next idea'} →](${gallery})**`, '');
  return lines.join('\n');
}

for (const [file, zh] of [['README.md', false], ['README.zh-CN.md', true]]) {
  const body = render(zh);
  if (check) {
    if (readFileSync(resolve(root, file), 'utf8') !== body) throw new Error(`${file} is stale. Run npm run build.`);
  } else writeFileSync(resolve(root, file), body);
}
console.log(check ? 'README generation matches the catalog.' : 'Built both READMEs with 100 paired examples.');

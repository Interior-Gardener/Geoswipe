/**
 * Regenerates public/chapters/index.json.
 *
 * The Story Library reads that manifest to mark which heritage sites have a
 * hand-authored ("Illustrated") story book. Every other site still opens a
 * story generated from its own site data, so the manifest is optional - it only
 * controls the badge and the sort order.
 *
 * Run after adding or removing a chapter file:
 *   npm run chapters:manifest
 */
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = join('public', 'chapters');

const slugs = readdirSync(dir)
  .filter((file) => file.endsWith('.json') && file !== 'index.json')
  .map((file) => file.replace(/\.json$/, ''))
  .sort();

const manifest = {
  note: 'Slugs of hand-authored storybook chapter files in this folder. Regenerate with: npm run chapters:manifest',
  slugs,
};

writeFileSync(join(dir, 'index.json'), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`chapters manifest: ${slugs.length} entries`);
console.log(`  ${slugs.join(', ')}`);

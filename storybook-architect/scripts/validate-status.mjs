#!/usr/bin/env node
// Status lint. NOT a CI gate yet — see LIMITATIONS.
//
// LIMITATIONS (do not wire this into CI until they are fixed):
//   Storybook resolves tags per story across project -> meta -> story, where `!tag`
//   REMOVES an inherited tag. This script flattens every tag array in the file and
//   strips `!`, which is not the same operation. Known false positives:
//     - meta ['ready'] + story ['!ready','experimental'] reports "3 status tags"
//     - a workshop meta ['!autodocs','!manifest'] is treated as a contract
//     - any custom project tag is rejected as an invalid status
//   It also reads no previous version, so transition rules are NOT implemented,
//   and the deprecation check is a prose regex that accepts "use caution".
// Fixing this needs resolved per-story metadata (Storybook's index/manifest), not
// a file-level regex.
// Usage: node scripts/validate-status.mjs [--root src] [--require-status]
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const args = process.argv.slice(2);
const arg = (n, d) => { const i = args.indexOf(`--${n}`); return i === -1 ? d : args[i + 1]; };
const ROOT = arg('root', 'src');
const REQUIRE = args.includes('--require-status');

const STATUS = new Set(['wip', 'experimental', 'ready', 'deprecated']);
// Tags that are Storybook's or this skill's, not a status. Anything else unknown is a typo.
const KNOWN_NON_STATUS = new Set(['autodocs', 'dev', 'test', 'manifest', 'play-fn', 'test-fn', 'audit', 'workshop', 'contract']);

const walk = (dir, acc = []) => {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.stories\.(t|j)sx?$/.test(p)) acc.push(p);
  }
  return acc;
};

const errors = [];
const counts = Object.fromEntries([...STATUS].map((s) => [s, 0]));

for (const file of walk(ROOT)) {
  const text = readFileSync(file, 'utf8');
  const rel = relative(process.cwd(), file);
  const tags = [...text.matchAll(/tags:\s*\[([^\]]*)\]/g)]
    .flatMap((m) => m[1].split(',').map((t) => t.trim().replace(/^['"`]|['"`]$/g, '')))
    .filter(Boolean);

  const bare = tags.map((t) => t.replace(/^!/, ''));
  const statuses = bare.filter((t) => STATUS.has(t));
  const unknown = bare.filter((t) => !STATUS.has(t) && !KNOWN_NON_STATUS.has(t));

  for (const u of unknown) errors.push(`${rel}: unknown tag '${u}'. Status must be one of: ${[...STATUS].join(', ')}.`);
  if (statuses.length > 1) errors.push(`${rel}: ${statuses.length} status tags (${statuses.join(', ')}). Exactly one.`);

  const isContract = bare.includes('autodocs') || bare.includes('contract');
  if (statuses.length === 0 && (REQUIRE || isContract)) {
    errors.push(`${rel}: contract story has no status tag. Add one of: ${[...STATUS].join(', ')}.`);
  }
  for (const s of statuses) counts[s]++;

  // A deprecation with no replacement is a warning nobody can act on.
  if (statuses.includes('deprecated') && !/use\s+[`'"<]?[A-Z]\w+/i.test(text)) {
    errors.push(`${rel}: deprecated with no replacement pointer. Add a "Use X instead" line in the meta description or JSDoc.`);
  }
}

console.log(JSON.stringify({ statusCounts: counts, findings: errors.length }, null, 2));
if (errors.length) {
  console.error('\n' + errors.join('\n'));
  console.error('\nThese are LINT FINDINGS, not verdicts: tag inheritance is not resolved (see header).');
  if (args.includes('--gate')) process.exit(1);
}
console.log('status: ok');

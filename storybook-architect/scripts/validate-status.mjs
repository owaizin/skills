#!/usr/bin/env node
// CI gate: component status is an enum, not a vibe.
// Fails on: unknown status tag, missing status on a contract story, a deprecated
// component with no replacement pointer.
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

console.log(JSON.stringify({ statusCounts: counts, errors: errors.length }, null, 2));
if (errors.length) {
  console.error('\n' + errors.join('\n'));
  process.exit(1);
}
console.log('status: ok');

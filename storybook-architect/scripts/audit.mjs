#!/usr/bin/env node
// Re-runnable Storybook decay audit. Same input -> same output, so the delta is the signal.
// Usage:
//   node scripts/audit.mjs --root src --out .storybook-audit
//   node scripts/audit.mjs --root src --gate hardcoded   (exit 1 if above committed baseline)
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, basename, extname } from 'node:path';

const args = process.argv.slice(2);
const arg = (n, d) => { const i = args.indexOf(`--${n}`); return i === -1 ? d : args[i + 1]; };
const ROOT = arg('root', 'src');
const OUT = arg('out', '.storybook-audit');
const GATE = arg('gate', null);

const COMPONENT_EXT = new Set(['.tsx', '.jsx', '.vue', '.svelte']);
const SKIP_DIR = /(^|\/)(node_modules|dist|build|coverage|\.git|storybook-static)(\/|$)/;
const TOKEN_FILE = /(tokens?|theme|palette|design-system\/(foundations|primitives))/i;
const STORY = /\.stories\.(t|j)sx?$|\.stories\.mdx$/;

const walk = (dir, acc = []) => {
  if (!existsSync(dir) || SKIP_DIR.test(dir)) return acc;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
};

const files = walk(ROOT);
const storyFiles = files.filter((f) => STORY.test(f));
const componentFiles = files.filter(
  (f) => COMPONENT_EXT.has(extname(f)) && !STORY.test(f) && !/\.(test|spec)\./.test(f)
);

const src = new Map(files.map((f) => [f, readFileSync(f, 'utf8')]));

// --- 1. hardcoded values -----------------------------------------------------
// Raw values outside a token/theme file. 0/1px borders and 0px are noise, not findings.
const HEX = /#[0-9a-fA-F]{3,8}\b/g;
const FUNC_COLOR = /\b(?:rgba?|hsla?)\(\s*\d/g;
const PX = /(?<![\w-])(\d{2,4})px\b/g;
const hardcoded = [];
for (const f of [...componentFiles, ...files.filter((f) => /\.(css|scss|less)$/.test(f))]) {
  if (TOKEN_FILE.test(f)) continue;
  const text = src.get(f) ?? '';
  const hits = [
    ...(text.match(HEX) ?? []),
    ...(text.match(FUNC_COLOR) ?? []),
    ...(text.match(PX) ?? []).filter((m) => Number(m.replace('px', '')) > 1),
  ];
  if (hits.length) hardcoded.push({ file: relative(ROOT, f), count: hits.length, samples: [...new Set(hits)].slice(0, 8) });
}
hardcoded.sort((a, b) => b.count - a.count);

// --- 2. story coverage + import traffic -------------------------------------
const nameOf = (f) => basename(f, extname(f));
const storiedNames = new Set(storyFiles.map((f) => basename(f).split('.stories')[0]));
const importCount = new Map();
for (const [, text] of src) {
  for (const m of text.matchAll(/from\s+['"][^'"]*\/?([A-Z][\w-]*)['"]/g)) {
    importCount.set(m[1], (importCount.get(m[1]) ?? 0) + 1);
  }
}
const uncovered = componentFiles
  .filter((f) => /^[A-Z]/.test(nameOf(f)) && !storiedNames.has(nameOf(f)))
  .map((f) => ({ file: relative(ROOT, f), component: nameOf(f), usedIn: importCount.get(nameOf(f)) ?? 0 }))
  .sort((a, b) => b.usedIn - a.usedIn);

// --- 3. duplicate clusters ---------------------------------------------------
// ponytail: props by regex, not by AST. Cheap and dependency-free; swap in ts-morph
// if the false-positive rate on this codebase actually bites.
const propsOf = (text) => {
  const set = new Set();
  for (const m of text.matchAll(/(?:interface|type)\s+\w*Props\b[^{]*\{([\s\S]*?)\}/g)) {
    for (const p of m[1].matchAll(/(\w+)\??\s*:/g)) set.add(p[1]);
  }
  for (const m of text.matchAll(/(?:function|const)\s+[A-Z]\w*\s*[=:(][^{]*\{\s*([\w,\s:=]+?)\s*\}\s*[:)]/g)) {
    for (const p of m[1].split(',')) { const k = p.trim().split(/[:=]/)[0].trim(); if (k) set.add(k); }
  }
  return set;
};
const norm = (n) => n.toLowerCase().replace(/(base|new|old|v\d+|legacy|custom|shared|common)/g, '');
const shapes = componentFiles
  .filter((f) => /^[A-Z]/.test(nameOf(f)))
  .map((f) => ({ file: relative(ROOT, f), name: nameOf(f), key: norm(nameOf(f)), props: propsOf(src.get(f) ?? '') }));

const overlap = (a, b) => {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const p of a) if (b.has(p)) shared++;
  return shared / Math.min(a.size, b.size);
};
const duplicates = [];
for (let i = 0; i < shapes.length; i++) {
  for (let j = i + 1; j < shapes.length; j++) {
    const a = shapes[i], b = shapes[j];
    const sameish = a.key === b.key || a.key.includes(b.key) || b.key.includes(a.key);
    const ov = overlap(a.props, b.props);
    if (sameish && ov >= 0.6) {
      duplicates.push({ a: a.file, b: b.file, propOverlap: Number(ov.toFixed(2)), sharedProps: [...a.props].filter((p) => b.props.has(p)) });
    }
  }
}

// --- 4. stale stories --------------------------------------------------------
const stale = [];
for (const s of storyFiles) {
  const base = basename(s).split('.stories')[0];
  const comp = componentFiles.find((c) => nameOf(c) === base);
  if (!comp) { stale.push({ story: relative(ROOT, s), reason: 'no matching component file' }); continue; }
  const sM = statSync(s).mtimeMs, cM = statSync(comp).mtimeMs;
  if (cM > sM) {
    stale.push({ story: relative(ROOT, s), component: relative(ROOT, comp), reason: 'component modified after story', daysBehind: Math.round((cM - sM) / 86400000) });
  }
}

// --- 5. naming drift ---------------------------------------------------------
// Report competing vocabularies. Never pick a winner: that is the team's call.
const SYNONYMS = [['primary', 'brand', 'accent'], ['danger', 'error', 'negative', 'critical'], ['muted', 'subtle', 'secondary', 'subdued'], ['success', 'positive', 'confirm']];
const drift = SYNONYMS.map((group) => {
  const used = group.filter((w) => [...src.values()].some((t) => new RegExp(`['"\`.-]${w}\\b`, 'i').test(t)));
  return used.length > 1 ? { competing: used } : null;
}).filter(Boolean);

// --- metrics -----------------------------------------------------------------
const pct = (n, d) => (d === 0 ? 100 : Math.round((n / d) * 100));
const metrics = {
  tokenAdoption: pct(componentFiles.length - hardcoded.filter((h) => COMPONENT_EXT.has(extname(h.file))).length, componentFiles.length),
  storyCoverage: pct(componentFiles.length - uncovered.length, componentFiles.length),
  duplicateClusters: duplicates.length,
  staleStories: stale.length,
  hardcodedHits: hardcoded.reduce((s, h) => s + h.count, 0),
};

const findings = { generatedAt: new Date().toISOString(), root: ROOT, counts: { components: componentFiles.length, stories: storyFiles.length }, metrics, hardcoded, uncovered, duplicates, stale, drift };

// --- gate mode ---------------------------------------------------------------
if (GATE) {
  // Baseline lives OUTSIDE OUT: the report dir is wiped on every full run. Commit this file.
  const baselinePath = `${OUT}.baseline.json`;
  const baseline = existsSync(baselinePath) ? JSON.parse(readFileSync(baselinePath, 'utf8')) : null;
  const key = { hardcoded: 'hardcodedHits', stale: 'staleStories', duplicates: 'duplicateClusters' }[GATE] ?? GATE;
  const now = metrics[key], was = baseline?.metrics?.[key];
  if (was === undefined) {
    writeFileSync(baselinePath, JSON.stringify({ metrics }, null, 2));
    console.log(`baseline written: ${key}=${now}`);
    process.exit(0);
  }
  console.log(`${key}: ${now} (baseline ${was})`);
  if (now > was) { console.error(`FAIL: ${key} rose by ${now - was}. Fix it, or update the baseline deliberately.`); process.exit(1); }
  process.exit(0);
}

// --- output ------------------------------------------------------------------
// Regenerated from scratch every run: a fixed finding disappears with no cleanup ritual.
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'findings.json'), JSON.stringify(findings, null, 2));

const page = (title, body) => `import { Meta } from '@storybook/addon-docs/blocks';

<Meta title="Audit/${title}" tags={['audit', '!manifest', '!autodocs']} />

{/* GENERATED by scripts/audit.mjs — do not edit. Regenerated each run. */}

${body}
`;
const table = (head, rows) => rows.length === 0 ? '_None found._' : `| ${head.join(' | ')} |\n|${head.map(() => '---').join('|')}|\n${rows.map((r) => `| ${r.join(' | ')} |`).join('\n')}`;

writeFileSync(join(OUT, 'Overview.mdx'), page('Overview', `# Audit — ${new Date(findings.generatedAt).toDateString()}

${table(['Metric', 'Value'], [
  ['Token adoption', `${metrics.tokenAdoption}%`],
  ['Story coverage', `${metrics.storyCoverage}%`],
  ['Duplicate clusters', metrics.duplicateClusters],
  ['Stale stories', metrics.staleStories],
  ['Hardcoded value hits', metrics.hardcodedHits],
])}

${componentFiles.length} components, ${storyFiles.length} story files under \`${ROOT}\`.
Regenerate: \`node scripts/audit.mjs --root ${ROOT}\`.`));

writeFileSync(join(OUT, 'HardcodedValues.mdx'), page('Hardcoded values', `# Hardcoded values\n\nEach hit is a token that does not exist yet. Worst offenders first.\n\n${table(['File', 'Hits', 'Samples'], hardcoded.slice(0, 40).map((h) => [h.file, h.count, h.samples.join(' ')]))}`));

writeFileSync(join(OUT, 'Duplicates.mdx'), page('Duplicates', `# Duplicate components\n\nSimilar name, overlapping prop shape. Consolidation candidates — confirm before merging.\n\n${table(['A', 'B', 'Prop overlap', 'Shared'], duplicates.map((d) => [d.a, d.b, d.propOverlap, d.sharedProps.slice(0, 6).join(', ')]))}`));

writeFileSync(join(OUT, 'Coverage.mdx'), page('Coverage', `# Components without a story\n\nSorted by import count: the top of this list is shared vocabulary that is undocumented.\n\n${table(['Component', 'Used in', 'File'], uncovered.slice(0, 40).map((u) => [u.component, u.usedIn, u.file]))}`));

writeFileSync(join(OUT, 'Stale.mdx'), page('Stale', `# Stale stories\n\nComponent changed after its story. This is decay, measured.\n\n${table(['Story', 'Reason', 'Days behind'], stale.map((s) => [s.story, s.reason, s.daysBehind ?? '—']))}`));

writeFileSync(join(OUT, 'NamingDrift.mdx'), page('Naming drift', `# Naming drift\n\nCompeting vocabularies for one concept. **No winner is picked here** — that is a team decision.\n\n${table(['Competing names'], drift.map((d) => [d.competing.join(' / ')]))}`));

console.log(JSON.stringify(metrics, null, 2));
console.log(`\nWrote ${OUT}/findings.json and 6 MDX pages. Add '${OUT}/**/*.mdx' to main.ts stories to view.`);

#!/usr/bin/env node
// Re-runnable Storybook decay audit. Same input -> same output, so the delta is the signal.
// Usage:
//   node scripts/audit.mjs --root src --out .storybook-audit
//   node scripts/audit.mjs --root src --init-baseline    (explicit, reviewable)
//   node scripts/audit.mjs --root src --gate literalValueMatches  (read-only check)
//
// WHAT THIS MEASURES: literal values in source text, component files without a
// story, name/prop-shape similarity, and file mtimes. These are DISCOVERY SIGNALS
// for review. They are not evidence that a component meets its consumer contract:
// nothing here checks focus behaviour, keyboard operation, translated content, or
// whether a published example matches the installed package.
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, basename, extname, resolve, sep } from 'node:path';

const args = process.argv.slice(2);
const arg = (n, d) => { const i = args.indexOf(`--${n}`); return i === -1 ? d : args[i + 1]; };
const ROOT = arg('root', 'src');
const OUT = arg('out', '.storybook-audit');
const GATE = arg('gate', null);
const INIT = args.includes('--init-baseline');

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
const HEX = /(?<![&\w])#[0-9a-fA-F]{3,8}\b/g;  // (?<!&) so HTML entities like &#9650; are not colors
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
// Key on EXPORTED component names, never on filename case. shadcn-convention repos
// name the file `button.tsx` and export `Button`; a PascalCase filename filter skips
// the entire library while reporting high coverage.
const nameOf = (f) => basename(f, extname(f));
const key = (n) => n.toLowerCase().replace(/[-_]/g, '');

const exportsOf = (text) => {
  const set = new Set();
  for (const m of text.matchAll(/export\s+(?:default\s+)?(?:function|const|class)\s+([A-Z]\w*)/g)) set.add(m[1]);
  for (const m of text.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const p of m[1].split(',')) {
      const n = p.trim().split(/\s+as\s+/).pop().trim();
      if (/^[A-Z]\w*$/.test(n)) set.add(n);
    }
  }
  return set;
};

// A component file exports at least one capitalized binding.
const componentOf = new Map();
for (const f of componentFiles) {
  const names = exportsOf(src.get(f) ?? '');
  if (names.size) componentOf.set(f, [...names][0]);
}

// Storied if a story file matches the filename OR a `component:` reference.
const storiedKeys = new Set(storyFiles.map((f) => key(basename(f).split('.stories')[0])));
for (const s of storyFiles) {
  for (const m of (src.get(s) ?? '').matchAll(/component:\s*([A-Z]\w*)/g)) storiedKeys.add(key(m[1]));
}

// Import traffic by module basename and by named import, both case-insensitive.
const importCount = new Map();
for (const [, text] of src) {
  // One import statement counts once per distinct key, even when the module basename
  // and the named binding normalize to the same thing (`import { Card } from './Card'`).
  for (const m of text.matchAll(/import\s+(?:\{([^}]*)\}|[\w*\s,]+?)\s*from\s*['"][^'"]*?([\w-]+)['"]/g)) {
    const keys = new Set([key(m[2])]);
    for (const p of (m[1] ?? '').split(',')) {
      const n = p.trim().split(/\s+as\s+/)[0].trim();
      if (/^[A-Z]\w*$/.test(n)) keys.add(key(n));
    }
    for (const k of keys) importCount.set(k, (importCount.get(k) ?? 0) + 1);
  }
}

const uncovered = [...componentOf.entries()]
  .filter(([f, name]) => !storiedKeys.has(key(nameOf(f))) && !storiedKeys.has(key(name)))
  .map(([f, name]) => ({
    file: relative(ROOT, f),
    component: name,
    usedIn: Math.max(importCount.get(key(name)) ?? 0, importCount.get(key(nameOf(f))) ?? 0),
  }))
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
const norm = (n) => key(n).replace(/(base|new|old|v\d+|legacy|custom|shared|common)/g, '');
const shapes = [...componentOf.entries()]
  .map(([f, name]) => ({ file: relative(ROOT, f), name, key: norm(name), props: propsOf(src.get(f) ?? '') }));

const overlap = (a, b) => {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const p of a) if (b.has(p)) shared++;
  return shared / Math.min(a.size, b.size);
};
const duplicates = [];
// Two files exporting the SAME component name are a duplicate regardless of prop
// overlap: parallel `components/button.tsx` + `shadcn/button.tsx` trees are the
// canonical case this audit exists to surface, and they often share no prop types.
const byName = new Map();
for (const s of shapes) byName.set(s.name, [...(byName.get(s.name) ?? []), s]);
for (const [name, group] of byName) {
  if (group.length < 2) continue;
  for (let i = 0; i < group.length; i++) {
    for (let j = i + 1; j < group.length; j++) {
      duplicates.push({
        a: group[i].file, b: group[j].file, reason: 'same exported name',
        propOverlap: Number(overlap(group[i].props, group[j].props).toFixed(2)),
        sharedProps: [...group[i].props].filter((p) => group[j].props.has(p)),
      });
    }
  }
}
const seen = new Set(duplicates.map((d) => `${d.a}|${d.b}`));
for (let i = 0; i < shapes.length; i++) {
  for (let j = i + 1; j < shapes.length; j++) {
    const a = shapes[i], b = shapes[j];
    const sameish = a.key === b.key || a.key.includes(b.key) || b.key.includes(a.key);
    const ov = overlap(a.props, b.props);
    if (sameish && ov >= 0.6 && !seen.has(`${a.file}|${b.file}`)) {
      duplicates.push({ a: a.file, b: b.file, reason: 'similar name + prop shape', propOverlap: Number(ov.toFixed(2)), sharedProps: [...a.props].filter((p) => b.props.has(p)) });
    }
  }
}

// --- 4. stale stories --------------------------------------------------------
const stale = [];
for (const s of storyFiles) {
  const base = basename(s).split('.stories')[0];
  const comp = componentFiles.find((c) => key(nameOf(c)) === key(base));
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
// Zero denominator is UNKNOWN, never a perfect score: an empty or unparsed
// inventory must not read as 100%.
const pct = (n, d) => (d === 0 ? null : Math.round((n / d) * 100));
const metrics = {
  // Counts of literal matches in scanned text. NOT "token adoption": this measures
  // neither styled declarations nor semantic-token usage, and a component importing
  // a CSS file full of raw hex scores clean here.
  literalValueMatches: hardcoded.reduce((s, h) => s + h.count, 0),
  filesWithLiteralValues: hardcoded.length,
  // Denominator: files this scanner could parse a component export from. Frameworks
  // it cannot parse (Vue/Svelte SFCs) yield null, never a perfect score.
  componentsScanned: componentOf.size,
  componentsWithoutStories: uncovered.length,
  storiedComponentRatio: pct(componentOf.size - uncovered.length, componentOf.size),
  candidateDuplicatePairs: duplicates.length,  // pairs needing review, not confirmed duplicates
  storiesOlderThanComponent: stale.length,  // mtime only: checkout time on a fresh clone, not decay
};

const findings = { generatedAt: new Date().toISOString(), root: ROOT, counts: { components: componentFiles.length, stories: storyFiles.length }, metrics, hardcoded, uncovered, duplicates, stale, drift };

// --- gate mode ---------------------------------------------------------------
// Only violation COUNTS can be gated, and only in one direction: they must not rise.
// Ratios are excluded deliberately - gating a ratio inverts the policy the moment
// coverage improves.
const GATEABLE = {
  literalValueMatches: 'literal colour/size values in scanned source',
  candidateDuplicatePairs: 'component pairs flagged for duplicate review',
};
const GATE_ALIAS = { hardcoded: 'literalValueMatches', duplicates: 'candidateDuplicatePairs' };
const baselinePath = `${OUT}.baseline.json`;

if (INIT) {
  if (!existsSync(ROOT)) { console.error(`FAIL: --root ${resolve(ROOT)} does not exist.`); process.exit(2); }
  if (componentFiles.length === 0) { console.error(`FAIL: no component files under ${resolve(ROOT)}.`); process.exit(2); }
  writeFileSync(baselinePath, JSON.stringify({ createdAt: new Date().toISOString(), root: ROOT, metrics }, null, 2));
  console.log(`Baseline written to ${baselinePath}. Commit it: raising it later should be a reviewed change.`);
  process.exit(0);
}

if (GATE) {
  const key = GATE_ALIAS[GATE] ?? GATE;
  if (!(key in GATEABLE)) {
    console.error(`FAIL: '${GATE}' is not gateable. Gateable metrics: ${Object.keys(GATEABLE).join(', ')}. Ratios are not gateable: gating one inverts the policy the moment it improves.`);
    process.exit(2);
  }
  if (!existsSync(ROOT)) { console.error(`FAIL: --root ${resolve(ROOT)} does not exist; refusing to gate on an empty scan.`); process.exit(2); }
  if (componentFiles.length === 0) { console.error(`FAIL: no component files under ${resolve(ROOT)}; refusing to gate on an empty scan.`); process.exit(2); }
  if (!existsSync(baselinePath)) {
    console.error(`FAIL: no baseline at ${baselinePath}. Run --init-baseline once, review the numbers, and commit it. A gate must never mint its own baseline from the change it is checking.`);
    process.exit(2);
  }
  const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
  const was = baseline?.metrics?.[key], now = metrics[key];
  if (typeof was !== 'number') { console.error(`FAIL: baseline has no numeric '${key}'. Re-run --init-baseline.`); process.exit(2); }
  if (typeof now !== 'number') { console.error(`FAIL: '${key}' is unknown for this scan.`); process.exit(2); }
  console.log(`${key}: ${now} (baseline ${was}) - ${GATEABLE[key]}`);
  if (now > was) { console.error(`FAIL: ${key} rose by ${now - was}. This is a count ceiling, not proof that no new violation was introduced - removing one and adding another elsewhere passes.`); process.exit(1); }
  process.exit(0);
}

// --- output ------------------------------------------------------------------
// Regenerated from scratch every run: a fixed finding disappears with no cleanup ritual.
// The report dir is WIPED, so it must never overlap the scan root and must be a
// directory this script created. Both guards exist because `--root src --out src`
// silently destroyed the source it was auditing.
const MARKER = '.audit-generated';
const rootAbs = resolve(ROOT), outAbs = resolve(OUT);
const contains = (a, b) => b === a || b.startsWith(a + sep);
if (contains(outAbs, rootAbs) || contains(rootAbs, outAbs)) {
  console.error(`FAIL: --out (${outAbs}) overlaps --root (${rootAbs}). The report directory is deleted on every run; pick a path outside the scan root.`);
  process.exit(2);
}
if (existsSync(outAbs)) {
  if (!statSync(outAbs).isDirectory()) { console.error(`FAIL: --out ${outAbs} is not a directory.`); process.exit(2); }
  if (!existsSync(join(outAbs, MARKER))) {
    console.error(`FAIL: refusing to delete ${outAbs} — it was not created by this script (no ${MARKER}). Remove it yourself or choose another --out.`);
    process.exit(2);
  }
  rmSync(outAbs, { recursive: true, force: true });
}
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, MARKER), 'Generated by storybook-architect audit.mjs. Safe to delete.\n');
writeFileSync(join(OUT, 'findings.json'), JSON.stringify(findings, null, 2));

const page = (title, body) => `import { Meta } from '@storybook/addon-docs/blocks';

<Meta title="Audit/${title}" tags={['audit', '!manifest', '!autodocs']} />

{/* GENERATED by scripts/audit.mjs — do not edit. Regenerated each run. */}

${body}
`;
const table = (head, rows) => rows.length === 0 ? '_None found._' : `| ${head.join(' | ')} |\n|${head.map(() => '---').join('|')}|\n${rows.map((r) => `| ${r.join(' | ')} |`).join('\n')}`;

writeFileSync(join(OUT, 'Overview.mdx'), page('Overview', `# Audit — ${new Date(findings.generatedAt).toDateString()}

${table(['Metric', 'Value'], [
  ['Literal value matches', `${metrics.literalValueMatches} in ${metrics.filesWithLiteralValues} files`],
  ['Components with a story', metrics.storiedComponentRatio === null ? 'unknown - no component exports parsed' : `${metrics.storiedComponentRatio}% of ${metrics.componentsScanned} parsed`],
  ['Candidate duplicate pairs', metrics.candidateDuplicatePairs],
  ['Stories older than component (mtime)', metrics.storiesOlderThanComponent],
  ['Hardcoded value hits', metrics.hardcodedHits],
])}

${componentFiles.length} component files, ${storyFiles.length} story files under \`${ROOT}\`.

**These are discovery signals, not a quality verdict.** Literal matches are scanned from
source text, so a component importing a stylesheet full of raw values is not counted.
Duplicate pairs are name and prop-name similarity, not behaviour. Story counts cover only
files this scanner can parse a component export from. File age is mtime, which is checkout
time on a fresh clone. Nothing here tests focus behaviour, keyboard operation, translated
content, or whether a published example matches the installed package.
Regenerate: \`node scripts/audit.mjs --root ${ROOT}\`.`));

writeFileSync(join(OUT, 'HardcodedValues.mdx'), page('Hardcoded values', `# Literal values in source\n\nCandidates for review. A literal may already have a suitable token, be an implementation constant, be asset geometry, or warrant a documented exception - minting a token per hit just centralises the scatter.\n\n${table(['File', 'Hits', 'Samples'], hardcoded.slice(0, 40).map((h) => [h.file, h.count, h.samples.join(' ')]))}`));

writeFileSync(join(OUT, 'Duplicates.mdx'), page('Duplicates', `# Duplicate components\n\nSimilar name, overlapping prop shape. Consolidation candidates — confirm before merging.\n\n${table(['A', 'B', 'Why', 'Prop overlap', 'Shared'], duplicates.map((d) => [d.a, d.b, d.reason, d.propOverlap, d.sharedProps.slice(0, 6).join(', ')]))}`));

writeFileSync(join(OUT, 'Coverage.mdx'), page('Coverage', `# Components without a story\n\nSorted by import count: the top of this list is shared vocabulary that is undocumented.\n\n${table(['Component', 'Used in', 'File'], uncovered.slice(0, 40).map((u) => [u.component, u.usedIn, u.file]))}`));

writeFileSync(join(OUT, 'Stale.mdx'), page('Stale', `# Stories older than their component (mtime)\n\nA hint for prioritising review - **not** evidence of decay. A behaviour-preserving refactor lands here; a freshly edited story that is wrong does not.\n\n${table(['Story', 'Reason', 'Days behind'], stale.map((s) => [s.story, s.reason, s.daysBehind ?? '—']))}`));

writeFileSync(join(OUT, 'NamingDrift.mdx'), page('Naming drift', `# Naming drift\n\nCompeting vocabularies for one concept. **No winner is picked here** — that is a team decision.\n\n${table(['Competing names'], drift.map((d) => [d.competing.join(' / ')]))}`));

console.log(JSON.stringify(metrics, null, 2));
console.log(`\nWrote ${OUT}/findings.json and 6 MDX pages. Add '${OUT}/**/*.mdx' to main.ts stories to view.`);

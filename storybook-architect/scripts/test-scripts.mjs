#!/usr/bin/env node
// One runnable check for audit.mjs + validate-status.mjs. Run: node scripts/test-scripts.mjs
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync, utimesSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const here = dirname(fileURLToPath(import.meta.url));
const tmp = mkdtempSync(join(tmpdir(), 'sb-arch-'));
const w = (p, c) => { mkdirSync(dirname(join(tmp, p)), { recursive: true }); writeFileSync(join(tmp, p), c); };

// fixture: one clean component, two near-duplicate buttons, one stale story, hardcoded values
w('src/tokens/colors.ts', `export const brand = '#3B82F6';`); // token file: must be exempt
w('src/Card.tsx', `interface CardProps { title: string; onClick: () => void; }
export function Card({ title, onClick }: CardProps) { return null; }
const s = { color: '#ff0044', padding: '24px' };`);
w('src/Button.tsx', `interface ButtonProps { variant: string; size: string; disabled: boolean; onClick: () => void; }
export function Button(p: ButtonProps) { return null; }`);
w('src/legacy/ButtonLegacy.tsx', `interface ButtonLegacyProps { variant: string; size: string; disabled: boolean; label: string; }
export function ButtonLegacy(p: ButtonLegacyProps) { return null; }`);
w('src/Button.stories.tsx', `const meta = { component: Button, tags: ['autodocs', 'ready'] };`);
w('src/uses/App.tsx', `import { Card } from '../Card';\nimport { Card } from '../Card';`);
// shadcn convention: kebab-case filename, PascalCase export, no story.
// Regression guard: a filename-case filter skips this and inflates coverage.
w('src/components/date-picker.tsx', `interface DatePickerProps { value: string; onChange: () => void; }
const DatePicker = (p: DatePickerProps) => null;
export { DatePicker };`);
w('src/uses/Page.tsx', `import { DatePicker } from '../components/date-picker';`);

// make the story older than its component -> stale
const old = new Date('2020-01-01');
utimesSync(join(tmp, 'src/Button.stories.tsx'), old, old);

// --baseline is explicit in every call: the default is cwd-relative, and tests must
// never write a baseline into the skill directory they are run from.
const run = (script, extra = []) =>
  execFileSync('node', [join(here, script), '--root', join(tmp, 'src'),
    ...(script === 'audit.mjs' ? ['--baseline', join(tmp, 'baseline.json')] : []), ...extra], { encoding: 'utf8' });
// validate-status only exits non-zero under --gate now that it is a lint, not a verdict.
const runGate = (script, extra = []) => run(script, ['--gate', ...extra]);

const out = run('audit.mjs', ['--out', join(tmp, '.audit')]);
const f = JSON.parse(readFileSync(join(tmp, '.audit/findings.json'), 'utf8'));

assert.equal(f.counts.components, 6, 'counts .tsx components (Card, Button, ButtonLegacy, App, date-picker, Page), excludes stories and .ts token file');
assert.ok(f.hardcoded.some((h) => h.file.endsWith('Card.tsx')), 'flags hex + px in a component');
assert.ok(!f.hardcoded.some((h) => h.file.includes('tokens/')), 'token files are exempt');
assert.equal(f.duplicates.length, 1, 'Button vs ButtonLegacy is one duplicate cluster');
assert.ok(f.duplicates[0].propOverlap >= 0.6);
assert.ok(f.stale.some((s) => s.story.endsWith('Button.stories.tsx')), 'component newer than story is stale');
assert.ok(f.uncovered.some((u) => u.component === 'Card' && u.usedIn === 2), 'uncovered sorted by real import count');
assert.ok(f.uncovered.some((u) => u.component === 'DatePicker'), 'kebab-case file with PascalCase export counts as an uncovered component');
assert.ok(f.uncovered.find((u) => u.component === 'DatePicker').usedIn >= 1, 'kebab-case imports are counted');
assert.ok(f.metrics.storiedComponentRatio < 100, 'ratio reflects missing stories');
assert.ok(f.metrics.literalValueMatches > 0 && f.metrics.filesWithLiteralValues > 0, 'literal counts are raw counts, not a percentage');
assert.ok(!('tokenAdoption' in f.metrics), 'no metric claims to measure token adoption');
assert.ok(readFileSync(join(tmp, '.audit/Overview.mdx'), 'utf8').includes("tags={['audit', '!manifest', '!autodocs']}"), 'audit pages are quarantined');

// gate: first run writes a baseline outside the wiped report dir, second run passes
// A gate with no baseline must FAIL, never mint one from the change under test.
let noBaseline = false;
try { run('audit.mjs', ['--out', join(tmp, '.audit'), '--gate', 'hardcoded']); } catch { noBaseline = true; }
assert.ok(noBaseline, 'gate without a baseline exits non-zero');
run('audit.mjs', ['--out', join(tmp, '.audit'), '--init-baseline']);
run('audit.mjs', ['--out', join(tmp, '.audit')]); // full run wipes the report dir
const pass = run('audit.mjs', ['--out', join(tmp, '.audit'), '--gate', 'hardcoded']);
assert.ok(pass.includes('baseline'), 'baseline survives a full audit run');
// Ratios must be refused as gates: gating one inverts the policy when it improves.
let ratioRefused = false;
try { run('audit.mjs', ['--out', join(tmp, '.audit'), '--gate', 'storiedComponentRatio']); } catch { ratioRefused = true; }
assert.ok(ratioRefused, 'ratio metrics are not gateable');

// gate fails when the number rises
w('src/Worse.tsx', `const s = { color: '#abcdef', color2: '#123456', pad: '32px' };`);
let failed = false;
try { run('audit.mjs', ['--out', join(tmp, '.audit'), '--gate', 'hardcoded']); } catch { failed = true; }
assert.ok(failed, 'gate exits non-zero when hardcoded values increase');

// status validator
assert.ok(run('validate-status.mjs').includes('not a statement that statuses are correct'),
  'a clean lint run does not claim statuses are correct');
w('src/Bad.stories.tsx', `const meta = { component: Bad, tags: ['autodocs', 'redy'] };`);
let statusFailed = false;
try { runGate('validate-status.mjs'); } catch (e) { statusFailed = true; assert.ok(String(e.stderr).includes("unknown tag 'redy'")); }
assert.ok(statusFailed, 'typo status fails CI');

w('src/Bad.stories.tsx', `const meta = { component: Bad, tags: ['autodocs', 'deprecated'] };`);
let depFailed = false;
try { runGate('validate-status.mjs'); } catch (e) { depFailed = true; assert.ok(String(e.stderr).includes('replacement pointer')); }
assert.ok(depFailed, 'deprecated without replacement fails CI');

// P0 regression: the report dir is wiped each run, so it must never overlap the
// scan root, and must never delete a directory this script did not create.
let overlapRejected = false;
try { run('audit.mjs', ['--out', join(tmp, 'src')]); } catch { overlapRejected = true; }
assert.ok(overlapRejected, '--out inside --root is rejected');
assert.ok(readFileSync(join(tmp, 'src/Card.tsx'), 'utf8').includes('CardProps'), 'source survives an overlapping --out');

mkdirSync(join(tmp, 'notmine'), { recursive: true });
writeFileSync(join(tmp, 'notmine/keep.txt'), 'keep');
let foreignRejected = false;
try { run('audit.mjs', ['--out', join(tmp, 'notmine')]); } catch { foreignRejected = true; }
assert.ok(foreignRejected, 'refuses to wipe a directory it did not create');
assert.equal(readFileSync(join(tmp, 'notmine/keep.txt'), 'utf8'), 'keep', 'foreign files survive');

// Gates must fail closed on unknown input, never initialise a meaningless baseline.
let badGate = false;
try { run('audit.mjs', ['--out', join(tmp, '.g'), '--gate', 'hardcodded']); } catch { badGate = true; }
assert.ok(badGate, 'unknown --gate name exits non-zero');
let emptyScan = false;
try { execFileSync('node', [join(here, 'audit.mjs'), '--root', join(tmp, 'nope'), '--out', join(tmp, '.h'), '--gate', 'hardcoded'], { encoding: 'utf8' }); } catch { emptyScan = true; }
assert.ok(emptyScan, 'gating an empty/missing scan exits non-zero');

rmSync(tmp, { recursive: true, force: true });
console.log('all checks passed');

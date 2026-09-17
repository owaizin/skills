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

// make the story older than its component -> stale
const old = new Date('2020-01-01');
utimesSync(join(tmp, 'src/Button.stories.tsx'), old, old);

const run = (script, extra = []) =>
  execFileSync('node', [join(here, script), '--root', join(tmp, 'src'), ...extra], { encoding: 'utf8' });

const out = run('audit.mjs', ['--out', join(tmp, '.audit')]);
const f = JSON.parse(readFileSync(join(tmp, '.audit/findings.json'), 'utf8'));

assert.equal(f.counts.components, 4, 'counts .tsx components (Card, Button, ButtonLegacy, App), excludes stories and .ts token file');
assert.ok(f.hardcoded.some((h) => h.file.endsWith('Card.tsx')), 'flags hex + px in a component');
assert.ok(!f.hardcoded.some((h) => h.file.includes('tokens/')), 'token files are exempt');
assert.equal(f.duplicates.length, 1, 'Button vs ButtonLegacy is one duplicate cluster');
assert.ok(f.duplicates[0].propOverlap >= 0.6);
assert.ok(f.stale.some((s) => s.story.endsWith('Button.stories.tsx')), 'component newer than story is stale');
assert.ok(f.uncovered.some((u) => u.component === 'Card' && u.usedIn === 2), 'uncovered sorted by real import count');
assert.ok(f.metrics.storyCoverage < 100 && f.metrics.tokenAdoption < 100, 'metrics reflect the mess');
assert.ok(readFileSync(join(tmp, '.audit/Overview.mdx'), 'utf8').includes("tags={['audit', '!manifest', '!autodocs']}"), 'audit pages are quarantined');

// gate: first run writes a baseline outside the wiped report dir, second run passes
run('audit.mjs', ['--out', join(tmp, '.audit'), '--gate', 'hardcoded']);
run('audit.mjs', ['--out', join(tmp, '.audit')]); // full run wipes .audit
const pass = run('audit.mjs', ['--out', join(tmp, '.audit'), '--gate', 'hardcoded']);
assert.ok(pass.includes('baseline'), 'baseline survives a full audit run');

// gate fails when the number rises
w('src/Worse.tsx', `const s = { color: '#abcdef', color2: '#123456', pad: '32px' };`);
let failed = false;
try { run('audit.mjs', ['--out', join(tmp, '.audit'), '--gate', 'hardcoded']); } catch { failed = true; }
assert.ok(failed, 'gate exits non-zero when hardcoded values increase');

// status validator
assert.ok(run('validate-status.mjs').includes('ok'), 'valid status passes');
w('src/Bad.stories.tsx', `const meta = { component: Bad, tags: ['autodocs', 'redy'] };`);
let statusFailed = false;
try { run('validate-status.mjs'); } catch (e) { statusFailed = true; assert.ok(String(e.stderr).includes("unknown tag 'redy'")); }
assert.ok(statusFailed, 'typo status fails CI');

w('src/Bad.stories.tsx', `const meta = { component: Bad, tags: ['autodocs', 'deprecated'] };`);
let depFailed = false;
try { run('validate-status.mjs'); } catch (e) { depFailed = true; assert.ok(String(e.stderr).includes('replacement pointer')); }
assert.ok(depFailed, 'deprecated without replacement fails CI');

rmSync(tmp, { recursive: true, force: true });
console.log('all checks passed');

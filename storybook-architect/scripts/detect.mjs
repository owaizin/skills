#!/usr/bin/env node
// Detect Storybook version, framework package and config paths BEFORE emitting any code.
// Usage: node scripts/detect.mjs [projectRoot]
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2] ?? process.cwd();
const read = (p) => { try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; } };

const pkg = read(join(root, 'package.json')) ?? {};
const deps = { ...pkg.dependencies, ...pkg.devDependencies };

// Installed version beats the declared range: a caret range tells you nothing about what resolved.
const installed = read(join(root, 'node_modules/storybook/package.json'))?.version;
const declared = deps.storybook ?? deps['@storybook/cli'] ?? null;
const version = installed ?? (declared ? declared.replace(/^[^\d]*/, '') : null);
const major = version ? Number(version.split('.')[0]) : null;

// The framework package IS the import path for Meta/StoryObj. Never guess it.
const FRAMEWORKS = Object.keys(deps).filter((d) =>
  /^@storybook\/(react|vue3|svelte|angular|nextjs|sveltekit|preact|web-components|html|ember|server)(-vite|-webpack5)?$/.test(d)
);
const configDir = ['.storybook', '.config/storybook'].map((d) => join(root, d)).find(existsSync) ?? null;
const mainFile = configDir
  ? readdirSync(configDir).find((f) => /^main\.(ts|js|mjs|cjs|tsx)$/.test(f))
  : null;

const addons = Object.keys(deps).filter((d) => d.startsWith('@storybook/addon-'));
const out = {
  storybookInstalled: Boolean(version),
  version: version ?? null,
  major,
  frameworkPackages: FRAMEWORKS,
  importPath: FRAMEWORKS[0] ?? null,
  testImport: major === null ? null : major >= 9 ? 'storybook/test' : '@storybook/test',
  configDir,
  mainFile: mainFile ? join(configDir, mainFile) : null,
  addons,
  supports: {
    // Manifests + MCP are the agent-readable path; both are Storybook 10 era features.
    manifests: major !== null && major >= 10,
    mcpAddon: addons.includes('@storybook/addon-mcp'),
    vitestAddon: addons.includes('@storybook/addon-vitest'),
    a11yAddon: addons.includes('@storybook/addon-a11y'),
  },
  warnings: [],
};

if (!out.storybookInstalled) out.warnings.push('Storybook not installed — do not emit story code yet.');
if (FRAMEWORKS.length === 0) out.warnings.push('No framework package found; ask before choosing an import path.');
if (FRAMEWORKS.length > 1) out.warnings.push(`Multiple framework packages: ${FRAMEWORKS.join(', ')} — confirm which owns this story.`);
if (major !== null && major < 9) out.warnings.push(`Storybook ${major}: tags config, manifests and sb.mock() are unavailable. Verify every API against the installed version's docs.`);

console.log(JSON.stringify(out, null, 2));

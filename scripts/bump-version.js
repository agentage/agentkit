#!/usr/bin/env node

/**
 * bump-version.js
 *
 * Workspace-aware version bump for the AgentKit monorepo.
 *
 * Usage: node scripts/bump-version.js [patch|minor|major] [--packages core,platform]
 *
 * Default: bump ALL non-private packages
 * --packages core        bumps only core
 * --packages platform    bumps only platform
 * --packages core,platform bumps both
 *
 * Output:
 *   NEW_VERSIONS=core@0.5.1,platform@0.2.2
 *   RELEASE_LABEL=core@0.5.1+platform@0.2.2
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const PACKAGES = {
  core: join(rootDir, 'packages/core/package.json'),
  platform: join(rootDir, 'packages/platform/package.json'),
};

/**
 * Bump a semver version string by the given type
 */
function bumpVersion(version, type) {
  const [major, minor, patch] = version.split('.').map(Number);

  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(`Invalid bump type: ${type}. Use patch, minor, or major.`);
  }
}

/**
 * Parse CLI arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  let bumpType = 'patch';
  let packages = Object.keys(PACKAGES);

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--packages' && args[i + 1]) {
      packages = args[i + 1].split(',').map((p) => p.trim());
      i++;
    } else if (['patch', 'minor', 'major'].includes(args[i])) {
      bumpType = args[i];
    }
  }

  // Validate package names
  for (const pkg of packages) {
    if (!PACKAGES[pkg]) {
      console.error(`Unknown package: ${pkg}. Available: ${Object.keys(PACKAGES).join(', ')}`);
      process.exit(1);
    }
  }

  return { bumpType, packages };
}

function main() {
  const { bumpType, packages } = parseArgs();
  const bumped = [];

  for (const pkg of packages) {
    const pkgPath = PACKAGES[pkg];
    const pkgJson = JSON.parse(readFileSync(pkgPath, 'utf-8'));

    if (pkgJson.private) {
      console.error(`Skipping private package: ${pkg}`);
      continue;
    }

    const oldVersion = pkgJson.version;
    const newVersion = bumpVersion(oldVersion, bumpType);

    pkgJson.version = newVersion;
    writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2) + '\n');

    console.error(`${pkg}: ${oldVersion} -> ${newVersion}`);
    bumped.push({ name: pkg, version: newVersion });
  }

  if (bumped.length === 0) {
    console.error('No packages were bumped');
    process.exit(1);
  }

  const newVersions = bumped.map((b) => `${b.name}@${b.version}`).join(',');
  const releaseLabel = bumped.map((b) => `${b.name}@${b.version}`).join('+');

  console.log(`NEW_VERSIONS=${newVersions}`);
  console.log(`RELEASE_LABEL=${releaseLabel}`);
}

main();

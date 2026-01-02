#!/usr/bin/env node

/**
 * SmartWrite Companion - Automated Release Script
 *
 * This script automates the GitHub release process:
 * 1. Checks for uncommitted changes
 * 2. Commits all changes
 * 3. Pushes to main branch
 * 4. Creates a GitHub release with proper changelog
 * 5. Tags the release
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function runCommand(command, description) {
  console.log(`🔄 ${description}...`);
  try {
    const result = execSync(command, { encoding: 'utf8', cwd: path.resolve(__dirname, '..') });
    console.log(`✅ ${description} completed`);
    return result;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    throw error;
  }
}

function getCurrentVersion() {
  const manifestPath = path.resolve(__dirname, '../manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  return manifest.version;
}

function getChangelogForVersion(version) {
  const changelogPath = path.resolve(__dirname, '../CHANGELOG.md');
  const changelog = fs.readFileSync(changelogPath, 'utf8');

  // Extract the section for the current version
  const versionRegex = new RegExp(`## \\[${version}\\][^]*?(?=## \\[|$)`, 's');
  const match = changelog.match(versionRegex);

  if (match) {
    return match[0].trim();
  }

  // Fallback: return a generic message
  return `## [${version}] - ${new Date().toISOString().split('T')[0]}

### Features
- Automated release process
- Improved development workflow`;
}

function main() {
  console.log('🚀 Starting SmartWrite Companion automated release...\n');

  try {
    // Check for uncommitted changes
    const status = runCommand('git status --porcelain', 'Checking for uncommitted changes');
    if (status.trim()) {
      console.log('📝 Found uncommitted changes, committing...');
      runCommand('git add .', 'Staging all changes');
      runCommand('git commit -m "Release preparation - automated commit"', 'Committing changes');
    } else {
      console.log('✨ No uncommitted changes found');
    }

    // Push to main
    runCommand('git push origin main', 'Pushing to main branch');

    // Get version and changelog
    const version = getCurrentVersion();
    const changelog = getChangelogForVersion(version);

    console.log(`📦 Creating release for version ${version}...`);

    // Delete existing release if it exists
    try {
      runCommand(`gh release delete v${version} --yes`, 'Deleting existing release (if any)');
    } catch (error) {
      console.log('ℹ️  No existing release to delete');
    }

    // Create new release
    const releaseCommand = `gh release create v${version} --title "SmartWrite Companion v${version}" --notes "${changelog.replace(/"/g, '\\"')}"`;
    runCommand(releaseCommand, 'Creating GitHub release');

    console.log(`\n🎉 Release v${version} created successfully!`);
    console.log(`🔗 https://github.com/zandercpzed/smartwrite-companion/releases/tag/v${version}`);

  } catch (error) {
    console.error('\n💥 Release failed:', error.message);
    process.exit(1);
  }
}

main();
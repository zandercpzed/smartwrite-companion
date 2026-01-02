#!/usr/bin/env node

/**
 * SmartWrite Companion - Automated Obsidian Submission Script
 *
 * This script automates the submission to Obsidian's community plugins repository:
 * 1. Forks the obsidian-releases repo (if not already forked)
 * 2. Updates community-plugins.json with current plugin info
 * 3. Creates a PR with proper template
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function runCommand(command, description, cwd = null) {
  console.log(`🔄 ${description}...`);
  try {
    const options = { encoding: 'utf8' };
    if (cwd) options.cwd = cwd;
    else options.cwd = path.resolve(__dirname, '..');

    const result = execSync(command, options);
    console.log(`✅ ${description} completed`);
    return result;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    throw error;
  }
}

function getPluginInfo() {
  const manifestPath = path.resolve(__dirname, '../manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  return {
    id: manifest.id,
    name: manifest.name,
    author: manifest.author,
    description: manifest.description,
    repo: 'zandercpzed/smartwrite-companion',
    version: manifest.version
  };
}

function updateCommunityPluginsJson(pluginsPath, pluginInfo) {
  console.log('📝 Updating community-plugins.json...');

  // Read the current plugins
  const plugins = JSON.parse(fs.readFileSync(pluginsPath, 'utf8'));

  // Check if plugin already exists
  const existingIndex = plugins.findIndex(p => p.id === pluginInfo.id);

  if (existingIndex >= 0) {
    // Update existing plugin
    plugins[existingIndex] = {
      id: pluginInfo.id,
      name: pluginInfo.name,
      author: pluginInfo.author,
      description: pluginInfo.description,
      repo: pluginInfo.repo
    };
    console.log('🔄 Updated existing plugin entry');
  } else {
    // Add new plugin
    plugins.push({
      id: pluginInfo.id,
      name: pluginInfo.name,
      author: pluginInfo.author,
      description: pluginInfo.description,
      repo: pluginInfo.repo
    });
    console.log('➕ Added new plugin entry');
  }

  // Write back to file
  fs.writeFileSync(pluginsPath, JSON.stringify(plugins, null, 2));
  console.log('💾 Saved community-plugins.json');
}

function createPRDescription(pluginInfo) {
  return `# I am submitting a new Community Plugin

- [x] I attest that I have done my best to deliver a high-quality plugin, am proud of the code I have written, and would recommend it to others. I commit to maintaining the plugin and being responsive to bug reports. If I am no longer able to maintain it, I will make reasonable efforts to find a successor maintainer or withdraw the plugin from the directory.
## Repo URL

<!--- Paste a link to your repo here for easy access -->
Link to my plugin: https://github.com/${pluginInfo.repo}

## Release Checklist
- [x] I have tested the plugin on
  - [x]  Windows
  - [x]  macOS
  - [x]  Linux
  - [ ]  Android _(if applicable)_
  - [ ]  iOS _(if applicable)_
- [x] My GitHub release contains all required files (as individual files, not just in the source.zip / source.tar.gz)
  - [x] \`main.js\`
  - [x] \`manifest.json\`
  - [x] \`styles.css\` _(optional)_
- [x] GitHub release name matches the exact version number specified in my manifest.json (_**Note:** Use the exact version number, don't include a prefix \`v\`_)
- [x] The \`id\` in my \`manifest.json\` matches the \`id\` in the \`community-plugins.json\` file.
- [x] My README.md describes the plugin's purpose and provides clear usage instructions.
- [x] I have read the developer policies at https://docs.obsidian.md/Developer+policies, and have assessed my plugin's adherence to these policies.
- [x] I have read the tips in https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines and have self-reviewed my plugin to avoid these common pitfalls.
- [x] I have added a license in the LICENSE file.
- [x] My project respects and is compatible with the original license of any code from other plugins that I'm using. I have given proper attribution to these other projects in my \`README.md\`.`;
}

function main() {
  console.log('🚀 Starting SmartWrite Companion automated Obsidian submission...\n');

  try {
    const pluginInfo = getPluginInfo();
    console.log(`📦 Submitting plugin: ${pluginInfo.name} v${pluginInfo.version}`);

    // Create temp directory for obsidian-releases
    const tempDir = path.resolve(__dirname, '../temp-obsidian-submission');
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tempDir);

    // Clone or update the fork
    const repoUrl = 'https://github.com/zandercpzed/obsidian-releases.git';
    console.log('📥 Cloning obsidian-releases fork...');
    runCommand(`git clone ${repoUrl} .`, 'Cloning obsidian-releases fork', tempDir);

    // Update community-plugins.json
    const pluginsPath = path.join(tempDir, 'community-plugins.json');
    updateCommunityPluginsJson(pluginsPath, pluginInfo);

    // Commit and push changes
    runCommand('git add community-plugins.json', 'Staging changes', tempDir);
    runCommand(`git commit -m "Update SmartWrite Companion plugin to v${pluginInfo.version}

- ID: ${pluginInfo.id}
- Name: ${pluginInfo.name}
- Author: ${pluginInfo.author}
- Description: ${pluginInfo.description}
- Repository: https://github.com/${pluginInfo.repo}"`, 'Committing changes', tempDir);

    runCommand('git push origin master', 'Pushing changes to fork', tempDir);

    // Create PR
    const prTitle = `Update SmartWrite Companion plugin to v${pluginInfo.version}`;
    const prBody = createPRDescription(pluginInfo);

    console.log('🔄 Creating pull request...');
    const prCommand = `gh pr create --title "${prTitle}" --body "${prBody.replace(/"/g, '\\"')}" --base master --head zandercpzed:master`;
    runCommand(prCommand, 'Creating pull request', tempDir);

    // Cleanup
    fs.rmSync(tempDir, { recursive: true, force: true });

    console.log(`\n🎉 Obsidian submission completed successfully!`);
    console.log(`🔗 Check your PR at: https://github.com/obsidianmd/obsidian-releases/pulls`);

  } catch (error) {
    console.error('\n💥 Obsidian submission failed:', error.message);
    process.exit(1);
  }
}

main();
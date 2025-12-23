import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

function runCommand(command) {
  console.log(`> ${command}`);
  try {
    execSync(command, { stdio: "inherit", cwd: projectRoot });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    process.exit(1);
  }
}

function updateVersion(filePath) {
  const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const versionParts = content.version.split(".").map(Number);
  versionParts[2] += 1;
  const newVersion = versionParts.join(".");
  content.version = newVersion;
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + "\n");
  return newVersion;
}

function createBackup(version) {
  const backupDir = path.join(projectRoot, "docs", "versions", version);
  const zipFile = path.join(projectRoot, "docs", "versions", `${version}.zip`);

  console.log(`Creating backup for version ${version}...`);

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // List of items to exclude from backup
  const excludeList = [
    "node_modules",
    ".git",
    "docs/versions",
    ".DS_Store",
    "dist", // Assuming dist is built artifacts we might not need source backup duplicate if we have source? Actuall user requested "copy of plugin", usually implies source code snapshot.
  ];

  // Using rsync for efficient copy with exclusions (macOS/Linux)
  const excludeParams = excludeList
    .map((item) => `--exclude '${item}'`)
    .join(" ");
  // Copy all files from projectRoot to backupDir
  runCommand(
    `rsync -av --progress ${excludeParams} "${projectRoot}/" "${backupDir}/"`
  );

  console.log(`Zipping backup...`);
  // Zip the backup directory
  // -r recursive, -j junk paths (dont want full path structure inside zip), actually we want relative structure.
  // simply zipping the folder content.
  // correct command: zip -r destination source
  runCommand(`zip -r "${zipFile}" "${backupDir}"`);

  console.log(`Backup created at ${zipFile}`);
}

async function main() {
  console.log("Starting Development Workflow...");

  // 1. Increment Version
  console.log("Incrementing version...");
  const packageJsonPath = path.join(projectRoot, "package.json");
  const manifestJsonPath = path.join(projectRoot, "manifest.json");

  const newVersion = updateVersion(packageJsonPath);
  updateVersion(manifestJsonPath); // Just to keep in sync, though we only need the version string from one

  // Ensure manifest version matches package.json exactly if logic diverted, but here they are same logic.
  // Double check manifest content
  const manifest = JSON.parse(fs.readFileSync(manifestJsonPath, "utf8"));
  manifest.version = newVersion;
  fs.writeFileSync(manifestJsonPath, JSON.stringify(manifest, null, 2) + "\n");

  console.log(`Version bumped to ${newVersion}`);

  // 2. Build Project
  console.log("Building project...");
  runCommand("npm run build");

  // 3. Sync with Vault (Rule 3)
  console.log('Syncing with Vault plugin folder...');
  const vaultPluginDir = path.join(projectRoot, '.obsidian', 'plugins', 'smartwrite-companion');

  // Ensure directory exists (it should, but safety first)
  if (!fs.existsSync(vaultPluginDir)) {
    fs.mkdirSync(vaultPluginDir, { recursive: true });
  }

  // Copy artifacts
  runCommand(`cp "${path.join(projectRoot, 'main.js')}" "${vaultPluginDir}/"`);
  runCommand(`cp "${path.join(projectRoot, 'manifest.json')}" "${vaultPluginDir}/"`);
  runCommand(`cp "${path.join(projectRoot, 'styles.css')}" "${vaultPluginDir}/"`);

  console.log('Vault updated.');

  // 4. Create Backup
  createBackup(newVersion);

  console.log("Workflow completed successfully!");
}

main().catch(console.error);

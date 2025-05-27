// scripts/version.ts
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

const manifestPath = './public/manifest.json';
const readmePath = './README.md';

async function incrementVersion() {
  try {
    // Read the manifest file
    const manifestContent = await fs.readFile(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);

    let currentVersion = manifest.version; // e.g., "0.0.2"
    console.log(`Current version: ${currentVersion}`);

    // Split the version string (assuming X.Y.Z format)
    const parts = currentVersion.split('.').map(Number);
    if (parts.length !== 3) {
      console.error('Invalid version format. Expected X.Y.Z');
      process.exit(1);
    }

    // Increment the patch version
    parts[2]++; // Increment the last part (patch)

    const newVersion = parts.join('.');
    console.log(`New version: ${newVersion}`);

    // Update the version in the manifest object
    manifest.version = newVersion;

    // Write the updated manifest back to the file
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    console.log(`Version updated in ${manifestPath} to ${newVersion}`);

    // Update the version badge in README.md
    await updateReadmeVersionBadge(newVersion);
    console.log(`Version badge updated in ${readmePath} to ${newVersion}`);
  } catch (error) {
    console.error('Error incrementing version:', error);
    process.exit(1);
  }
}

async function updateReadmeVersionBadge(newVersion: string) {
  try {
    // Read the README file
    const readmeContent = await fs.readFile(readmePath, 'utf8');
    
    // Replace the version badge using regex
    const versionBadgeRegex = /(\[!\[Version\]\(https:\/\/img\.shields\.io\/badge\/version-)[^-]+(-blue\.svg\)\])/;
    const updatedContent = readmeContent.replace(versionBadgeRegex, `$1${newVersion}$2`);
    
    // Write the updated README back to the file
    await fs.writeFile(readmePath, updatedContent, 'utf8');
  } catch (error) {
    console.error('Error updating README version badge:', error);
    throw error;
  }
}

incrementVersion();

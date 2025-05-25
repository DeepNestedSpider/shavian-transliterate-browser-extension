// scripts/version.ts
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

const manifestPath = './public/manifest.json';

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

  } catch (error) {
    console.error('Error incrementing version:', error);
    process.exit(1);
  }
}

incrementVersion();

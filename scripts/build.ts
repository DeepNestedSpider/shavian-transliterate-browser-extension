// scripts/build.ts
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

const distDir = './dist';
const publicDir = './public';
const srcDir = './src';

async function build() {
  try {
    // 1. Clean the dist directory
    console.log('Cleaning ./dist directory...');
    await fs.rm(distDir, { recursive: true, force: true });
    await fs.mkdir(distDir, { recursive: true });
    console.log('Dist directory cleaned.');

    // 2. Build TypeScript files with Bun
    console.log("Building popup.ts, content.ts into ./dist for target 'browser'...");
    await Bun.build({
      entrypoints: [path.join(srcDir, 'popup.ts'), path.join(srcDir, 'content.ts')],
      outdir: distDir,
      target: 'browser',
      // You might add more Bun.build options here if needed, e.g., for minification
    });
    console.log('TypeScript files built.');

    // 3. Copy public assets into dist
    console.log(`Copying forcefully all files from '${publicDir}/' into '${distDir}/'...`);
    const publicFiles = await fs.readdir(publicDir, { withFileTypes: true });
    for (const file of publicFiles) {
      if (file.isDirectory()) {
        // Recursively copy directories
        await fs.cp(path.join(publicDir, file.name), path.join(distDir, file.name), {
          recursive: true,
        });
      } else {
        await fs.copyFile(path.join(publicDir, file.name), path.join(distDir, file.name));
      }
    }
    console.log('Public assets copied.');

    // 4. Copy popup.html into dist
    console.log(`Copying '${srcDir}/popup.html' into '${distDir}'...`);
    await fs.copyFile(path.join(srcDir, 'popup.html'), path.join(distDir, 'popup.html'));
    console.log('popup.html copied.');

    console.log('Build process completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();

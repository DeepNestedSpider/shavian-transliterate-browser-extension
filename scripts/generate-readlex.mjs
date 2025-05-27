#!/usr/bin/env node
/**
 * Script to transform readlex.dict into readlex.ts
 * This script parses the dictionary format and generates a TypeScript export
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DICT_PATH = join(__dirname, '../src/dictionaries/readlex.dict');
const OUTPUT_PATH = join(__dirname, '../src/dictionaries/readlex.ts');

function parseDictFile(content) {
  const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('//'));
  const entries = {};

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Split on the first space to separate key from value
    const spaceIndex = trimmedLine.indexOf(' ');
    if (spaceIndex === -1) continue;

    let key = trimmedLine.substring(0, spaceIndex);
    const value = trimmedLine.substring(spaceIndex + 1).trim();

    // Skip special entries (prefixes and suffixes) for now
    if (key.startsWith('^') || key.startsWith('$')) {
      continue;
    }

    // Handle POS-tagged entries (e.g., "a_RB" -> "a")
    if (key.includes('_')) {
      key = key.split('_')[0];
    }

    // Clean up any remaining special characters
    key = key.trim();

    // Only add if we have a valid key and value
    if (key && value && !value.includes(':')) {
      // If key already exists, keep the first occurrence (or you could merge them)
      if (!entries[key]) {
        entries[key] = value;
      }
    }
  }

  return entries;
}

function generateTypeScriptFile(entries) {
  const header = `// Auto-generated from readlex.dict
// Do not edit manually - regenerate using scripts/generate-readlex.mjs

export const readlexDict: Record<string, string> = {`;

  const footer = `};
`;

  // Sort entries alphabetically for consistency
  const sortedKeys = Object.keys(entries).sort();

  const entriesText = sortedKeys
    .map(key => {
      const escapedKey = JSON.stringify(key);
      const escapedValue = JSON.stringify(entries[key]);
      return `  ${escapedKey}: ${escapedValue},`;
    })
    .join('\n');

  return header + '\n' + entriesText + '\n' + footer;
}

function main() {
  try {
    console.log('Reading dictionary file...');
    const content = readFileSync(DICT_PATH, 'utf-8');

    console.log('Parsing entries...');
    const entries = parseDictFile(content);

    console.log(`Found ${Object.keys(entries).length} dictionary entries`);

    console.log('Generating TypeScript file...');
    const tsContent = generateTypeScriptFile(entries);

    console.log('Writing output file...');
    writeFileSync(OUTPUT_PATH, tsContent, 'utf-8');

    console.log(`✅ Successfully generated ${OUTPUT_PATH}`);
    console.log(`📊 Contains ${Object.keys(entries).length} entries`);
  } catch (error) {
    console.error('❌ Error generating readlex.ts:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

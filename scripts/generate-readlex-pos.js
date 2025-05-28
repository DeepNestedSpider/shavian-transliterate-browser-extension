#!/usr/bin/env node
/**
 * Script to transform readlex.json into a POS-aware readlex.ts dictionary
 * This script parses the new JSON format and generates a TypeScript export
 * with support for POS-specific lookups
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DICT_PATH = join(__dirname, '../src/dictionaries/readlex.json');
const OUTPUT_PATH = join(__dirname, '../src/dictionaries/readlex.ts');

function parseReadlexJson(content) {
  console.log('Parsing readlex.json...');
  const data = JSON.parse(content);
  const entries = {
    basic: {},
    posSpecific: {},
    frequencies: {},
  };

  let totalEntries = 0;
  let posSpecificEntries = 0;

  for (const [key, variants] of Object.entries(data)) {
    if (!Array.isArray(variants) || variants.length === 0) continue;

    // Extract word and POS from key format: word_POS_shavian
    const keyParts = key.split('_');
    if (keyParts.length < 3) continue;

    const baseWord = keyParts[0].toLowerCase();

    // Process each variant in this key
    for (const variant of variants) {
      if (!variant.Shaw || !variant.Latn || !variant.pos) continue;

      const word = variant.Latn.toLowerCase();
      const pos = variant.pos;
      const cleanShavian = variant.Shaw.replace(/^[.:]+|[.:]+$/g, '');
      
      if (!cleanShavian) continue;

      totalEntries++;

      // Store POS-specific entry
      const posKey = `${word}_${pos}`;
      entries.posSpecific[posKey] = cleanShavian;
      entries.frequencies[posKey] = variant.freq;
      posSpecificEntries++;

      // For basic dictionary, use the highest frequency entry for each word
      if (
        !entries.basic[word] ||
        !entries.frequencies[`${word}_basic`] ||
        variant.freq > entries.frequencies[`${word}_basic`]
      ) {
        entries.basic[word] = cleanShavian;
        entries.frequencies[`${word}_basic`] = variant.freq;
      }
    }
  }

  console.log(`Processed ${totalEntries} total entries`);
  console.log(`Generated ${Object.keys(entries.basic).length} basic entries`);
  console.log(`Generated ${posSpecificEntries} POS-specific entries`);

  return entries;
}

function generateTypeScriptFile(entries) {
  const header = `// Auto-generated from readlex.json
// Do not edit manually - regenerate using scripts/generate-readlex-pos.js

export interface ReadlexDictionary {
  basic: Record<string, string>;
  posSpecific: Record<string, string>;
  getTransliteration(word: string, pos?: string): string | undefined;
  getAllVariants(word: string): Array<{ pos: string; transliteration: string; key: string }>;
}

class ReadlexDictionaryImpl implements ReadlexDictionary {
  public readonly basic: Record<string, string>;
  public readonly posSpecific: Record<string, string>;

  constructor(basic: Record<string, string>, posSpecific: Record<string, string>) {
    this.basic = basic;
    this.posSpecific = posSpecific;
  }

  getTransliteration(word: string, pos?: string): string | undefined {
    const cleanWord = word.toLowerCase();
    
    // First try POS-specific lookup if POS is provided
    if (pos) {
      const posKey = \`\${cleanWord}_\${pos}\`;
      if (this.posSpecific[posKey]) {
        return this.posSpecific[posKey];
      }
    }
    
    // Fallback to basic lookup
    return this.basic[cleanWord];
  }

  getAllVariants(word: string): Array<{ pos: string; transliteration: string; key: string }> {
    const cleanWord = word.toLowerCase();
    const variants = [];
    
    // Find all POS-specific variants for this word
    for (const [key, transliteration] of Object.entries(this.posSpecific)) {
      if (key.startsWith(cleanWord + '_')) {
        const pos = key.substring(cleanWord.length + 1);
        variants.push({ pos, transliteration, key });
      }
    }
    
    return variants;
  }
}

`;

  // Sort entries alphabetically for consistency
  const sortedBasicKeys = Object.keys(entries.basic).sort();
  const sortedPosKeys = Object.keys(entries.posSpecific).sort();

  const basicEntriesText = sortedBasicKeys
    .map(key => {
      const escapedKey = JSON.stringify(key);
      const escapedValue = JSON.stringify(entries.basic[key]);
      return `  ${escapedKey}: ${escapedValue},`;
    })
    .join('\n');

  const posEntriesText = sortedPosKeys
    .map(key => {
      const escapedKey = JSON.stringify(key);
      const escapedValue = JSON.stringify(entries.posSpecific[key]);
      return `  ${escapedKey}: ${escapedValue},`;
    })
    .join('\n');

  const footer = `
const basicEntries: Record<string, string> = {
${basicEntriesText}
};

const posSpecificEntries: Record<string, string> = {
${posEntriesText}
};

export const readlexDict = new ReadlexDictionaryImpl(basicEntries, posSpecificEntries);

// Legacy export for backward compatibility
export const readlexDictLegacy: Record<string, string> = basicEntries;
`;

  return header + footer;
}

function main() {
  try {
    console.log('Starting dictionary generation...');
    console.log('Reading readlex.json...');
    const content = readFileSync(DICT_PATH, 'utf-8');
    console.log(`File size: ${content.length} characters`);

    console.log('Parsing entries...');
    const entries = parseReadlexJson(content);

    console.log('Generating TypeScript file...');
    const tsContent = generateTypeScriptFile(entries);
    console.log(`Generated ${tsContent.length} characters of TypeScript`);

    console.log('Writing output file...');
    writeFileSync(OUTPUT_PATH, tsContent, 'utf-8');

    console.log(`✅ Successfully generated ${OUTPUT_PATH}`);
    console.log(`📊 Contains ${Object.keys(entries.basic).length} basic entries`);
    console.log(`📊 Contains ${Object.keys(entries.posSpecific).length} POS-specific entries`);
  } catch (error) {
    console.error('❌ Error generating dictionary:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

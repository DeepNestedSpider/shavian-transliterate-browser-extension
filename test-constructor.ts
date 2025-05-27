// Test script to debug readlexicon constructor issue
console.log('Testing ReadlexiconTransliterator constructor...');

import { ReadlexiconEngine } from './src/core/transliterationEngine.ts';

console.log('Step 1: Create engine...');
const engine = new ReadlexiconEngine();
console.log('✓ Engine created');

console.log('Step 2: Test loadDictionary logic...');
try {
  const { readlexDict } = await import('./src/dictionaries/readlex.ts');
  console.log('✓ Dictionary imported, size:', Object.keys(readlexDict).length);
  
  for (const [key, value] of Object.entries(readlexDict)) {
    engine.addToDictionary(key, value);
    // Only add first few entries for testing
    if (Object.keys(engine.dictionary || {}).length > 10) break;
  }
  console.log('✓ Dictionary loaded, engine size:', engine.getDictionarySize());
} catch (error) {
  console.error('✗ Error loading dictionary:', error);
}

export {};

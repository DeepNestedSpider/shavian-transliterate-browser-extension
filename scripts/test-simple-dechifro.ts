#!/usr/bin/env bun
/**
 * Test script for Simple Dechifro Transliterator
 */

import { SimpleDechifroTransliterator } from '../src/simpleDechifroTransliterator.js';

async function testSimpleDechifro() {
  console.log('🧪 Testing Simple Dechifro Transliterator...\n');

  try {
    const transliterator = new SimpleDechifroTransliterator();
    
    // Test individual words
    console.log('📝 Testing individual words:');
    const testWords = ['hello', 'world', 'test', 'the', 'and', 'Hello', 'World', 'unknown'];
    
    for (const word of testWords) {
      const result = transliterator.transliterateWord(word);
      console.log(`  "${word}" → "${result}"`);
    }
    
    console.log('\n📄 Testing full sentences:');
    const testSentences = [
      'Hello world, this is a test.',
      'The quick brown fox jumps over the lazy dog.',
      'Hello and welcome to the test page.',
      'I have a test for you to see if this works.'
    ];
    
    for (const sentence of testSentences) {
      const result = transliterator.transliterate(sentence);
      console.log(`\nOriginal: "${sentence}"`);
      console.log(`Result:   "${result}"`);
    }
    
    console.log('\n✅ Simple Dechifro Transliterator test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testSimpleDechifro();

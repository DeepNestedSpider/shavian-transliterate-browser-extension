#!/usr/bin/env bun
/**
 * Test script for DechifroTransliterator
 */

import { DechifroTransliterator } from '../src/dechifroTransliterator';

async function testDechifroEngine() {
  try {
    console.log('🧪 Testing Dechifro Transliteration Engine...\n');

    // Test with American dictionary
    console.log('📦 Creating DechifroTransliterator instance...');
    const dechifro = new DechifroTransliterator({ dictionary: 'amer' });
    console.log('✅ Instance created successfully!');

    // Test cases
    const testCases = [
      'Hello world',
      'The quick brown fox jumps over the lazy dog',
      'JavaScript is awesome',
      'I love programming',
      'Shavian alphabet rocks!',
      "Don't forget to test contractions",
      'Testing 123 numbers and units like 5 ms',
      'Proper names like John and Mary should be dotted'
    ];

    console.log('\n📚 Using American dictionary:');
    await dechifro.ready(); // Wait for initialization
    for (const test of testCases) {
      try {
        const result = await dechifro.transliterate(test);
        console.log(`"${test}" → "${result}"`);
      } catch (error) {
        console.error(`Error transliterating "${test}":`, error);
      }
    }

    console.log('\n📚 Testing British dictionary:');
    const dechifroUK = new DechifroTransliterator({ dictionary: 'brit' });
    await dechifroUK.ready(); // Wait for initialization
    
    // Test a few cases with British dictionary
    const ukTests = ['colour', 'centre', 'realise'];
    for (const test of ukTests) {
      try {
        const result = await dechifroUK.transliterate(test);
        console.log(`"${test}" → "${result}"`);
      } catch (error) {
        console.error(`Error transliterating "${test}":`, error);
      }
    }

    console.log('\n✅ Dechifro engine test completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

testDechifroEngine().catch(console.error);

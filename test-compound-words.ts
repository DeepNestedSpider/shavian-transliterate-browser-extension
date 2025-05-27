import { ReadlexiconEngine } from './src/core/transliterationEngine';

async function testCompoundWords() {
  console.log('Testing compound word transliteration...');
  
  // Create a simple engine with basic function words
  const engine = new ReadlexiconEngine();
  
  // Test hyphenated words
  console.log('\n=== Testing hyphenated words ===');
  const hyphenatedTests = [
    'year-and-a-day',
    'state-of-the-art',
    'mother-in-law',
    'twenty-one',
    'well-known'
  ];
  
  for (const test of hyphenatedTests) {
    const result = engine.transliterate(test);
    console.log(`"${test}" -> "${result}"`);
  }
  
  // Test ellipses
  console.log('\n=== Testing ellipses ===');
  const ellipsesTests = [
    'the…mad',
    'hello…world',
    'and…then'
  ];
  
  for (const test of ellipsesTests) {
    const result = engine.transliterate(test);
    console.log(`"${test}" -> "${result}"`);
  }
  
  // Test reverse transliteration
  console.log('\n=== Testing reverse transliteration ===');
  const reverseTests = [
    '𐑘𐑽-𐑯-𐑩-𐑛𐑱',
    '𐑞…𐑥𐑨𐑛'
  ];
  
  for (const test of reverseTests) {
    const result = engine.reverseTransliterate(test);
    console.log(`"${test}" -> "${result}"`);
  }
  
  // Test round-trip
  console.log('\n=== Testing round-trip ===');
  const roundTripTests = ['year-and-a-day', 'the…mad'];
  
  for (const test of roundTripTests) {
    const shavian = engine.transliterate(test);
    const backToEnglish = engine.reverseTransliterate(shavian);
    console.log(`"${test}" -> "${shavian}" -> "${backToEnglish}"`);
  }
}

testCompoundWords().catch(console.error);

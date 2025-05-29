// Simple test using TypeScript compilation
import { EnglishToIPAEngine } from './src/transliterators/english/englishToIPA';
import { EnglishToShavianEngine } from './src/transliterators/english/englishToShavian';

async function testAvoidance() {
  console.log('Testing transliteration avoidance...\n');

  const ipaEngine = new EnglishToIPAEngine();
  const shavianEngine = new EnglishToShavianEngine();

  // Test cases
  const testCases = [
    // Regular English words (should be transliterated)
    'hello',
    'world',
    'test',
    
    // Already formatted IPA (should NOT be transliterated)
    'hello[/həˈloʊ/|/ˈhɛloʊ/]',
    '/həˈloʊ/',
    'word with ˈstress marks',
    
    // Shavian script (should NOT be transliterated)
    '𐑣𐑧𐑤𐑴',  // "hello" in Shavian
    '𐑢𐑻𐑤𐑛',  // "world" in Shavian
    'Mixed text with 𐑖𐑱𐑝𐑾𐑯 script',
    
    // Mixed content
    'Regular text /aɪˈpiˈeɪ/ and 𐑖𐑱𐑝𐑾𐑯 mixed'
  ];

  console.log('=== IPA Engine Test ===');
  for (const testCase of testCases) {
    const result = ipaEngine.transliterateWord(testCase);
    const wasChanged = result !== testCase;
    console.log(`Input:  "${testCase}"`);
    console.log(`Output: "${result}"`);
    console.log(`Changed: ${wasChanged ? 'YES' : 'NO'}`);
    console.log('---');
  }

  console.log('\n=== Shavian Engine Test ===');
  for (const testCase of testCases) {
    const result = shavianEngine.transliterateWord(testCase);
    const wasChanged = result !== testCase;
    console.log(`Input:  "${testCase}"`);
    console.log(`Output: "${result}"`);
    console.log(`Changed: ${wasChanged ? 'YES' : 'NO'}`);
    console.log('---');
  }

  console.log('\nTest completed!');
}

testAvoidance().catch(console.error);

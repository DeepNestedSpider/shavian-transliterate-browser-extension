// Debug script to test em-dash transliteration behavior
import { ReadlexiconEngine } from './src/core/transliterationEngine.ts';

const engine = new ReadlexiconEngine();

// Test the exact cases that are failing
console.log('=== EM-DASH DEBUG TEST ===');

const testCases = [
  'alphabet reform—James Pitman MP',
  'Shaw Society—urged',
  'James',
  'urged',
];

for (const testCase of testCases) {
  console.log(`\nInput: "${testCase}"`);
  const result = engine.transliterate(testCase);
  console.log(`Output: "${result}"`);
}

// Test word internal directly
console.log('\n=== TESTING transliterateWordInternal DIRECTLY ===');
const directTests = ['James', 'urged', 'Pitman'];
for (const word of directTests) {
  console.log(`\nDirect test: "${word}"`);
  const result = engine.transliterateWordInternal(word, 0);
  console.log(`Result: "${result}"`);
}

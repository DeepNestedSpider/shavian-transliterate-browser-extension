// Simple pattern test for detection logic
console.log('Starting pattern detection test...');

function isAlreadyTransliterated(word) {
  console.log(`Testing word: "${word}"`);
  
  // Check for Shavian script first (Unicode range: U+10450–U+1047F)
  const shavianRegex = /[\u{10450}-\u{1047F}]/u;
  if (shavianRegex.test(word)) {
    console.log('  - Detected as Shavian script');
    return true;
  }
  
  // Check for formatted IPA: word[/pronunciation1/|/pronunciation2/]
  if (/\w+\[\/[^\/]+\/(\|\/[^\/]+\/)*\]/.test(word)) {
    console.log('  - Detected as formatted IPA');
    return true;
  }
  
  // Check for simple IPA notation: /pronunciation/
  if (/^\/[^\/]+\/$/.test(word.trim())) {
    console.log('  - Detected as simple IPA notation');
    return true;
  }
  
  // Check for IPA phonetic characters (common IPA symbols)
  const ipaChars = /[ˈˌːˑəɚɛɪɒɔʊʌʃʒθðŋɑæɜɝɨɵɞɤɯɞʏʎɢʁχʕʔˤʷʲˠˀˈˌ]/;
  if (ipaChars.test(word)) {
    console.log('  - Detected as having IPA characters');
    return true;
  }
  
  console.log('  - Not detected as already transliterated');
  return false;
}

// Test cases
const testCases = [
  // Regular English words (should NOT be detected as already transliterated)
  { input: 'hello', expected: false },
  { input: 'world', expected: false },
  { input: 'test', expected: false },
  
  // Already formatted IPA (should be detected)
  { input: 'hello[/həˈloʊ/|/ˈhɛloʊ/]', expected: true },
  { input: '/həˈloʊ/', expected: true },
  { input: 'word with ˈstress marks', expected: true },
  { input: 'əɚɛɪɒɔʊʌ', expected: true },
  
  // Shavian script (should be detected)
  { input: '𐑣𐑧𐑤𐑴', expected: true },  // "hello" in Shavian
  { input: '𐑢𐑻𐑤𐑛', expected: true },  // "world" in Shavian
  { input: 'Mixed text with 𐑖𐑱𐑝𐑾𐑯 script', expected: true },
  
  // Edge cases
  { input: '', expected: false },
  { input: 'normal123', expected: false },
  { input: 'punctuation!@#', expected: false }
];

console.log('Pattern Detection Test Results:');
console.log('=================================');

let passed = 0;
let failed = 0;

for (const testCase of testCases) {
  const result = isAlreadyTransliterated(testCase.input);
  const success = result === testCase.expected;
  
  console.log(`Input: "${testCase.input}"`);
  console.log(`Expected: ${testCase.expected}, Got: ${result}`);
  console.log(`Result: ${success ? 'PASS' : 'FAIL'}`);
  console.log('---');
  
  if (success) {
    passed++;
  } else {
    failed++;
  }
}

console.log(`\nSummary: ${passed} passed, ${failed} failed`);
console.log('Test completed!');

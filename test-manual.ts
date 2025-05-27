/**
 * Manual test to verify reverse transliteration functionality
 */

// Manual import test
console.log('Testing reverse transliteration...');

// Simple test data - manually defined
const testData = new Map([
  ['hello', '𐑣𐑧𐑤𐑴'],
  ['world', '𐑢𐑻𐑤𐑛'],
  ['test', '𐑑𐑧𐑕𐑑']
]);

// Create a reverse dictionary 
const reverseDict = new Map();
for (const [english, shavian] of testData) {
  reverseDict.set(shavian, english);
}

// Test reverse lookup
function testReverseLookup(shavianWord: string): string {
  return reverseDict.get(shavianWord) || shavianWord;
}

// Test cases
const testCases = [
  '𐑣𐑧𐑤𐑴',       // hello
  '𐑢𐑻𐑤𐑛',       // world  
  '𐑣𐑧𐑤𐑴 𐑢𐑻𐑤𐑛', // hello world
  'unknown',      // should remain unchanged
];

console.log('Test Results:');
testCases.forEach(testCase => {
  const words = testCase.split(' ');
  const result = words.map(word => testReverseLookup(word)).join(' ');
  console.log(`"${testCase}" → "${result}"`);
});

export {};

// Simple debug script to check reverse transliteration issues
const fs = require('fs');
const path = require('path');

// Import the test reference files
const testsDir = path.join(__dirname, 'tests', 'reference');
const shavianText = fs.readFileSync(path.join(testsDir, 'shavian.txt'), 'utf-8').trim();
const expectedLatinText = fs.readFileSync(path.join(testsDir, 'latin.txt'), 'utf-8').trim();

// Extract all unique Shavian characters
const shavianChars = new Set();
for (const char of shavianText) {
  if (char >= '\u{10450}' && char <= '\u{1047F}') {
    shavianChars.add(char);
  }
}

console.log('Unique Shavian characters found:', Array.from(shavianChars).sort());
console.log('Total unique Shavian characters:', shavianChars.size);

// Find words with untranslated Shavian characters
const words = shavianText.split(/\s+/);
const wordsWithShavian = words.filter(word => 
  /[\u{10450}-\u{1047F}]/u.test(word)
);

console.log('\nFirst 20 words with Shavian characters:');
console.log(wordsWithShavian.slice(0, 20));

console.log('\nSample problematic patterns:');
// Look for specific patterns we know are problematic
const problemPatterns = [
  '𐑘𐑻', // year
  '𐑒𐑪𐑯𐑑𐑧𐑯𐑑', // content  
  '𐑖𐑷𐑟', // shaw's
  '𐑪𐑓𐑩𐑯', // often
  '𐑷𐑤𐑢𐑱𐑟', // always
  '𐑨𐑥𐑩𐑑𐑼', // amateur
  '𐑐𐑨𐑑𐑩𐑯𐑑𐑰𐑟' // patentees
];

problemPatterns.forEach(pattern => {
  if (shavianText.includes(pattern)) {
    console.log(`Found: ${pattern}`);
  }
});

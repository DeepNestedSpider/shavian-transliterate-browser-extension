// Test script to verify IPA formatting works correctly
const { getIPAPronunciation } = require('./src/dictionaries/ipa.ts');

// Test words with multiple pronunciations
const testWords = ['a', 'ab', 'abbe', 'abkhazian'];

console.log('Testing IPA pronunciation formatting:\n');

testWords.forEach(word => {
  console.log(`Word: "${word}"`);
  console.log(`  All: ${getIPAPronunciation(word, 'all')}`);
  console.log(`  Primary: ${getIPAPronunciation(word, 'primary')}`);
  console.log(`  Formatted: ${getIPAPronunciation(word, 'formatted')}`);
  console.log('');
});

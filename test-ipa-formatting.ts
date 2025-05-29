import { getIPAPronunciation } from './src/dictionaries/ipa';
import { englishToIPA } from './src/transliterators/english/englishToIPA';

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

console.log('\nTesting with EnglishToIPA transliterator:');
console.log('Input: "a ab abbe"');
const result = englishToIPA.transliterateText('a ab abbe');
console.log(`Output: ${result.transliterated}`);
console.log(`Confidence: ${result.confidence}`);

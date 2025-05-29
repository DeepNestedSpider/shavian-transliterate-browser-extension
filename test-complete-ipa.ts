import { getIPAPronunciation } from './src/dictionaries/ipa';
import { englishToIPA } from './src/transliterators/english/englishToIPA';

console.log('Testing mixed sentence with single and multiple pronunciations:\n');

// Test with words that have single pronunciations
const singlePronWords = ['hello', 'world', 'test'];
singlePronWords.forEach(word => {
  console.log(`"${word}": ${getIPAPronunciation(word, 'formatted')}`);
});

console.log('\nTesting complete sentence:');
const testSentence = "Hello, a word with multiple pronunciations like ab.";
const result = englishToIPA.transliterateText(testSentence);
console.log(`Input: "${testSentence}"`);
console.log(`Output: "${result.transliterated}"`);
console.log(`Confidence: ${result.confidence}`);

console.log('\nTesting the different format options:');
const word = 'ab';
console.log(`Word: "${word}"`);
console.log(`- 'all' format: ${getIPAPronunciation(word, 'all')}`);
console.log(`- 'primary' format: ${getIPAPronunciation(word, 'primary')}`);
console.log(`- 'formatted' format: ${getIPAPronunciation(word, 'formatted')}`);

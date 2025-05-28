import { ReadlexiconEngine } from './src/core/transliterationEngine';
import { processPunctuatedWord } from './src/core/punctuationHandler';

const testDictionary = new Map([
  ['do', '𐑛𐑵'],
  ['don', '𐑛𐑪𐑯'],
  ['n', '𐑯'],
  ['t', '𐑑'],
  ['can', '𐑒𐑨𐑯'],
  ['it', '𐑦𐑑'],
  ['s', '𐑕'],
]);

const engine = new ReadlexiconEngine(testDictionary);

console.log('\n=== Testing Contractions ===');

// Test processPunctuatedWord directly
const testWords = ["don't", "can't", "it's"];

testWords.forEach(word => {
  console.log(`\n--- Testing "${word}" ---`);
  const result = processPunctuatedWord(word);
  console.log('processPunctuatedWord result:', result);
  
  const transliterated = engine.transliterateWord(word);
  console.log('Final transliteration:', transliterated);
});

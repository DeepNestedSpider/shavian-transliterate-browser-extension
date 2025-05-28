import { readlexDict } from './src/dictionaries/readlex';
import { TransliterationEngine } from './src/core/transliterationEngine';

const testWords = ['children', 'women', 'men', 'teeth', 'feet', 'geese', 'mice', 'people', 'sheep', 'fish'];

console.log('=== Dictionary lookup for irregular plurals ===');
testWords.forEach(word => {
  const result = readlexDict[word];
  console.log(`${word}: ${result || 'NOT FOUND'}`);
});

console.log('\n=== Standard Engine transliteration ===');
const standardEngine = new TransliterationEngine();
testWords.forEach(word => {
  const result = standardEngine.transliterateWord(word);
  console.log(`${word}: "${result}"`);
});

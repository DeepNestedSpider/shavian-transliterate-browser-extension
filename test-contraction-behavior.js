import { ReadlexiconEngine } from '../src/core/transliterationEngine';

// Create a simple test to verify the new contraction behavior
const testDictionary = new Map([
  ['do', '𐑛𐑵'],
  ['don', '𐑛𐑪𐑯'],
  ['can', '𐑒𐑨𐑯'],
  ['it', '𐑦𐑑'],
]);

const engine = new ReadlexiconEngine(testDictionary);

console.log('=== Testing New Contraction Behavior ===');
console.log("don't →", engine.transliterateWord("don't"));
console.log("can't →", engine.transliterateWord("can't"));
console.log("it's →", engine.transliterateWord("it's"));

console.log('\n=== For comparison, old behavior would have been ===');
console.log("don't → punctuation{don't}");
console.log("can't → punctuation{can't}");
console.log("it's → punctuation{it's}");

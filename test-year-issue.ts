import { ReadlexiconEngine } from './src/core/transliterationEngine';
import { readlexDict } from './src/dictionaries/readlex';

console.log('Testing year mapping issue...');

try {
  const engine = new ReadlexiconEngine(readlexDict);
  
  console.log('Testing problematic mappings:');
  console.log('𐑘𐑻 ->', engine.reverseTransliterateWord('𐑘𐑻'));
  console.log('𐑘𐑽 ->', engine.reverseTransliterateWord('𐑘𐑽'));
  console.log('year forward ->', engine.transliterateWord('year'));
  
  // Test some other problematic words from the conversation summary
  console.log('\nOther problematic words:');
  console.log('·𐑜. 𐑒. 𐑗𐑧𐑕𐑑𐑼𐑑𐑩𐑯 ->', engine.reverseTransliterateWord('·𐑜. 𐑒. 𐑗𐑧𐑕𐑑𐑼𐑑𐑩𐑯'));
  console.log('Bernard shaw sentence test:');
  console.log('From 𐑖𐑷 to 𐑖𐑱𐑝𐑦𐑩𐑯 ->', engine.reverseTransliterate('From 𐑖𐑷 to 𐑖𐑱𐑝𐑦𐑩𐑯'));
  console.log('From ·𐑖𐑷 to ·𐑖𐑱𐑝𐑦𐑩𐑯 ->', engine.reverseTransliterate('From ·𐑖𐑷 to ·𐑖𐑱𐑝𐑦𐑩𐑯'));
  
} catch (error) {
  console.error('Error:', error);
}

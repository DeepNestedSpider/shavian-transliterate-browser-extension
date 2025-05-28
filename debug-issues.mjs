import { createEngine } from './dist/core/index.js';
import fs from 'fs';

async function debugIssues() {
  console.log('=== DEBUGGING TRANSLITERATION ISSUES ===');
  
  // Load the dictionary
  const dictionaryPath = './src/dictionaries/readlex.json';
  const dictionaryData = JSON.parse(fs.readFileSync(dictionaryPath, 'utf8'));
  
  // Create engine
  const engine = createEngine('readlexicon', dictionaryData);
  
  console.log('\n1. DEBUGGING HYPHEN ISSUE: "year-and-a-day"');
  console.log('Expected: "𐑘𐑽-𐑯-𐑩-𐑛𐑱"');
  
  const hyphenInput = "year-and-a-day";
  const hyphenResult = engine.transliterate(hyphenInput);
  console.log(`Input: "${hyphenInput}"`);
  console.log(`Actual: "${hyphenResult}"`);
  
  // Debug each part separately
  const parts = hyphenInput.split('-');
  console.log('\nParts analysis:');
  parts.forEach((part, index) => {
    const partResult = engine.transliterateWord(part);
    console.log(`Part ${index}: "${part}" -> "${partResult}"`);
  });

  console.log('\n2. DEBUGGING MULTI-WORD PROPER NAME: "Bernard Shaw"');
  console.log('Expected: "·𐑚𐑻𐑯𐑼𐑛 𐑖𐑷"');
  
  const multiWordInput = "Bernard Shaw";
  const multiWordResult = engine.transliterate(multiWordInput);
  console.log(`Input: "${multiWordInput}"`);
  console.log(`Actual: "${multiWordResult}"`);

  // Debug each word separately
  const words = multiWordInput.split(' ');
  console.log('\nWords analysis:');
  words.forEach((word, index) => {
    const wordResult = engine.transliterateWord(word);
    console.log(`Word ${index}: "${word}" -> "${wordResult}"`);
  });

  console.log('\n3. DEBUGGING INITIALS: "G K Chesterton"');
  console.log('Expected: "·𐑜. 𐑒. 𐑗𐑧𐑕𐑑𐑼𐑑𐑩𐑯"');
  
  const initialsInput = "G K Chesterton";
  const initialsResult = engine.transliterate(initialsInput);
  console.log(`Input: "${initialsInput}"`);
  console.log(`Actual: "${initialsResult}"`);

  // Debug each word separately
  const initialWords = initialsInput.split(' ');
  console.log('\nInitials analysis:');
  initialWords.forEach((word, index) => {
    const wordResult = engine.transliterateWord(word);
    console.log(`Word ${index}: "${word}" -> "${wordResult}"`);
  });

  console.log('\n4. DEBUGGING DOCTOR WHO SPECIAL FORMATTING');
  console.log('Expected: "‹·𐑛𐑪𐑒𐑑𐑼 𐑣𐑵›"');
  
  const doctorWhoInput = "Doctor Who";
  const doctorWhoResult = engine.transliterate(doctorWhoInput);
  console.log(`Input: "${doctorWhoInput}"`);
  console.log(`Actual: "${doctorWhoResult}"`);

  console.log('\n5. DEBUGGING QUOTE HANDLING');
  console.log('Expected: "𐑖𐑱𐑝𐑾𐑯" (quotes removed)');
  
  const quoteInput = '"Shavian"';
  const quoteResult = engine.transliterate(quoteInput);
  console.log(`Input: "${quoteInput}"`);
  console.log(`Actual: "${quoteResult}"`);
}

debugIssues().catch(console.error);

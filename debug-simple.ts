#!/usr/bin/env bun

import { ReadlexiconEngine } from "./src/core/transliterationEngine.ts";
import { readlexDict } from "./src/dictionaries/readlex.ts";

function debugIssues() {
  console.log('=== DEBUGGING TRANSLITERATION ISSUES ===');
  
  // Create engine
  const engine = new ReadlexiconEngine(readlexDict);
  
  console.log('\n1. DEBUGGING HYPHEN ISSUE: "year-and-a-day"');
  console.log('Expected: "𐑘𐑽-𐑯-𐑩-𐑛𐑱"');
  
  const hyphenInput = "year-and-a-day";
  const hyphenResult = engine.transliterate(hyphenInput);
  console.log(`Input: "${hyphenInput}"`);
  console.log(`Actual: "${hyphenResult}"`);
  console.log(`Length expected: 15, got: ${hyphenResult.length}`);
  
  // Debug each part separately
  const parts = hyphenInput.split('-');
  console.log('\nParts analysis:');
  parts.forEach((part, index) => {
    const partResult = engine.transliterateWord(part);
    console.log(`Part ${index}: "${part}" -> "${partResult}" (length: ${partResult.length})`);
  });

  console.log('\n2. DEBUGGING MULTI-WORD PROPER NAME: "Bernard Shaw"');
  console.log('Expected: "·𐑚𐑻𐑯𐑼𐑛 𐑖𐑷"');
  
  const multiWordInput = "Bernard Shaw";
  const multiWordResult = engine.transliterate(multiWordInput);
  console.log(`Input: "${multiWordInput}"`);
  console.log(`Actual: "${multiWordResult}"`);
  console.log(`Length expected: 16, got: ${multiWordResult.length}`);

  // Debug each word separately
  const words = multiWordInput.split(' ');
  console.log('\nWords analysis:');
  words.forEach((word, index) => {
    const wordResult = engine.transliterateWord(word);
    console.log(`Word ${index}: "${word}" -> "${wordResult}" (length: ${wordResult.length})`);
  });

  console.log('\n3. DEBUGGING INITIALS: "G K Chesterton"');
  console.log('Expected: "·𐑜. 𐑒. 𐑗𐑧𐑕𐑑𐑼𐑑𐑩𐑯"');
  
  const initialsInput = "G K Chesterton";
  const initialsResult = engine.transliterate(initialsInput);
  console.log(`Input: "${initialsInput}"`);
  console.log(`Actual: "${initialsResult}"`);
  console.log(`Length expected: 25, got: ${initialsResult.length}`);

  // Debug each word separately
  const initialWords = initialsInput.split(' ');
  console.log('\nInitials analysis:');
  initialWords.forEach((word, index) => {
    const wordResult = engine.transliterateWord(word);
    console.log(`Word ${index}: "${word}" -> "${wordResult}" (length: ${wordResult.length})`);
  });

  console.log('\n4. DEBUGGING DOCTOR WHO SPECIAL FORMATTING');
  console.log('Expected: "‹·𐑛𐑪𐑒𐑑𐑼 𐑣𐑵›"');
  
  const doctorWhoInput = "Doctor Who";
  const doctorWhoResult = engine.transliterate(doctorWhoInput);
  console.log(`Input: "${doctorWhoInput}"`);
  console.log(`Actual: "${doctorWhoResult}"`);
  console.log(`Length expected: 18, got: ${doctorWhoResult.length}`);

  console.log('\n5. DEBUGGING QUOTE HANDLING');
  console.log('Expected: "𐑖𐑱𐑝𐑾𐑯" (quotes removed)');
  
  const quoteInput = '"Shavian"';
  const quoteResult = engine.transliterate(quoteInput);
  console.log(`Input: "${quoteInput}"`);
  console.log(`Actual: "${quoteResult}"`);
  console.log(`Quotes should be removed, got: ${quoteResult}`);
}

debugIssues();

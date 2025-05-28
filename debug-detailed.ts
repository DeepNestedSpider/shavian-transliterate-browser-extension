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
  console.log('Input:', hyphenInput);
  console.log('Actual:', hyphenResult);
  console.log('Length expected: 15, got:', hyphenResult.length);
  
  // Show character codes for debugging
  console.log('Expected char codes:', Array.from("𐑘𐑽-𐑯-𐑩-𐑛𐑱").map(c => c.charCodeAt(0)));
  console.log('Actual char codes:', Array.from(hyphenResult).map(c => c.charCodeAt(0)));
  
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
  console.log('Input:', multiWordInput);
  console.log('Actual:', multiWordResult);
  console.log('Length expected: 16, got:', multiWordResult.length);

  // Debug each word separately
  const words = multiWordInput.split(' ');
  console.log('\nWords analysis:');
  words.forEach((word, index) => {
    const wordResult = engine.transliterateWord(word);
    console.log(`Word ${index}: "${word}" -> "${wordResult}" (length: ${wordResult.length})`);
  });
}

try {
  debugIssues();
} catch (error) {
  console.error('Error:', error);
}

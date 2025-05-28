import { describe, it, expect, beforeEach } from 'bun:test';
import { ReadlexiconEngine } from '../src/core/transliterationEngine';
import { readlexDict } from '../src/dictionaries/readlex';

describe('Em-dash Fix Debug', () => {
  let engine: ReadlexiconEngine;

  beforeEach(() => {
    engine = new ReadlexiconEngine(readlexDict);
  });

  it('should debug the space detection logic', () => {
    console.log('\n=== DEBUGGING SPACE DETECTION ===');
    
    const testInputs = [
      '—James',
      '—James Shaw',
      'James—Shaw',
      'James—Shaw urged'
    ];
    
    testInputs.forEach(input => {
      console.log(`\nTesting: "${input}"`);
      console.log(`  Contains em-dash: ${input.includes('—')}`);
      
      if (input.includes('—')) {
        const parts = input.split('—');
        console.log(`  Split parts: ${JSON.stringify(parts)}`);
        
        parts.forEach((part, index) => {
          console.log(`    Part ${index}: "${part}"`);
          console.log(`      Trim empty: ${part.trim() === ''}`);
          console.log(`      Has space: ${part.includes(' ')}`);
        });
      }
      
      const result = engine.transliterateWord(input);
      console.log(`  Result: "${result}"`);
    });
  });

  it('should test our fix manually', () => {
    console.log('\n=== MANUAL FIX TEST ===');
    
    const testWord = '—James Shaw';
    console.log(`Testing: "${testWord}"`);
    
    // Simulate the logic from our fix
    if (testWord.includes('—')) {
      const parts = testWord.split('—');
      console.log(`Parts: ${JSON.stringify(parts)}`);
      
      parts.forEach((part, index) => {
        console.log(`\nPart ${index}: "${part}"`);
        if (part.trim() === '') {
          console.log('  -> Empty part, skipping');
        } else {
          const hasSpace = part.includes(' ');
          console.log(`  -> Has space: ${hasSpace}`);
          
          if (hasSpace) {
            console.log('  -> Would call this.transliterate()');
            const transliterationResult = engine.transliterate(part);
            console.log(`  -> Transliterate result: "${transliterationResult}"`);
          } else {
            console.log('  -> Would call this.transliterateWordInternal()');
            // We can't call this directly as it's protected, but we can use transliterateWord on single words
            const singleWordResult = engine.transliterateWord(part);
            console.log(`  -> Single word result: "${singleWordResult}"`);
          }
        }
      });
    }
  });
});

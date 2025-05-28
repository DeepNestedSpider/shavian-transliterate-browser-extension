import { describe, it, expect } from 'bun:test';
import { processPunctuatedWord } from '../src/core/punctuationHandler';

describe('Punctuation Handler Em-dash Debug', () => {
  it('should debug how punctuation handler processes em-dashes', () => {
    console.log('\n=== PUNCTUATION HANDLER EM-DASH DEBUG ===');
    
    const testInputs = [
      '—James',
      '—James Shaw',
      'James—Shaw',
      'James—Shaw urged'
    ];
    
    testInputs.forEach(input => {
      console.log(`\nTesting: "${input}"`);
      const result = processPunctuatedWord(input);
      console.log(`  hasNonAlphabetic: ${result.hasNonAlphabetic}`);
      console.log(`  cleanWord: "${result.cleanWord}"`);
      console.log(`  leadingPunctuation: "${result.leadingPunctuation}"`);
      console.log(`  trailingPunctuation: "${result.trailingPunctuation}"`);
      console.log(`  processedWord: "${result.processedWord}"`);
    });
  });
});

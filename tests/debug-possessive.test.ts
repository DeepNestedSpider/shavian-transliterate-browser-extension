/**
 * Debug test for possessive form handling
 */
import { describe, test, expect } from 'bun:test';
import { processPunctuatedWord, handlePossessives, separatePunctuation } from '../src/core/punctuationHandler';

describe('Debug Possessive Handling', () => {
  test('debug separatePunctuation with Shaw\'s', () => {
    const result = separatePunctuation("Shaw's");
    console.log('separatePunctuation result:', result);
    expect(result.cleanWord).toBe("Shaw"); // Correctly separates the base word
    expect(result.trailingPunctuation).toBe("'s"); // Correctly identifies possessive
  });

  test('debug handlePossessives step by step', () => {
    const step1 = separatePunctuation("Shaw's");
    console.log('Step 1 - separatePunctuation:', step1);
    
    const step2 = handlePossessives(step1.cleanWord);
    console.log('Step 2 - handlePossessives:', step2);
    
    const step3 = processPunctuatedWord("Shaw's");
    console.log('Step 3 - processPunctuatedWord:', step3);
  });
});

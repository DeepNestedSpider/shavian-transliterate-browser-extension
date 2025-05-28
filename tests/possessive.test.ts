/**
 * Test for possessive form handling
 */
import { describe, test, expect } from 'bun:test';
import { processPunctuatedWord, handlePossessives } from '../src/core/punctuationHandler';

describe('Possessive Handling', () => {
  test('handlePossessives should detect possessive forms', () => {
    const result1 = handlePossessives("Shaw's");
    expect(result1.baseWord).toBe('Shaw');
    expect(result1.possessivePart).toBe('𐑟');

    const result2 = handlePossessives("John's");
    expect(result2.baseWord).toBe('John');
    expect(result2.possessivePart).toBe('𐑟');

    const result3 = handlePossessives("children's");
    expect(result3.baseWord).toBe('children');
    expect(result3.possessivePart).toBe('𐑟');
  });

  test('handlePossessives should not detect non-possessive forms', () => {
    const result1 = handlePossessives("it's");
    expect(result1.baseWord).toBe("it's");
    expect(result1.possessivePart).toBe('');

    const result2 = handlePossessives("don't");
    expect(result2.baseWord).toBe("don't");
    expect(result2.possessivePart).toBe('');

    const result3 = handlePossessives("Shaw");
    expect(result3.baseWord).toBe('Shaw');
    expect(result3.possessivePart).toBe('');
  });

  test('processPunctuatedWord should handle possessives correctly', () => {
    const result1 = processPunctuatedWord("Shaw's");
    expect(result1.hasNonAlphabetic).toBe(true);
    expect(result1.cleanWord).toBe('Shaw');
    expect(result1.trailingPunctuation).toBe('𐑟');

    const result2 = processPunctuatedWord("John's");
    expect(result2.hasNonAlphabetic).toBe(true);
    expect(result2.cleanWord).toBe('John');
    expect(result2.trailingPunctuation).toBe('𐑟');

    const result3 = processPunctuatedWord("\"Shaw's\"");
    expect(result3.hasNonAlphabetic).toBe(true);
    expect(result3.cleanWord).toBe('Shaw');
    expect(result3.leadingPunctuation).toBe('"');
    expect(result3.trailingPunctuation).toBe('𐑟"');
  });

  test('processPunctuatedWord should still handle contractions', () => {
    const result1 = processPunctuatedWord("don't");
    expect(result1.hasNonAlphabetic).toBe(true);
    expect(result1.cleanWord).toBe('don');
    expect(result1.trailingPunctuation).toBe("'t");

    const result2 = processPunctuatedWord("it's");
    expect(result2.hasNonAlphabetic).toBe(true);
    expect(result2.cleanWord).toBe('it');
    expect(result2.trailingPunctuation).toBe("'s");
  });

  test('possessives should take precedence over contractions', () => {
    // Test case where a word could be interpreted as either possessive or contraction
    // In this implementation, possessives take precedence
    const result = processPunctuatedWord("Shaw's");
    expect(result.cleanWord).toBe('Shaw');
    expect(result.trailingPunctuation).toBe('𐑟');
  });
});

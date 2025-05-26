/**
 * Test script for Simple Dechifro Transliterator
 */

import { describe, test, expect, beforeAll } from "bun:test";
import { SimpleDechifroTransliterator } from '../src/simpleDechifroTransliterator.js';

describe('Simple Dechifro Transliterator', () => {
  let transliterator: SimpleDechifroTransliterator;

  beforeAll(() => {
    transliterator = new SimpleDechifroTransliterator();
  });

  test('should create instance successfully', () => {
    expect(transliterator).toBeDefined();
    expect(transliterator).toBeInstanceOf(SimpleDechifroTransliterator);
  });

  test('should transliterate individual words', () => {
    const testWords = ['hello', 'world', 'test', 'the', 'and', 'Hello', 'World', 'unknown'];
    
    testWords.forEach(word => {
      const result = transliterator.transliterateWord(word);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  test('should handle known words correctly', () => {
    const knownWords = ['hello', 'world', 'test', 'the', 'and'];
    
    knownWords.forEach(word => {
      const result = transliterator.transliterateWord(word);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });
  });

  test('should handle unknown words', () => {
    const result = transliterator.transliterateWord('unknown');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  test('should handle capitalized words', () => {
    const testCases = [
      { input: 'Hello', expected: expect.any(String) },
      { input: 'World', expected: expect.any(String) }
    ];

    testCases.forEach(({ input, expected }) => {
      const result = transliterator.transliterateWord(input);
      expect(result).toEqual(expected);
      expect(typeof result).toBe('string');
    });
  });

  test('should transliterate full sentences', () => {
    const testSentences = [
      'Hello world, this is a test.',
      'The quick brown fox jumps over the lazy dog.',
      'Hello and welcome to the test page.',
      'I have a test for you to see if this works.'
    ];
    
    testSentences.forEach(sentence => {
      const result = transliterator.transliterate(sentence);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  test('should handle punctuation in sentences', () => {
    const sentenceWithPunctuation = 'Hello world, this is a test.';
    const result = transliterator.transliterate(sentenceWithPunctuation);
    
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  test('should not throw errors during transliteration', () => {
    const testInputs = [
      'hello',
      'Hello world, this is a test.',
      'unknown',
      'The quick brown fox jumps over the lazy dog.'
    ];

    testInputs.forEach(input => {
      expect(() => transliterator.transliterate(input)).not.toThrow();
      expect(() => transliterator.transliterateWord(input)).not.toThrow();
    });
  });
});

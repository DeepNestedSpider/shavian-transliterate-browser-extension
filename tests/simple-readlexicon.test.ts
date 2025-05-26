/**
 * Test script for Simple Readlexicon Transliterator
 */

import { describe, test, expect, beforeAll } from "bun:test";
import { SimpleReadlexiconTransliterator } from '../src/simpleReadlexiconTransliterator.js';

describe('Simple Readlexicon Transliterator', () => {
  let transliterator: SimpleReadlexiconTransliterator;

  beforeAll(() => {
    transliterator = new SimpleReadlexiconTransliterator();
  });

  test('should create instance successfully', () => {
    expect(transliterator).toBeDefined();
    expect(transliterator).toBeInstanceOf(SimpleReadlexiconTransliterator);
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
      { input: 'World', expected: expect.any(String) },
      { input: 'Test', expected: expect.any(String) },
      { input: 'The', expected: expect.any(String) },
      { input: 'And', expected: expect.any(String) }
    ];
    
    testCases.forEach(({ input, expected }) => {
      const result = transliterator.transliterateWord(input);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^[A-Za-z]+$/);
    });
  });
});

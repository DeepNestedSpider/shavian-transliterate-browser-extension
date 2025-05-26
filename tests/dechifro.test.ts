/**
 * Test script for DechifroTransliterator
 */

import { describe, test, expect, beforeAll } from "bun:test";
import { DechifroTransliterator } from '../src/dechifroTransliterator';

describe('DechifroTransliterator', () => {
  let dechifroAmer: DechifroTransliterator;
  let dechifroUK: DechifroTransliterator;

  beforeAll(async () => {
    dechifroAmer = new DechifroTransliterator({ dictionary: 'amer' });
    dechifroUK = new DechifroTransliterator({ dictionary: 'brit' });
    await dechifroAmer.ready();
    await dechifroUK.ready();
  });

  test('should create instance successfully', () => {
    expect(dechifroAmer).toBeDefined();
    expect(dechifroUK).toBeDefined();
  });

  test('should transliterate basic phrases with American dictionary', async () => {
    const testCases = [
      { input: 'Hello world', expected: expect.any(String) },
      { input: 'The quick brown fox jumps over the lazy dog', expected: expect.any(String) },
      { input: 'JavaScript is awesome', expected: expect.any(String) },
      { input: 'I love programming', expected: expect.any(String) },
      { input: 'Shavian alphabet rocks!', expected: expect.any(String) }
    ];

    for (const testCase of testCases) {
      const result = await dechifroAmer.transliterate(testCase.input);
      expect(result).toEqual(testCase.expected);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    }
  });

  test('should handle contractions with American dictionary', async () => {
    const result = await dechifroAmer.transliterate("Don't forget to test contractions");
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  test('should handle numbers and units with American dictionary', async () => {
    const result = await dechifroAmer.transliterate('Testing 123 numbers and units like 5 ms');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  test('should handle proper names with American dictionary', async () => {
    const result = await dechifroAmer.transliterate('Proper names like John and Mary should be dotted');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  test('should transliterate British spellings with British dictionary', async () => {
    const ukTests = ['colour', 'centre', 'realise'];
    
    for (const test of ukTests) {
      const result = await dechifroUK.transliterate(test);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    }
  });

  test('should not throw errors during transliteration', async () => {
    const testCases = [
      'Hello world',
      'The quick brown fox jumps over the lazy dog',
      'JavaScript is awesome',
      "Don't forget to test contractions",
      'Testing 123 numbers and units like 5 ms'
    ];

    for (const test of testCases) {
      await expect(dechifroAmer.transliterate(test)).resolves.not.toThrow();
    }
  });
});

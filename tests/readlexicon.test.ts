/**
 * Test script for ReadlexiconTransliterator
 */

import { describe, test, expect, beforeAll } from "bun:test";
import { ReadlexiconTransliterator } from '../src/readlexiconTransliterator';

describe('ReadlexiconTransliterator', () => {
  let readlexiconAmer: ReadlexiconTransliterator;
  let readlexiconUK: ReadlexiconTransliterator;

  beforeAll(async () => {
    readlexiconAmer = new ReadlexiconTransliterator({ dictionary: 'amer' });
    readlexiconUK = new ReadlexiconTransliterator({ dictionary: 'brit' });
    await readlexiconAmer.ready();
    await readlexiconUK.ready();
  });

  test('should create instance successfully', () => {
    expect(readlexiconAmer).toBeDefined();
    expect(readlexiconUK).toBeDefined();
  });

  test('should transliterate basic phrases with American dictionary', async () => {
    const testCases = [
      'Hello world',
      'The quick brown fox jumps over the lazy dog',
      'JavaScript is awesome',
      'I love programming',
      'Shavian alphabet rocks!'
    ];

    for (const input of testCases) {
      const result = await readlexiconAmer.transliterate(input);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    }
  });

  test('should handle contractions with American dictionary', async () => {
    const result = await readlexiconAmer.transliterate("Don't forget to test contractions");
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  test('should handle numbers and units with American dictionary', async () => {
    const result = await readlexiconAmer.transliterate('Testing 123 numbers and units like 5 ms');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  test('should transliterate basic phrases with British dictionary', async () => {
    const testCases = [
      'Hello world',
      'The quick brown fox jumps over the lazy dog',
      'JavaScript is awesome',
      'I love programming',
      'Shavian alphabet rocks!'
    ];

    for (const input of testCases) {
      const result = await readlexiconUK.transliterate(input);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    }
  });

  test('should handle contractions with British dictionary', async () => {
    const result = await readlexiconUK.transliterate("Don't forget to test contractions");
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  test('should handle numbers and units with British dictionary', async () => {
    const result = await readlexiconUK.transliterate('Testing 123 numbers and units like 5 ms');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

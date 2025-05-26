/**
 * Test script for the new DechifroEngine
 */

import { describe, test, expect, beforeAll } from "bun:test";
import { TransliterationEngineFactory } from '../src/core/transliterationEngine';

describe('New DechifroEngine', () => {
  let engine: any;

  beforeAll(async () => {
    engine = await TransliterationEngineFactory.createEngine('dechifro');
  });

  test('should create engine instance successfully', () => {
    expect(engine).toBeDefined();
  });

  test('should have a dictionary with entries', () => {
    const dictionarySize = engine.getDictionarySize();
    expect(dictionarySize).toBeGreaterThan(0);
    expect(typeof dictionarySize).toBe('number');
  });

  test('should transliterate basic phrases', () => {
    const testCases = [
      'Hello world',
      'The quick brown fox jumps over the lazy dog', 
      'JavaScript is awesome',
      'I love programming',
      'Shavian alphabet rocks!'
    ];

    testCases.forEach(testCase => {
      const result = engine.transliterate(testCase);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  test('should handle contractions', () => {
    const result = engine.transliterate("can't won't don't");
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  test('should handle numbers and units', () => {
    const result = engine.transliterate('Testing 123 numbers and units like 5 ms');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  test('should handle proper names', () => {
    const result = engine.transliterate('Proper names like John and Mary should be dotted');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  test('should handle function words', () => {
    const result = engine.transliterate('and or but');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  test('should handle befto logic', () => {
    const testCases = [
      'I have to go',
      'used to be'
    ];

    testCases.forEach(testCase => {
      const result = engine.transliterate(testCase);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });
  });

  test('should not throw errors during transliteration', () => {
    const testCases = [
      'Hello world',
      'The quick brown fox jumps over the lazy dog', 
      'JavaScript is awesome',
      "Don't forget to test contractions",
      'Testing 123 numbers and units like 5 ms',
      'I have to go',
      'used to be'
    ];

    testCases.forEach(testCase => {
      expect(() => engine.transliterate(testCase)).not.toThrow();
    });
  });
});

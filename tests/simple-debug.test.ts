/**
 * Simple test for DechifroEngine
 */

import { describe, test, expect, beforeAll } from "bun:test";
import { TransliterationEngineFactory } from '../src/core/transliterationEngine';

describe('Simple DechifroEngine Debug', () => {
  let engine: any;

  beforeAll(async () => {
    engine = await TransliterationEngineFactory.createEngine('dechifro');
  });

  test('should import TransliterationEngineFactory successfully', async () => {
    expect(TransliterationEngineFactory).toBeDefined();
  });

  test('should create dechifro engine successfully', () => {
    expect(engine).toBeDefined();
  });

  test('should transliterate "Hello world"', () => {
    const result = engine.transliterate('Hello world');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  test('should transliterate function word "and"', () => {
    const result = engine.transliterateWord('and');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  test('should handle various inputs without errors', () => {
    const testInputs = [
      'Hello world',
      'and',
      'test',
      'JavaScript'
    ];

    testInputs.forEach(input => {
      expect(() => engine.transliterate(input)).not.toThrow();
      expect(() => engine.transliterateWord(input)).not.toThrow();
    });
  });
});

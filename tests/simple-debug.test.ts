/**
 * Simple test for DechifroEngine
 */

import { describe, test, expect } from "bun:test";

describe('Simple DechifroEngine Debug', () => {
  test('should import TransliterationEngineFactory successfully', async () => {
    const { TransliterationEngineFactory } = await import('../src/core/transliterationEngine');
    expect(TransliterationEngineFactory).toBeDefined();
    expect(typeof TransliterationEngineFactory.createEngine).toBe('function');
  });

  test('should create dechifro engine successfully', async () => {
    const { TransliterationEngineFactory } = await import('../src/core/transliterationEngine');
    const engine = await TransliterationEngineFactory.createEngine('dechifro');
    expect(engine).toBeDefined();
  });

  test('should transliterate "Hello world"', async () => {
    const { TransliterationEngineFactory } = await import('../src/core/transliterationEngine');
    const engine = await TransliterationEngineFactory.createEngine('dechifro');
    const result = engine.transliterate('Hello world');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  test('should transliterate function word "and"', async () => {
    const { TransliterationEngineFactory } = await import('../src/core/transliterationEngine');
    const engine = await TransliterationEngineFactory.createEngine('dechifro');
    const result = engine.transliterateWord('and');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  test('should handle various inputs without errors', async () => {
    const { TransliterationEngineFactory } = await import('../src/core/transliterationEngine');
    const engine = await TransliterationEngineFactory.createEngine('dechifro');
    
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

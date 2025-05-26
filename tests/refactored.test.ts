/**
 * Test script for our refactored architecture
 */

import { describe, test, expect, beforeAll } from "bun:test";
import { TransliterationEngineFactory } from '../src/core/transliterationEngine';

describe('Refactored Architecture', () => {
  let readlexiconEngine: any;

  beforeAll(async () => {
    readlexiconEngine = await TransliterationEngineFactory.createEngine('readlexicon');
  });

  test('should import TransliterationEngineFactory successfully', async () => {
    expect(TransliterationEngineFactory).toBeDefined();
    expect(typeof TransliterationEngineFactory.createEngine).toBe('function');
  });

  test('should create Readlexicon engine successfully', () => {
    expect(readlexiconEngine).toBeDefined();
  });

  test('should transliterate text with Readlexicon engine', () => {
    const testText = 'Hello world';
    const result = readlexiconEngine.transliterate(testText);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  test('should handle different inputs with Readlexicon engine', () => {
    const testInputs = [
      'Hello world',
      'JavaScript is awesome',
      'Testing transliteration'
    ];

    testInputs.forEach(input => {
      const readlexiconResult = readlexiconEngine.transliterate(input);
      
      expect(readlexiconResult).toBeTruthy();
      expect(typeof readlexiconResult).toBe('string');
    });
  });

  test('should not throw errors during operation', () => {
    const testText = 'Hello world';
    
    expect(() => readlexiconEngine.transliterate(testText)).not.toThrow();
  });
});

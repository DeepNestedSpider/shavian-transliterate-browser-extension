/**
 * Test script for our refactored architecture
 */

import { describe, test, expect, beforeAll } from "bun:test";
import { TransliterationEngineFactory } from '../src/core/transliterationEngine';

describe('Refactored Architecture', () => {
  let toShavianEngine: any;
  let readlexiconEngine: any;

  beforeAll(async () => {
    toShavianEngine = await TransliterationEngineFactory.createEngine('to-shavian');
    readlexiconEngine = await TransliterationEngineFactory.createEngine('readlexicon');
  });

  test('should import TransliterationEngineFactory successfully', async () => {
    expect(TransliterationEngineFactory).toBeDefined();
    expect(typeof TransliterationEngineFactory.createEngine).toBe('function');
  });

  test('should create ToShavian engine successfully', () => {
    expect(toShavianEngine).toBeDefined();
  });

  test('should transliterate text with ToShavian engine', () => {
    const testText = 'Hello world';
    const result = toShavianEngine.transliterate(testText);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  test('should transliterate individual words with ToShavian engine', () => {
    const testWord = 'hello';
    const result = toShavianEngine.transliterateWord(testWord);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
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

  test('should handle different inputs across both engines', () => {
    const testInputs = [
      'Hello world',
      'JavaScript is awesome',
      'Testing transliteration'
    ];

    testInputs.forEach(input => {
      const toShavianResult = toShavianEngine.transliterate(input);
      const readlexiconResult = readlexiconEngine.transliterate(input);
      
      expect(toShavianResult).toBeTruthy();
      expect(readlexiconResult).toBeTruthy();
      expect(typeof toShavianResult).toBe('string');
      expect(typeof readlexiconResult).toBe('string');
    });
  });

  test('should not throw errors during operation', () => {
    const testText = 'Hello world';
    
    expect(() => toShavianEngine.transliterate(testText)).not.toThrow();
    expect(() => toShavianEngine.transliterateWord('hello')).not.toThrow();
    expect(() => readlexiconEngine.transliterate(testText)).not.toThrow();
  });
});

/**
 * Basic test to verify reverse transliteration functionality
 */
import { describe, it, expect, beforeAll } from 'bun:test';

// Import directly from the engine to test reverse functionality
import { ReadlexiconEngine } from '../src/core/transliterationEngine';

describe('Basic Reverse Transliteration', () => {
  let engine: ReadlexiconEngine;

  beforeAll(async () => {
    engine = new ReadlexiconEngine();
    
    // Add some basic test data
    engine.addToDictionary('hello', '𐑣𐑧𐑤𐑴');
    engine.addToDictionary('world', '𐑢𐑻𐑤𐑛');
    engine.addToDictionary('test', '𐑑𐑧𐑕𐑑');
  });

  it('should reverse transliterate single Shavian words back to English', async () => {
    const result = engine.reverseTransliterateWord('𐑣𐑧𐑤𐑴');
    expect(result).toBe('hello');
  });

  it('should reverse transliterate Shavian text back to English', async () => {
    const shavianText = '𐑣𐑧𐑤𐑴 𐑢𐑻𐑤𐑛';
    const result = engine.reverseTransliterate(shavianText);
    expect(result).toBe('hello world');
  });

  it('should handle mixed text with some untranslatable words', async () => {
    const shavianText = '𐑣𐑧𐑤𐑴 xyz 𐑢𐑻𐑤𐑛';
    const result = engine.reverseTransliterate(shavianText);
    expect(result).toBe('hello xyz world');
  });
});

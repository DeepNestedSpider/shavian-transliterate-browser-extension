/**
 * Test for English to IPA transliteration engine
 */

import { describe, test, expect } from 'bun:test';
import { EnglishToIPAEngine } from '../src/transliterators/english/englishToIPA';

describe('English to IPA transliteration', () => {
  test('should transliterate individual words correctly', () => {
    const engine = new EnglishToIPAEngine();

    // Test individual word transliteration
    const helloIPA = engine.transliterateWord('hello');
    expect(helloIPA).toMatch(/həˈɫoʊ|hɛˈɫoʊ/); // Should contain one of the IPA pronunciations
    
    const worldIPA = engine.transliterateWord('world');
    expect(worldIPA).toBe('/ˈwɝɫd/');

    const testIPA = engine.transliterateWord('test');
    expect(testIPA).toBe('/ˈtɛst/');
  });

  test('should transliterate phrases correctly', () => {
    const engine = new EnglishToIPAEngine();
    
    const result = engine.transliterateText('Hello world test');
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.originalWords.length).toBe(3);
    expect(result.transliteratedWords.length).toBe(3);
  });

  test('should handle unknown words by returning original', () => {
    const engine = new EnglishToIPAEngine();
    
    const unknownWord = engine.transliterateWord('xyzabc123');
    expect(unknownWord).toBe('xyzabc123'); // Should return original word
  });

  test('should provide correct engine information', () => {
    const engine = new EnglishToIPAEngine();
    
    const info = engine.getInfo();
    expect(info.name).toBe('English to IPA');
    expect(info.inputScript).toBe('Latin (English)');
    expect(info.outputScript).toBe('IPA (International Phonetic Alphabet)');
    expect(info.bidirectional).toBe(false);
  });

  test('should implement required interface methods', () => {
    const engine = new EnglishToIPAEngine();
    
    // Test main transliterate method
    const result = engine.transliterate('Hello world');
    expect(typeof result).toBe('string');
    
    // Test reverse methods (should return original)
    expect(engine.reverseTransliterate('test')).toBe('test');
    expect(engine.reverseTransliterateWord('word')).toBe('word');
  });
});

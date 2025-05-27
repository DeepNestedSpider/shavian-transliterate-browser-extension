/**
 * Test reverse transliteration functionality
 */
import { describe, it, expect, beforeAll } from 'bun:test';
import { ReadlexiconTransliterator } from '../src/readlexiconTransliterator';

describe('Reverse Transliteration Tests', () => {
  let transliterator: ReadlexiconTransliterator;

  beforeAll(async () => {
    transliterator = new ReadlexiconTransliterator();
    await transliterator.ready();
  });

  it('should reverse transliterate simple Shavian words back to English', async () => {
    // Test some basic words
    expect(await transliterator.reverseTransliterateWord('𐑩')).toBe('a');
    expect(await transliterator.reverseTransliterateWord('𐑞')).toBe('the');
    expect(await transliterator.reverseTransliterateWord('𐑯')).toBe('and');
    expect(await transliterator.reverseTransliterateWord('𐑝')).toBe('of');
    expect(await transliterator.reverseTransliterateWord('𐑑')).toBe('to');
  });

  it('should reverse transliterate simple sentences', async () => {
    // Test a simple sentence
    const shavianText = '𐑞 𐑒𐑨𐑑 𐑦𐑟 𐑪𐑯 𐑞 𐑥𐑨𐑑';
    const result = await transliterator.reverseTransliterate(shavianText);
    
    // The result should contain recognizable English words
    expect(result).toContain('the');
    expect(result).toContain('cat');
    expect(result).toContain('on');
    expect(result).toContain('mat');
  });

  it('should handle round-trip transliteration', async () => {
    const originalText = 'hello world';
    
    // Transliterate to Shavian
    const shavianText = await transliterator.transliterate(originalText);
    console.log(`Original: ${originalText}`);
    console.log(`Shavian: ${shavianText}`);
    
    // Reverse transliterate back to English
    const reversedText = await transliterator.reverseTransliterate(shavianText);
    console.log(`Reversed: ${reversedText}`);
    
    // Should contain the original words (may not be exact due to phonetic differences)
    expect(reversedText.toLowerCase()).toContain('hello');
    expect(reversedText.toLowerCase()).toContain('world');
  });

  it('should handle mixed content (Shavian and punctuation)', async () => {
    const mixedText = '𐑞 𐑒𐑨𐑑, 𐑦𐑟 𐑪𐑯 𐑞 𐑥𐑨𐑑!';
    const result = await transliterator.reverseTransliterate(mixedText);
    
    // Should preserve punctuation
    expect(result).toContain(',');
    expect(result).toContain('!');
    
    // Should contain English words
    expect(result).toContain('the');
    expect(result).toContain('cat');
  });

  it('should return unknown Shavian characters unchanged', async () => {
    // Test with unknown/made-up Shavian sequences
    const unknownShavian = '𐑿𐑜𐑺𐑰𐑳';
    const result = await transliterator.reverseTransliterateWord(unknownShavian);
    
    // Should return the original if not found in dictionary
    expect(result).toBe(unknownShavian);
  });
});

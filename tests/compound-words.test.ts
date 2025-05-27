/**
 * Tests for compound word transliteration (hyphens and ellipses)
 */

import { describe, test, expect } from "bun:test";
import { ReadlexiconEngine } from '../src/core/transliterationEngine';

describe('Compound Word Transliteration', () => {
  let engine: ReadlexiconEngine;

  // Setup engine before each test
  beforeEach(() => {
    engine = new ReadlexiconEngine();
  });

  describe('Hyphenated Words', () => {
    test('should transliterate simple hyphenated words', () => {
      const result = engine.transliterate('year-and-a-day');
      expect(result).toBe('𐑘𐑽-𐑯-𐑩-𐑛𐑱');
    });

    test('should transliterate compound function words', () => {
      const result = engine.transliterate('in-the-know');
      expect(result).toBe('𐑦𐑯-𐑞-know');
    });

    test('should handle multiple hyphens', () => {
      const result = engine.transliterate('well-to-do');
      expect(result).toBe('well-𐑑-𐑛');
    });

    test('should preserve standalone hyphens', () => {
      const result = engine.transliterate('hello - world');
      expect(result).toBe('hello - world');
    });
  });

  describe('Ellipses', () => {
    test('should transliterate words with ellipses', () => {
      const result = engine.transliterate('the…mad');
      expect(result).toBe('𐑞…mad');
    });

    test('should handle ellipses at different positions', () => {
      const result1 = engine.transliterate('hello…world');
      const result2 = engine.transliterate('and…then');
      
      expect(result1).toBe('hello…world');
      expect(result2).toBe('𐑯…then');
    });

    test('should handle multiple ellipses', () => {
      const result = engine.transliterate('the…big…world');
      expect(result).toBe('𐑞…big…world');
    });
  });

  describe('Reverse Transliteration', () => {
    test('should reverse transliterate hyphenated words', () => {
      const result = engine.reverseTransliterate('𐑘𐑽-𐑯-𐑩-𐑛𐑱');
      expect(result).toBe('year-and-a-day');
    });

    test('should reverse transliterate words with ellipses', () => {
      const result = engine.reverseTransliterate('𐑞…mad');
      expect(result).toBe('the…mad');
    });

    test('should preserve standalone hyphens in reverse', () => {
      const result = engine.reverseTransliterate('hello - world');
      expect(result).toBe('hello - world');
    });
  });

  describe('Round-trip Tests', () => {
    test('should maintain consistency in round-trip transliteration', () => {
      const original = 'year-and-a-day';
      const shavian = engine.transliterate(original);
      const backToEnglish = engine.reverseTransliterate(shavian);
      
      expect(backToEnglish).toBe(original);
    });

    test('should maintain consistency with ellipses in round-trip', () => {
      const original = 'the…mad';
      const shavian = engine.transliterate(original);
      const backToEnglish = engine.reverseTransliterate(shavian);
      
      expect(backToEnglish).toBe(original);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty parts in compounds', () => {
      const result1 = engine.transliterate('hello--world');
      const result2 = engine.transliterate('the……mad');
      
      expect(result1).toBe('hello--world');
      expect(result2).toBe('𐑞……mad');
    });

    test('should handle mixed punctuation', () => {
      const result = engine.transliterate('well-known, state-of-the-art');
      expect(result).toBe('well-known, state-𐑝-𐑞-art');
    });

    test('should not break on only punctuation', () => {
      const result1 = engine.transliterate('---');
      const result2 = engine.transliterate('…');
      
      expect(result1).toBe('---');
      expect(result2).toBe('…');
    });
  });
});

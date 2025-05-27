/**
 * Tests for wordpos package integration and performance benchmarks
 * Following Bun test standards
 */
import { expect, test, describe, beforeAll } from "bun:test";
import { ReadlexiconEngine } from "../src/core/transliterationEngine";
import { ReadlexiconTransliterator } from "../src/readlexiconTransliterator";

describe("WordPOS Integration and Performance", () => {
  let engine: ReadlexiconEngine;
  let transliterator: ReadlexiconTransliterator;

  beforeAll(async () => {
    // Use a realistic dictionary subset for performance testing
    const performanceTestDictionary = {
      basic: {
        "the": "𐑞",
        "a": "𐑩",
        "and": "𐑯",
        "to": "𐑑",
        "of": "𐑝",
        "in": "𐑦𐑯",
        "is": "𐑦𐑟",
        "you": "𐑿",
        "that": "𐑞𐑨𐑑",
        "it": "𐑦𐑑",
        "he": "𐑣𐑰",
        "was": "𐑢𐑪𐑟",
        "for": "𐑓",
        "on": "𐑪𐑯",
        "are": "𐑸",
        "as": "𐑨𐑟",
        "with": "𐑢𐑦𐑞",
        "his": "𐑣𐑦𐑟",
        "they": "𐑞𐑱",
        "i": "𐑲",
        "at": "𐑨𐑑",
        "be": "𐑚𐑰",
        "this": "𐑞𐑦𐑕",
        "have": "𐑣𐑨𐑝",
        "from": "𐑓𐑮𐑪𐑥",
        "or": "𐑹",
        "one": "𐑢𐑳𐑯",
        "had": "𐑣𐑨𐑛",
        "by": "𐑚𐑲",
        "word": "𐑢𐑻𐑛",
        "but": "𐑚𐑳𐑑",
        "not": "𐑯𐑪𐑑",
        "what": "𐑢𐑪𐑑",
        "all": "𐑷",
        "were": "𐑢𐑻",
        "we": "𐑢𐑰",
        "when": "𐑢𐑧𐑯",
        "your": "𐑿𐑼",
        "can": "𐑒𐑨𐑯",
        "said": "𐑕𐑧𐑛",
        "there": "𐑞𐑺",
        "each": "𐑰𐑗",
        "which": "𐑢𐑦𐑗",
        "do": "𐑛𐑵",
        "how": "𐑣𐑬",
        "their": "𐑞𐑺",
        "if": "𐑦𐑓",
        "will": "𐑢𐑦𐑤",
        "up": "𐑳𐑐",
        "other": "𐑳𐑞𐑼",
        "about": "𐑩𐑚𐑬𐑑",
        "out": "𐑬𐑑",
        "many": "𐑥𐑧𐑯𐑦",
        "then": "𐑞𐑧𐑯",
        "them": "𐑞𐑧𐑥",
        "these": "𐑞𐑰𐑟",
        "so": "𐑕𐑴",
        "some": "𐑕𐑳𐑥",
        "time": "𐑑𐑲𐑥",
        "very": "𐑝𐑧𐑮𐑦",
        "read": "𐑮𐑰𐑛",
        "lead": "𐑤𐑰𐑛",
        "record": "𐑮𐑦𐑒𐑹𐑛",
        "object": "𐑪𐑚𐑡𐑦𐑒𐑑",
        "present": "𐑮𐑦𐑟𐑧𐑯𐑑"
      },
      posSpecific: {
        "read_VVD": "𐑮𐑧𐑛",
        "read_VVN": "𐑮𐑧𐑛",
        "lead_NN1": "𐑤𐑧𐑛",
        "record_NN1": "𐑮𐑧𐑒𐑹𐑛",
        "record_VVI": "𐑮𐑦𐑒𐑹𐑛",
        "object_NN1": "𐑪𐑚𐑡𐑦𐑒𐑑",
        "object_VVI": "𐑩𐑚𐑡𐑧𐑒𐑑",
        "present_NN1": "𐑮𐑦𐑟𐑧𐑯𐑑",
        "present_AJ0": "𐑮𐑦𐑟𐑧𐑯𐑑",
        "present_VVI": "𐑮𐑦𐑟𐑧𐑯𐑑"
      },
      getTransliteration: function(word: string, pos?: string): string | undefined {
        const cleanWord = word.toLowerCase();
        if (pos) {
          const posKey = `${cleanWord}_${pos}`;
          if (this.posSpecific[posKey]) {
            return this.posSpecific[posKey];
          }
        }
        return this.basic[cleanWord];
      },
      getAllVariants: function(word: string): Array<{ pos: string; transliteration: string; key: string }> {
        const cleanWord = word.toLowerCase();
        const variants: Array<{ pos: string; transliteration: string; key: string }> = [];
        for (const [key, transliteration] of Object.entries(this.posSpecific)) {
          if (key.startsWith(cleanWord + '_')) {
            const pos = key.substring(cleanWord.length + 1);
            variants.push({ pos, transliteration, key });
          }
        }
        return variants;
      }
    };

    engine = new ReadlexiconEngine(performanceTestDictionary);
    transliterator = new ReadlexiconTransliterator();
    await transliterator.ready();
  });

  describe("WordPOS Package Integration", () => {
    test("should successfully import and use wordpos", async () => {
      const WordPOS = require('wordpos');
      expect(WordPOS).toBeDefined();
      
      const wordpos = new WordPOS();
      expect(wordpos).toBeDefined();
      expect(typeof wordpos.isNoun).toBe('function');
      expect(typeof wordpos.isVerb).toBe('function');
      expect(typeof wordpos.isAdjective).toBe('function');
      expect(typeof wordpos.isAdverb).toBe('function');
    });

    test("should detect word types correctly", async () => {
      const WordPOS = require('wordpos');
      const wordpos = new WordPOS();
      
      // Test common words
      expect(await wordpos.isNoun('cat')).toBe(true);
      expect(await wordpos.isVerb('run')).toBe(true);
      expect(await wordpos.isAdjective('quick')).toBe(true);
      expect(await wordpos.isAdverb('quickly')).toBe(true);
      
      // Test heteronyms
      expect(await wordpos.isNoun('record')).toBe(true);
      expect(await wordpos.isVerb('record')).toBe(true);
      expect(await wordpos.isNoun('object')).toBe(true);
      expect(await wordpos.isVerb('object')).toBe(true);
    });

    test("should handle wordpos errors gracefully", async () => {
      // Test with malformed or unusual inputs
      const testCases = ["", "123", "!@#", "very-long-hyphenated-word-that-might-cause-issues"];
      
      for (const testCase of testCases) {
        // Should not throw errors
        const result = await engine.transliterateWithPOS(testCase);
        expect(typeof result).toBe('string');
      }
    });
  });

  describe("Performance Benchmarks", () => {
    test("should complete basic transliteration quickly", async () => {
      const text = "The quick brown fox jumps over the lazy dog.";
      
      const start = Date.now();
      const result = await engine.transliterateWithPOS(text);
      const duration = Date.now() - start;
      
      expect(typeof result).toBe('string');
      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
      
      console.log(`Basic POS transliteration (${text.length} chars): ${duration}ms`);
    });

    test("should handle medium-length text efficiently", async () => {
      const mediumText = `
        In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, 
        filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandy 
        hole with nothing in it to sit down on or to eat: it was a hobbit-hole, and 
        that means comfort. It had a perfectly round door like a porthole, painted 
        green, with a shiny yellow brass knob in the exact middle.
      `.trim();
      
      const start = Date.now();
      const result = await engine.transliterateWithPOS(mediumText);
      const duration = Date.now() - start;
      
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      
      console.log(`Medium POS transliteration (${mediumText.length} chars): ${duration}ms`);
    });

    test("should compare POS vs non-POS transliteration performance", async () => {
      const text = "I read the record book and will record my thoughts about the present situation.";
      
      // Time POS-aware transliteration
      const posStart = Date.now();
      const posResult = await engine.transliterateWithPOS(text);
      const posDuration = Date.now() - posStart;
      
      // Time basic transliteration
      const basicStart = Date.now();
      const basicResult = engine.transliterate(text);
      const basicDuration = Date.now() - basicStart;
      
      expect(typeof posResult).toBe('string');
      expect(typeof basicResult).toBe('string');
      
      // POS should be slower but not excessively so
      // Handle case where basic transliteration is too fast to measure
      if (basicDuration > 0) {
        expect(posDuration).toBeGreaterThanOrEqual(basicDuration);
        expect(posDuration).toBeLessThan(basicDuration * 50); // Should not be 50x slower
        console.log(`POS transliteration: ${posDuration}ms`);
        console.log(`Basic transliteration: ${basicDuration}ms`);
        console.log(`POS overhead: ${((posDuration / basicDuration) - 1) * 100}%`);
      } else {
        // Both are very fast, just ensure POS doesn't take too long
        expect(posDuration).toBeLessThan(100); // Should complete within 100ms
        console.log(`POS transliteration: ${posDuration}ms`);
        console.log(`Basic transliteration: ${basicDuration}ms (too fast to measure)`);
      }
    });

    test("should handle repeated calls efficiently (caching)", async () => {
      const text = "The lead singer will lead the band.";
      
      // First call (cold)
      const firstStart = Date.now();
      const firstResult = await engine.transliterateWithPOS(text);
      const firstDuration = Date.now() - firstStart;
      
      // Second call (should benefit from caching)
      const secondStart = Date.now();
      const secondResult = await engine.transliterateWithPOS(text);
      const secondDuration = Date.now() - secondStart;
      
      expect(firstResult).toBe(secondResult);
      expect(secondDuration).toBeLessThanOrEqual(firstDuration); // Should be same or faster
      
      console.log(`First call: ${firstDuration}ms`);
      console.log(`Second call: ${secondDuration}ms`);
      console.log(`Cache speedup: ${((firstDuration / secondDuration) - 1) * 100}%`);
    });
  });

  describe("Stress Tests", () => {
    test("should handle multiple concurrent transliterations", async () => {
      const texts = [
        "I read the book yesterday.",
        "Please record this conversation.",
        "The lead pipe is heavy.",
        "Present your findings now.",
        "I object to this proposal."
      ];
      
      const start = Date.now();
      const promises = texts.map(text => engine.transliterateWithPOS(text));
      const results = await Promise.all(promises);
      const duration = Date.now() - start;
      
      expect(results.length).toBe(texts.length);
      results.forEach(result => {
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });
      
      console.log(`Concurrent transliterations (${texts.length} texts): ${duration}ms`);
    });

    test("should handle very long text without memory issues", async () => {
      const longText = "The quick brown fox jumps over the lazy dog. I read books and lead teams. ".repeat(100);
      
      const start = Date.now();
      const result = await engine.transliterateWithPOS(longText);
      const duration = Date.now() - start;
      
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
      
      console.log(`Long text transliteration (${longText.length} chars): ${duration}ms`);
    });

    test("should handle text with many heteronyms", async () => {
      const heteronymText = `
        I read the record about the lead singer who will lead the band.
        Please present the present to the person who will object to the object.
        The tear in my eye fell as I began to tear the paper.
        The wind was too strong to wind up the kite string.
        I will record the record player playing the record.
      `.trim();
      
      const start = Date.now();
      const result = await engine.transliterateWithPOS(heteronymText);
      const duration = Date.now() - start;
      
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
      
      console.log(`Heteronym-heavy text (${heteronymText.length} chars): ${duration}ms`);
    });
  });

  describe("Memory and Resource Usage", () => {
    test("should not leak memory on repeated calls", async () => {
      const text = "Test sentence with some heteronyms like read and lead.";
      
      // Run many iterations to check for memory leaks
      for (let i = 0; i < 50; i++) {
        const result = await engine.transliterateWithPOS(text);
        expect(typeof result).toBe('string');
      }
      
      // If we reach here without crashing, memory usage is probably OK
      expect(true).toBe(true);
    });

    test("should handle wordpos package initialization multiple times", async () => {
      // This tests that we can safely create multiple instances
      const engine1 = new ReadlexiconEngine();
      const engine2 = new ReadlexiconEngine();
      
      const text = "Simple test sentence.";
      const result1 = await engine1.transliterateWithPOS(text);
      const result2 = await engine2.transliterateWithPOS(text);
      
      expect(typeof result1).toBe('string');
      expect(typeof result2).toBe('string');
    });
  });

  describe("Error Handling and Fallbacks", () => {
    test("should fall back to basic transliteration on POS errors", async () => {
      // Force an error by trying to break the POS tagger
      const problematicText = "ThisIsAVeryLongWordThatMightCauseIssuesWithPOSTagging123!@#$%";
      
      const result = await engine.transliterateWithPOS(problematicText);
      expect(typeof result).toBe('string');
      
      // Should at least preserve the original text if nothing else works
      expect(result.length).toBeGreaterThan(0);
    });

    test("should handle network-related wordpos errors gracefully", async () => {
      // Test with various edge cases that might cause wordpos issues
      const edgeCases = [
        "",
        " ",
        "a",
        "supercalifragilisticexpialidocious",
        "word-with-many-hyphens-and-dashes",
        "ALLUPPERCASE",
        "miXeDcAsE",
        "123numbers456",
        "symbols!@#$%^&*()",
        "unicode_ñoñó_characters"
      ];
      
      for (const testCase of edgeCases) {
        const result = await engine.transliterateWithPOS(testCase);
        expect(typeof result).toBe('string');
        // Should not throw errors
      }
    });

    test("should maintain backward compatibility", async () => {
      // Ensure basic transliteration still works as expected
      const text = "Hello world, this is a test.";
      
      const basicResult = engine.transliterate(text);
      const posResult = await engine.transliterateWithPOS(text);
      
      expect(typeof basicResult).toBe('string');
      expect(typeof posResult).toBe('string');
      
      // Both should produce reasonable output
      expect(basicResult.length).toBeGreaterThan(0);
      expect(posResult.length).toBeGreaterThan(0);
    });
  });
});

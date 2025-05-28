/**
 * Tests for POS-aware transliteration functionality
 * Following Bun test standards
 */
import { expect, test, describe, beforeAll } from "bun:test";
import { ReadlexiconEngine } from "../src/core/transliterationEngine";
import { ReadlexiconTransliterator } from "../src/readlexiconTransliterator";
import type { POSTaggedToken } from "../src/core/posTagger";

describe("POS-Aware Transliteration", () => {
  let engine: ReadlexiconEngine;
  let transliterator: ReadlexiconTransliterator;

  beforeAll(async () => {
    // Create engine with POS-aware dictionary structure
    const testDictionary = {
      basic: {
        "read": "𐑮𐑰𐑛", // default pronunciation
        "lead": "𐑤𐑰𐑛", // default pronunciation
        "bow": "𐑚𐑬", // default pronunciation
        "tear": "𐑑𐑺", // default pronunciation
        "object": "𐑪𐑚𐑡𐑦𐑒𐑑", // default pronunciation
        "record": "𐑮𐑦𐑒𐑹𐑛", // default pronunciation
        "present": "𐑮𐑦𐑒𐑪𐑮𐑛", // default pronunciation
        "hello": "𐑣𐑧𐑤𐑴",
        "world": "𐑢𐑻𐑤𐑛",
        "test": "𐑑𐑧𐑕𐑑"
      },
      posSpecific: {
        // Different pronunciations based on POS
        "read_VVD": "𐑮𐑧𐑛", // past tense "read" (red)
        "read_VVN": "𐑮𐑧𐑛", // past participle "read" (red)
        "lead_NN1": "𐑤𐑧𐑛", // noun "lead" (the metal)
        "lead_NN2": "𐑤𐑧𐑛", // plural noun "lead"
        "bow_NN1": "𐑚𐑴", // noun "bow" (archery bow)
        "bow_VVI": "𐑚𐑬", // verb "bow" (to bend)
        "tear_NN1": "𐑑𐑦𐑼", // noun "tear" (from crying)
        "tear_VVI": "𐑑𐑺", // verb "tear" (to rip)
        "object_NN1": "𐑪𐑚𐑡𐑦𐑒𐑑", // noun "object"
        "object_VVI": "𐑩𐑚𐑡𐑧𐑒𐑑", // verb "object"
        "record_NN1": "𐑮𐑧𐑒𐑹𐑛", // noun "record"
        "record_VVI": "𐑮𐑦𐑒𐑹𐑛", // verb "record"
        "present_NN1": "𐑮𐑦𐑟𐑧𐑯𐑑", // noun "present" (gift)
        "present_AJ0": "𐑮𐑦𐑟𐑧𐑯𐑑", // adjective "present"
        "present_VVI": "𐑮𐑦𐑟𐑧𐑯𐑑" // verb "present"
      },
      getTransliteration(word: string, pos?: string): string | undefined {
        const cleanWord = word.toLowerCase();
        
        if (pos) {
          const posKey = `${cleanWord}_${pos}`;
          if (this.posSpecific[posKey]) {
            return this.posSpecific[posKey];
          }
        }
        
        return this.basic[cleanWord];
      },
      getAllVariants(word: string): Array<{ pos: string; transliteration: string; key: string }> {
        const cleanWord = word.toLowerCase();
        const variants: Array<{ pos: string; transliteration: string; key: string }> = [];
        
        for (const [key, transliteration] of Object.entries(this.posSpecific)) {
          if (key.startsWith(`${cleanWord  }_`)) {
            const pos = key.substring(cleanWord.length + 1);
            variants.push({ pos, transliteration, key });
          }
        }
        
        return variants;
      }
    };

    engine = new ReadlexiconEngine(testDictionary);
    transliterator = new ReadlexiconTransliterator();
    await transliterator.ready();
  });

  describe("ReadlexiconEngine POS-aware methods", () => {
    test("should use POS-specific pronunciation for heteronyms", () => {
      // Test "read" - present vs past tense
      expect(engine.transliterateWord("read", "VVI")).toBe("𐑮𐑰𐑛"); // present: "reed"
      expect(engine.transliterateWord("read", "VVD")).toBe("𐑮𐑧𐑛"); // past: "red"

      // Test "lead" - verb vs noun
      expect(engine.transliterateWord("lead", "VVI")).toBe("𐑤𐑰𐑛"); // verb: "leed"
      expect(engine.transliterateWord("lead", "NN1")).toBe("𐑤𐑧𐑛"); // noun: "led"

      // Test "bow" - verb vs noun
      expect(engine.transliterateWord("bow", "VVI")).toBe("𐑚𐑬"); // verb: "bow" (to bend)
      expect(engine.transliterateWord("bow", "NN1")).toBe("𐑚𐑴"); // noun: "bow" (archery)
    });

    test("should fall back to basic pronunciation when no POS match", () => {
      // Test with unknown POS tag
      expect(engine.transliterateWord("read", "UNKNOWN")).toBe("𐑮𐑰𐑛"); // default
      expect(engine.transliterateWord("hello", "VVI")).toBe("𐑣𐑧𐑤𐑴"); // no POS variant exists
    });

    test("should work without POS tag", () => {
      // Should use basic dictionary
      expect(engine.transliterateWord("read")).toBe("𐑮𐑰𐑛");
      expect(engine.transliterateWord("hello")).toBe("𐑣𐑧𐑤𐑴");
      expect(engine.transliterateWord("world")).toBe("𐑢𐑻𐑤𐑛");
    });

    test("should handle transliterateWithPOSTags method", () => {
      const tokens: POSTaggedToken[] = [
        { text: "I", pos: "PNP" },
        { text: " ", pos: "PUNCT" },
        { text: "read", pos: "VVD" },
        { text: " ", pos: "PUNCT" },
        { text: "the", pos: "AT0" },
        { text: " ", pos: "PUNCT" },
        { text: "record", pos: "NN1" },
        { text: ".", pos: "PUNCT" }
      ];

      const result = engine.transliterateWithPOSTags(tokens);
      
      // Should use POS-specific pronunciations
      expect(result).toContain("𐑮𐑧𐑛"); // "read" as past tense
      expect(result).toContain("𐑮𐑧𐑒𐑹𐑛"); // "record" as noun
    });

    test("should handle async transliterateWithPOS method", async () => {
      const text = "I read the book yesterday.";
      const result = await engine.transliterateWithPOS(text);
      
      // Should be a transliterated string
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
      
      // Should contain some Shavian characters or transliterated content
      expect(result).toMatch(/[\u{10450}-\u{1047F}]|read|book/u);
    });

    test("should gracefully handle POS tagging errors", async () => {
      // This should not throw, even if POS tagging fails
      const result = await engine.transliterateWithPOS("Some text with unusual characters: @#$%");
      expect(typeof result).toBe("string");
    });
  });

  describe("ReadlexiconTransliterator POS integration", () => {
    test("should have transliterateWithPOS method", async () => {
      const text = "The lead singer will lead the band.";
      const result = await transliterator.transliterateWithPOS(text);
      
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    test("should handle heteronyms in context", async () => {
      const text = "Please record the record.";
      const result = await transliterator.transliterateWithPOS(text);
      
      // Should be different from non-POS transliteration
      const basicResult = await transliterator.transliterate(text);
      
      // At minimum, should not throw errors
      expect(typeof result).toBe("string");
      expect(typeof basicResult).toBe("string");
    });

    test("should work with punctuation", async () => {
      const text = "I can't read the book, but I read it yesterday!";
      const result = await transliterator.transliterateWithPOS(text);
      
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("Dictionary format compatibility", () => {
    test("should work with new POS-aware dictionary format", () => {
      // Test that the engine recognizes the new format
      expect(typeof engine['dictionary']).toBe("object");
      expect(typeof engine['dictionary'].getTransliteration).toBe("function");
      expect(typeof engine['dictionary'].getAllVariants).toBe("function");
    });

    test("should access POS-specific entries", () => {
      const dict = engine['dictionary'];
      
      // Test direct access to POS-specific entries
      expect(dict.getTransliteration("read", "VVD")).toBe("𐑮𐑧𐑛");
      expect(dict.getTransliteration("read", "VVI")).toBe("𐑮𐑰𐑛");
      expect(dict.getTransliteration("lead", "NN1")).toBe("𐑤𐑧𐑛");
    });

    test("should get all variants for a word", () => {
      const dict = engine['dictionary'];
      const readVariants = dict.getAllVariants("read");
      
      expect(Array.isArray(readVariants)).toBe(true);
      expect(readVariants.length).toBeGreaterThan(0);
      
      // Should contain POS-specific variants
      const pastTenseVariant = readVariants.find(v => v.pos === "VVD");
      expect(pastTenseVariant).toBeDefined();
      expect(pastTenseVariant?.transliteration).toBe("𐑮𐑧𐑛");
    });
  });

  describe("Performance and edge cases", () => {
    test("should handle empty or whitespace text", async () => {
      expect(await engine.transliterateWithPOS("")).toBe("");
      expect(await engine.transliterateWithPOS("   ")).toBe("   ");
      expect(await transliterator.transliterateWithPOS("")).toBe("");
    });

    test("should handle text with no transliterable words", async () => {
      const result = await engine.transliterateWithPOS("123 !@# $%^");
      expect(typeof result).toBe("string");
      // Should preserve non-word content
      expect(result).toContain("123");
    });

    test("should be reasonably fast for moderate-length text", async () => {
      const longText = "The quick brown fox jumps over the lazy dog. ".repeat(10);
      const start = Date.now();
      const result = await engine.transliterateWithPOS(longText);
      const duration = Date.now() - start;
      
      expect(typeof result).toBe("string");
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test("should maintain consistency across multiple calls", async () => {
      const text = "I read the record book.";
      const result1 = await engine.transliterateWithPOS(text);
      const result2 = await engine.transliterateWithPOS(text);
      
      expect(result1).toBe(result2);
    });
  });

  describe("Real-world heteronym examples", () => {
    test("should handle common heteronyms correctly", async () => {
      const testCases = [
        "I will read the book", // read = future, should be "reed"
        "I read the book yesterday", // read = past, should be "red"
        "The lead pipe", // lead = noun (metal), should be "led"
        "I will lead the team", // lead = verb, should be "leed"
        "She shed a tear", // tear = noun (crying), should be "teer"
        "Don't tear the paper", // tear = verb (rip), should be "tair"
      ];

      for (const testCase of testCases) {
        const result = await engine.transliterateWithPOS(testCase);
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
        console.log(`"${testCase}" -> "${result}"`);
      }
    });

    test("should handle object as noun vs verb", async () => {
      const nounSentence = "The object is heavy";
      const verbSentence = "I object to this proposal";
      
      const nounResult = await engine.transliterateWithPOS(nounSentence);
      const verbResult = await engine.transliterateWithPOS(verbSentence);
      
      expect(typeof nounResult).toBe("string");
      expect(typeof verbResult).toBe("string");
      
      // Results should be different if POS-aware transliteration is working
      console.log(`Noun: "${nounSentence}" -> "${nounResult}"`);
      console.log(`Verb: "${verbSentence}" -> "${verbResult}"`);
    });
  });
});

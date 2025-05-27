/**
 * Integration tests for transliteration engine with punctuation handler
 * Following Bun test standards
 */
import { expect, test, describe, beforeAll } from "bun:test";
import { ReadlexiconEngine } from "../src/core/transliterationEngine";

describe("TransliterationEngine with Punctuation Handler Integration", () => {
  let engine: ReadlexiconEngine;

  beforeAll(() => {
    // Create a simple engine with basic dictionary for testing
    const testDictionary = {
      "hello": "𐑣𐑧𐑤𐑴",
      "world": "𐑢𐑻𐑤𐑛",
      "test": "𐑑𐑧𐑕𐑑",
      "word": "𐑢𐑻𐑛",
      "example": "𐑦𐑜𐑟𐑭𐑥𐑐𐑤",
      "punctuation": "𐑐𐑳𐑙𐑒𐑑𐑿𐑱𐑖𐑩𐑯"
    };
    engine = new ReadlexiconEngine(testDictionary);
  });

  describe("transliterateWord with punctuation", () => {
    test("should handle words with trailing punctuation", () => {
      expect(engine.transliterateWord("hello,")).toBe("punctuation{hello,}");
      expect(engine.transliterateWord("world!")).toBe("punctuation{world!}");
      expect(engine.transliterateWord("test?")).toBe("punctuation{test?}");
      expect(engine.transliterateWord("word.")).toBe("punctuation{word.}");
      expect(engine.transliterateWord("example:")).toBe("punctuation{example:}");
      expect(engine.transliterateWord("test;")).toBe("punctuation{test;}");
    });

    test("should handle words with leading punctuation", () => {
      expect(engine.transliterateWord("(hello")).toBe("punctuation{(hello}");
      expect(engine.transliterateWord("\"world")).toBe("punctuation{\"world}");
      expect(engine.transliterateWord("[test")).toBe("punctuation{[test}");
    });

    test("should handle words with surrounding punctuation", () => {
      expect(engine.transliterateWord("(hello)")).toBe("punctuation{(hello)}");
      expect(engine.transliterateWord("\"world\"")).toBe("punctuation{\"world\"}");
      expect(engine.transliterateWord("[test]")).toBe("punctuation{[test]}");
      expect(engine.transliterateWord("{example}")).toBe("punctuation{{example}}");
    });

    test("should handle words with multiple punctuation marks", () => {
      expect(engine.transliterateWord("hello,!")).toBe("punctuation{hello,!}");
      expect(engine.transliterateWord("world...")).toBe("punctuation{world...}");
      expect(engine.transliterateWord("test?!")).toBe("punctuation{test?!}");
    });

    test("should handle words with numbers", () => {
      expect(engine.transliterateWord("hello123")).toBe("punctuation{hello123}");
      expect(engine.transliterateWord("test2day")).toBe("punctuation{test2day}");
      expect(engine.transliterateWord("word2")).toBe("punctuation{word2}");
    });

    test("should handle words with special characters", () => {
      expect(engine.transliterateWord("email@domain")).toBe("punctuation{email@domain}");
      expect(engine.transliterateWord("hashtag#")).toBe("punctuation{hashtag#}");
      expect(engine.transliterateWord("$money")).toBe("punctuation{$money}");
    });

    test("should NOT process pure alphabetic words", () => {
      expect(engine.transliterateWord("hello")).toBe("𐑣𐑧𐑤𐑴");
      expect(engine.transliterateWord("world")).toBe("𐑢𐑻𐑤𐑛");
      expect(engine.transliterateWord("test")).toBe("𐑑𐑧𐑕𐑑");
    });

    test("should process contractions with apostrophes as punctuation", () => {
      // Add contractions to dictionary for testing
      engine.addToDictionary("don't", "𐑛𐑴𐑯𐑑");
      engine.addToDictionary("can't", "𐑒𐑭𐑯𐑑");
      engine.addToDictionary("it's", "𐑦𐑑𐑕");

      expect(engine.transliterateWord("don't")).toBe("punctuation{don't}");
      expect(engine.transliterateWord("can't")).toBe("punctuation{can't}");
      expect(engine.transliterateWord("it's")).toBe("punctuation{it's}");
    });
  });

  describe("transliterate full text with punctuation", () => {
    test("should handle sentences with punctuation", () => {
      const text = "Hello, world! How are you?";
      const result = engine.transliterate(text);
      expect(result).toBe("punctuation{Hello,} punctuation{world!} 𐑣𐑬 𐑸 punctuation{you?}");
    });

    test("should handle mixed punctuation and plain words", () => {
      const text = "This is a test, world.";
      const result = engine.transliterate(text);
      expect(result).toBe("𐑞𐑦𐑕 𐑦𐑟 𐑩 punctuation{test,} punctuation{world.}");
    });

    test("should preserve spacing and pure punctuation", () => {
      const text = "Hello , world ! Test .";
      const result = engine.transliterate(text);
      expect(result).toBe("𐑣𐑧𐑤𐑴 , 𐑢𐑻𐑤𐑛 ! 𐑑𐑧𐑕𐑑 .");
    });

    test("should handle complex sentences", () => {
      const text = "Test: hello, world! Example?";
      const result = engine.transliterate(text);
      expect(result).toBe("punctuation{Test:} punctuation{hello,} punctuation{world!} punctuation{Example?}");
    });
  });

  describe("reverseTransliterateWord with punctuation format", () => {
    test("should extract original words from punctuation format", () => {
      expect(engine.reverseTransliterateWord("punctuation{hello,}")).toBe("hello,");
      expect(engine.reverseTransliterateWord("punctuation{world!}")).toBe("world!");
      expect(engine.reverseTransliterateWord("punctuation{test?}")).toBe("test?");
      expect(engine.reverseTransliterateWord("punctuation{word.}")).toBe("word.");
    });

    test("should handle normal Shavian transliteration", () => {
      expect(engine.reverseTransliterateWord("𐑣𐑧𐑤𐑴")).toBe("hello");
      expect(engine.reverseTransliterateWord("𐑢𐑻𐑤𐑛")).toBe("world");
      expect(engine.reverseTransliterateWord("𐑑𐑧𐑕𐑑")).toBe("test");
    });

    test("should handle mixed cases", () => {
      const text = "𐑣𐑧𐑤𐑴 punctuation{world!} 𐑑𐑧𐑕𐑑";
      const result = engine.reverseTransliterate(text);
      expect(result).toBe("hello world! test");
    });
  });

  describe("edge cases and error handling", () => {
    test("should handle empty strings", () => {
      expect(engine.transliterateWord("")).toBe("");
      expect(engine.reverseTransliterateWord("")).toBe("");
    });

    test("should handle whitespace-only strings", () => {
      expect(engine.transliterateWord(" ")).toBe(" ");
      expect(engine.transliterateWord("   ")).toBe("   ");
    });

    test("should handle pure punctuation", () => {
      expect(engine.transliterateWord(",")).toBe(",");
      expect(engine.transliterateWord("!")).toBe("!");
      expect(engine.transliterateWord("?")).toBe("?");
      expect(engine.transliterateWord(".")).toBe(".");
    });

    test("should handle compound words with punctuation", () => {
      // Add compound word to dictionary
      engine.addToDictionary("hello-world", "𐑣𐑧𐑤𐑴-𐑢𐑻𐑤𐑛");
      
      // Compound words with hyphens should work normally
      expect(engine.transliterateWord("hello-world")).toBe("𐑣𐑧𐑤𐑴-𐑢𐑻𐑤𐑛");
      
      // But compound words with other punctuation should be processed
      expect(engine.transliterateWord("hello-world,")).toBe("punctuation{hello-world,}");
    });

    test("should handle malformed punctuation format in reverse transliteration", () => {
      expect(engine.reverseTransliterateWord("punctuation{")).toBe("punctuation{");
      expect(engine.reverseTransliterateWord("punctuation}")).toBe("punctuation}");
      expect(engine.reverseTransliterateWord("not-punctuation{word}")).toBe("not-punctuation{word}");
    });
  });

  describe("performance and consistency", () => {
    test("should be consistent with repeated calls", () => {
      const testWord = "hello,";
      const result1 = engine.transliterateWord(testWord);
      const result2 = engine.transliterateWord(testWord);
      const result3 = engine.transliterateWord(testWord);
      
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
      expect(result1).toBe("punctuation{hello,}");
    });

    test("should handle round-trip transliteration correctly", () => {
      const originalText = "Hello, world! This is a test.";
      const transliterated = engine.transliterate(originalText);
      const backToEnglish = engine.reverseTransliterate(transliterated);
      
      // Note: This won't be exactly the same due to capitalization and word boundaries,
      // but punctuation-processed words should round-trip correctly
      expect(backToEnglish).toContain("world!");
      expect(backToEnglish).toContain("test.");
    });
  });
});

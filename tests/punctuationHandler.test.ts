/**
 * Tests for punctuation handler functionality
 * Following Bun test standards
 */
import { expect, test, describe } from "bun:test";
import {
  hasNonAlphabeticCharacters,
  processPunctuatedWord,
  handleWordPunctuation,
  extractOriginalWord,
  isPunctuationProcessed,
  type PunctuationProcessingResult
} from "../src/core/punctuationHandler";

describe("punctuationHandler", () => {
  describe("hasNonAlphabeticCharacters", () => {
    test("should return false for pure alphabetic words", () => {
      expect(hasNonAlphabeticCharacters("hello")).toBe(false);
      expect(hasNonAlphabeticCharacters("world")).toBe(false);
      expect(hasNonAlphabeticCharacters("UPPERCASE")).toBe(false);
      expect(hasNonAlphabeticCharacters("MixedCase")).toBe(false);
    });

    test("should return false for words with hyphens (allowed)", () => {
      expect(hasNonAlphabeticCharacters("hello-world")).toBe(false);
      expect(hasNonAlphabeticCharacters("self-care")).toBe(false);
      expect(hasNonAlphabeticCharacters("mother-in-law")).toBe(false);
    });

    test("should return true for words with apostrophes", () => {
      expect(hasNonAlphabeticCharacters("don't")).toBe(true);
      expect(hasNonAlphabeticCharacters("can't")).toBe(true);
      expect(hasNonAlphabeticCharacters("it's")).toBe(true);
      expect(hasNonAlphabeticCharacters("I'm")).toBe(true);
    });

    test("should return true for words with punctuation", () => {
      expect(hasNonAlphabeticCharacters("hello,")).toBe(true);
      expect(hasNonAlphabeticCharacters("world!")).toBe(true);
      expect(hasNonAlphabeticCharacters("test?")).toBe(true);
      expect(hasNonAlphabeticCharacters("word.")).toBe(true);
      expect(hasNonAlphabeticCharacters("example:")).toBe(true);
      expect(hasNonAlphabeticCharacters("test;")).toBe(true);
    });

    test("should return true for words with numbers", () => {
      expect(hasNonAlphabeticCharacters("word123")).toBe(true);
      expect(hasNonAlphabeticCharacters("123word")).toBe(true);
      expect(hasNonAlphabeticCharacters("wo123rd")).toBe(true);
    });

    test("should return true for words with special characters", () => {
      expect(hasNonAlphabeticCharacters("word@domain")).toBe(true);
      expect(hasNonAlphabeticCharacters("hash#tag")).toBe(true);
      expect(hasNonAlphabeticCharacters("dollar$")).toBe(true);
      expect(hasNonAlphabeticCharacters("percent%")).toBe(true);
    });

    test("should return false for empty or whitespace strings and pure punctuation", () => {
      expect(hasNonAlphabeticCharacters("")).toBe(false);
      expect(hasNonAlphabeticCharacters(" ")).toBe(false);
      expect(hasNonAlphabeticCharacters("   ")).toBe(false);
      expect(hasNonAlphabeticCharacters("\t")).toBe(false);
      expect(hasNonAlphabeticCharacters("\n")).toBe(false);
      
      // Pure punctuation (no letters) should not be processed
      expect(hasNonAlphabeticCharacters(",")).toBe(false);
      expect(hasNonAlphabeticCharacters("!")).toBe(false);
      expect(hasNonAlphabeticCharacters("?")).toBe(false);
      expect(hasNonAlphabeticCharacters(".")).toBe(false);
      expect(hasNonAlphabeticCharacters("123")).toBe(false);
      expect(hasNonAlphabeticCharacters("...")).toBe(false);
    });

    test("should handle mixed cases correctly", () => {
      expect(hasNonAlphabeticCharacters("Hello,")).toBe(true);
      expect(hasNonAlphabeticCharacters("WORLD!")).toBe(true);
      expect(hasNonAlphabeticCharacters("CamelCase.")).toBe(true);
    });
  });

  describe("processPunctuatedWord", () => {
    test("should return original word when no non-alphabetic characters", () => {
      const result = processPunctuatedWord("hello");
      expect(result.hasNonAlphabetic).toBe(false);
      expect(result.processedWord).toBe("hello");
    });

    test("should return punctuation format for words with apostrophes, but original for hyphens", () => {
      const result = processPunctuatedWord("don't");
      expect(result.hasNonAlphabetic).toBe(true);
      expect(result.processedWord).toBe("punctuation{don't}");

      const result2 = processPunctuatedWord("hello-world");
      expect(result2.hasNonAlphabetic).toBe(false);
      expect(result2.processedWord).toBe("hello-world");
    });

    test("should return punctuation format for words with punctuation", () => {
      const testCases = [
        { input: "hello,", expected: "punctuation{hello,}" },
        { input: "world!", expected: "punctuation{world!}" },
        { input: "test?", expected: "punctuation{test?}" },
        { input: "word.", expected: "punctuation{word.}" },
        { input: "example:", expected: "punctuation{example:}" },
        { input: "test;", expected: "punctuation{test;}" },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = processPunctuatedWord(input);
        expect(result.hasNonAlphabetic).toBe(true);
        expect(result.processedWord).toBe(expected);
      });
    });

    test("should handle words with multiple punctuation marks", () => {
      const result = processPunctuatedWord("hello,!");
      expect(result.hasNonAlphabetic).toBe(true);
      expect(result.processedWord).toBe("punctuation{hello,!}");
    });

    test("should handle words with numbers", () => {
      const result = processPunctuatedWord("word123");
      expect(result.hasNonAlphabetic).toBe(true);
      expect(result.processedWord).toBe("punctuation{word123}");
    });

    test("should handle words with em dashes (different from hyphens)", () => {
      const result1 = processPunctuatedWord("often—");
      expect(result1.hasNonAlphabetic).toBe(true);
      expect(result1.processedWord).toBe("punctuation{often—}");

      const result2 = processPunctuatedWord("—casting");
      expect(result2.hasNonAlphabetic).toBe(true);
      expect(result2.processedWord).toBe("punctuation{—casting}");

      const result3 = processPunctuatedWord("word—another");
      expect(result3.hasNonAlphabetic).toBe(true);
      expect(result3.processedWord).toBe("punctuation{word—another}");
    });

    test("should handle words with em dashes (different from hyphens)", () => {
      const result1 = processPunctuatedWord("often—");
      expect(result1.hasNonAlphabetic).toBe(true);
      expect(result1.processedWord).toBe("punctuation{often—}");

      const result2 = processPunctuatedWord("—casting");
      expect(result2.hasNonAlphabetic).toBe(true);
      expect(result2.processedWord).toBe("punctuation{—casting}");

      const result3 = processPunctuatedWord("word—another");
      expect(result3.hasNonAlphabetic).toBe(true);
      expect(result3.processedWord).toBe("punctuation{word—another}");
    });

    test("should handle edge cases", () => {
      expect(processPunctuatedWord("").processedWord).toBe("");
      expect(processPunctuatedWord(" ").processedWord).toBe(" ");
    });
  });

  describe("handleWordPunctuation", () => {
    test("should return original word for pure alphabetic words", () => {
      expect(handleWordPunctuation("hello")).toBe("hello");
      expect(handleWordPunctuation("world")).toBe("world");
      expect(handleWordPunctuation("test")).toBe("test");
    });

    test("should return punctuation format for words with apostrophes, but original for hyphens", () => {
      expect(handleWordPunctuation("don't")).toBe("punctuation{don't}");
      expect(handleWordPunctuation("can't")).toBe("punctuation{can't}");
      expect(handleWordPunctuation("it's")).toBe("punctuation{it's}");
      expect(handleWordPunctuation("hello-world")).toBe("hello-world");
      expect(handleWordPunctuation("self-care")).toBe("self-care");
    });

    test("should return punctuation format for words with punctuation", () => {
      expect(handleWordPunctuation("hello,")).toBe("punctuation{hello,}");
      expect(handleWordPunctuation("world!")).toBe("punctuation{world!}");
      expect(handleWordPunctuation("test?")).toBe("punctuation{test?}");
      expect(handleWordPunctuation("word.")).toBe("punctuation{word.}");
    });

    test("should handle complex punctuation cases", () => {
      expect(handleWordPunctuation("hello,!")).toBe("punctuation{hello,!}");
      expect(handleWordPunctuation("test...")).toBe("punctuation{test...}");
      expect(handleWordPunctuation("word123")).toBe("punctuation{word123}");
      expect(handleWordPunctuation("email@domain.com")).toBe("punctuation{email@domain.com}");
    });

    test("should handle em dashes (different from hyphens)", () => {
      expect(handleWordPunctuation("often—")).toBe("punctuation{often—}");
      expect(handleWordPunctuation("—casting")).toBe("punctuation{—casting}");
      expect(handleWordPunctuation("word—another")).toBe("punctuation{word—another}");
    });
  });

  describe("extractOriginalWord", () => {
    test("should extract original word from punctuation format", () => {
      expect(extractOriginalWord("punctuation{hello,}")).toBe("hello,");
      expect(extractOriginalWord("punctuation{world!}")).toBe("world!");
      expect(extractOriginalWord("punctuation{test?}")).toBe("test?");
      expect(extractOriginalWord("punctuation{word.}")).toBe("word.");
    });

    test("should return original input if not in punctuation format", () => {
      expect(extractOriginalWord("hello")).toBe("hello");
      expect(extractOriginalWord("world")).toBe("world");
      expect(extractOriginalWord("don't")).toBe("don't");
    });

    test("should handle edge cases", () => {
      expect(extractOriginalWord("")).toBe("");
      expect(extractOriginalWord("punctuation{}")).toBe("");
      expect(extractOriginalWord("punctuation{")).toBe("punctuation{");
      expect(extractOriginalWord("punctuation}")).toBe("punctuation}");
      expect(extractOriginalWord("not-punctuation{word}")).toBe("not-punctuation{word}");
    });

    test("should handle nested braces correctly", () => {
      expect(extractOriginalWord("punctuation{word{nested}}")).toBe("word{nested}");
      expect(extractOriginalWord("punctuation{word}extra")).toBe("punctuation{word}extra");
    });
  });

  describe("isPunctuationProcessed", () => {
    test("should return true for punctuation-processed words", () => {
      expect(isPunctuationProcessed("punctuation{hello,}")).toBe(true);
      expect(isPunctuationProcessed("punctuation{world!}")).toBe(true);
      expect(isPunctuationProcessed("punctuation{test?}")).toBe(true);
      expect(isPunctuationProcessed("punctuation{word.}")).toBe(true);
    });

    test("should return false for non-processed words", () => {
      expect(isPunctuationProcessed("hello")).toBe(false);
      expect(isPunctuationProcessed("world")).toBe(false);
      expect(isPunctuationProcessed("don't")).toBe(false);
      expect(isPunctuationProcessed("test,")).toBe(false);
    });

    test("should return false for malformed punctuation format", () => {
      expect(isPunctuationProcessed("punctuation{")).toBe(false);
      expect(isPunctuationProcessed("punctuation}")).toBe(false);
      expect(isPunctuationProcessed("punctuation{}")).toBe(true); // This is valid but empty
      expect(isPunctuationProcessed("{word}")).toBe(false);
      expect(isPunctuationProcessed("not-punctuation{word}")).toBe(false);
    });

    test("should handle edge cases", () => {
      expect(isPunctuationProcessed("")).toBe(false);
      expect(isPunctuationProcessed(" ")).toBe(false);
      expect(isPunctuationProcessed("punctuation{word}extra")).toBe(false);
    });
  });

  describe("integration tests", () => {
    test("should handle full punctuation processing workflow", () => {
      const word = "hello,";
      
      // Check if it has non-alphabetic characters
      expect(hasNonAlphabeticCharacters(word)).toBe(true);
      
      // Process the word
      const processed = handleWordPunctuation(word);
      expect(processed).toBe("punctuation{hello,}");
      
      // Check if it's in processed format
      expect(isPunctuationProcessed(processed)).toBe(true);
      
      // Extract original word
      const extracted = extractOriginalWord(processed);
      expect(extracted).toBe(word);
    });

    test("should handle words that don't need processing", () => {
      const word = "hello";
      
      // Check if it has non-alphabetic characters
      expect(hasNonAlphabeticCharacters(word)).toBe(false);
      
      // Process the word (should remain unchanged)
      const processed = handleWordPunctuation(word);
      expect(processed).toBe(word);
      
      // Check if it's in processed format (should be false)
      expect(isPunctuationProcessed(processed)).toBe(false);
      
      // Extract original word (should be unchanged)
      const extracted = extractOriginalWord(processed);
      expect(extracted).toBe(word);
    });

    test("should handle contractions and compound words correctly", () => {
      const contractions = ["don't", "can't", "it's", "I'm", "you're"];
      const compounds = ["hello-world", "self-care", "mother-in-law", "state-of-the-art"];
      
      // Contractions should now be processed as punctuation
      contractions.forEach(word => {
        expect(hasNonAlphabeticCharacters(word)).toBe(true);
        expect(handleWordPunctuation(word)).toBe(`punctuation{${word}}`);
        expect(isPunctuationProcessed(handleWordPunctuation(word))).toBe(true);
      });
      
      // Compound words with hyphens should still not be processed
      compounds.forEach(word => {
        expect(hasNonAlphabeticCharacters(word)).toBe(false);
        expect(handleWordPunctuation(word)).toBe(word);
        expect(isPunctuationProcessed(word)).toBe(false);
      });
    });
  });
});

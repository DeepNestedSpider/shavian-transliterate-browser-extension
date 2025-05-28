import { expect, test, describe } from "bun:test";
import { handleWordPunctuation, extractOriginalWord, isPunctuationProcessed } from "../src/core/punctuationHandler";
import { ReadlexiconEngine } from "../src/core/transliterationEngine";

describe("Punctuation Handling Demonstration", () => {
  test("should demonstrate punctuation{word} replacement behavior", () => {
    console.log("\n=== Punctuation Handling Demo ===");
    
    const testWords = [
      "hello",        // Pure alphabetic - no replacement
      "hello,",       // With comma - gets replaced
      "world!",       // With exclamation - gets replaced
      "don't",        // With apostrophe - gets replaced
      "hello-world",  // With hyphen - NO replacement (compound words allowed)
      "test?!",       // Multiple punctuation - gets replaced
      "word123",      // With numbers - gets replaced
      "$money",       // With special chars - gets replaced
    ];

    testWords.forEach(word => {
      const result = handleWordPunctuation(word);
      const wasProcessed = isPunctuationProcessed(result);
      
      console.log(`"${word}" → "${result}" ${wasProcessed ? "(REPLACED)" : "(unchanged)"}`);
      
      if (wasProcessed) {
        const extracted = extractOriginalWord(result);
        console.log(`  Can extract back: "${extracted}"`);
        expect(extracted).toBe(word);
      }
    });
  });

  test("should demonstrate transliteration engine behavior with punctuation", () => {
    console.log("\n=== Transliteration Engine Integration ===");
    
    // Create a simple engine for demonstration
    const testDict = {
      "hello": "𐑣𐑧𐑤𐑴",
      "world": "𐑢𐑻𐑤𐑛",
      "test": "𐑑𐑧𐑕𐑑"
    };
    const engine = new ReadlexiconEngine(testDict);

    const testCases = [
      "hello",     // Normal word - gets translated
      "hello,",    // Word with punctuation - gets punctuation{} treatment
      "world!",    // Word with punctuation - gets punctuation{} treatment
      "test",      // Normal word - gets translated
      "test.",     // Word with punctuation - gets punctuation{} treatment
    ];

    testCases.forEach(word => {
      const result = engine.transliterateWord(word);
      console.log(`"${word}" → "${result}"`);
      
      if (isPunctuationProcessed(result)) {
        console.log(`  ↳ This is literally replaced with the string "punctuation{${word}}"`);
      } else {
        console.log(`  ↳ This word was normally transliterated`);
      }
    });
  });

  test("should demonstrate sentence-level punctuation handling", () => {
    console.log("\n=== Sentence-Level Handling ===");
    
    const testDict = {
      "hello": "𐑣𐑧𐑤𐑴",
      "world": "𐑢𐑻𐑤𐑛",
      "how": "𐑣𐑬",
      "are": "𐑸",
      "you": "𐑿"
    };
    const engine = new ReadlexiconEngine(testDict);

    const sentence = "Hello, world! How are you?";
    const result = engine.transliterate(sentence);
    
    console.log(`Input:  "${sentence}"`);
    console.log(`Output: "${result}"`);
    console.log(`\nExplanation:`);
    console.log(`- "Hello," becomes transliterated word + punctuation`);
    console.log(`- "world!" becomes transliterated word + punctuation`);
    console.log(`- "How", "are" get normally transliterated`);
    console.log(`- "you?" becomes transliterated word + punctuation`);

    // Verify specific parts
    expect(result).toContain("𐑣𐑧𐑤𐑴,"); // "Hello," with punctuation preserved
    expect(result).toContain("𐑢𐑻𐑤𐑛!"); // "world!" with punctuation preserved
    expect(result).toContain("𐑣𐑬"); // "How" transliterated
    expect(result).toContain("𐑸");  // "are" transliterated
    expect(result).toContain("𐑿?"); // "you?" - "you" transliterated to "𐑿" with punctuation preserved
  });

  test("should demonstrate reverse transliteration extracting original words", () => {
    console.log("\n=== Reverse Transliteration ===");
    
    const testDict = {
      "hello": "𐑣𐑧𐑤𐑴",
      "world": "𐑢𐑻𐑤𐑛"
    };
    const engine = new ReadlexiconEngine(testDict);

    const punctuationFormats = [
      "punctuation{hello,}",
      "punctuation{world!}",
      "punctuation{test?}",
      "𐑣𐑧𐑤𐑴", // Normal Shavian
    ];

    punctuationFormats.forEach(format => {
      const result = engine.reverseTransliterateWord(format);
      console.log(`"${format}" → "${result}"`);
      
      if (isPunctuationProcessed(format)) {
        console.log(`  ↳ Extracted original from punctuation{} format`);
      } else {
        console.log(`  ↳ Normal reverse transliteration`);
      }
    });
  });
});

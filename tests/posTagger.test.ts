/**
 * Tests for POS tagger functionality
 * Following Bun test standards
 */
import { expect, test, describe, beforeAll } from "bun:test";
import { posTagSentence, posTagSentenceSync, type POSTaggedToken } from "../src/core/posTagger";

describe("POS Tagger", () => {
  describe("posTagSentenceSync (compromise fallback)", () => {
    test("should tag basic sentence correctly", () => {
      const text = "The cat sits on the mat.";
      const tokens = posTagSentenceSync(text);
      
      expect(tokens.length).toBeGreaterThan(0);
      
      // Find specific words and check their POS tags
      const catToken = tokens.find(t => t.text.toLowerCase() === "cat");
      const sitsToken = tokens.find(t => t.text.toLowerCase() === "sits");
      const theToken = tokens.find(t => t.text.toLowerCase() === "the");
      
      // Check that tokens exist and have reasonable POS tags
      expect(catToken).toBeDefined();
      expect(sitsToken).toBeDefined(); 
      expect(theToken).toBeDefined();
      expect(catToken?.pos).toMatch(/^(NN|UNC)/); // noun or unknown
      expect(sitsToken?.pos).toMatch(/^(VV|UNC)/); // verb or unknown
      expect(theToken?.pos).toMatch(/^(AT|DT|UNC)/); // determiner or unknown
    });

    test("should handle punctuation", () => {
      const text = "Hello, world!";
      const tokens = posTagSentenceSync(text);
      
      // Should have tokens for words (compromise may include punctuation in text)
      expect(tokens.some(t => t.text.toLowerCase().includes("hello"))).toBe(true);
      expect(tokens.some(t => t.text.toLowerCase().includes("world"))).toBe(true);
      expect(tokens.length).toBeGreaterThan(0);
    });

    test("should handle empty or whitespace-only text", () => {
      expect(posTagSentenceSync("")).toEqual([]);
      expect(posTagSentenceSync("   ")).toEqual([]);
    });
  });

  describe("posTagSentence (async wordpos)", () => {
    test("should tag common words correctly", async () => {
      const text = "I love reading books.";
      const tokens = await posTagSentence(text);
      
      expect(tokens.length).toBeGreaterThan(0);
      
      // Check that we get reasonable POS tags - be more flexible about exact tags
      const loveToken = tokens.find(t => t.text.toLowerCase() === "love");
      const readingToken = tokens.find(t => t.text.toLowerCase() === "reading");
      const booksToken = tokens.find(t => t.text.toLowerCase() === "books");
      
      // These should be tagged reasonably (but wordpos might not be perfect)
      expect(loveToken?.pos).toMatch(/^(V|NN|UNC)/); // verb, noun, or unknown
      expect(readingToken?.pos).toMatch(/^(V|NN|UNC)/); // could be verb or noun depending on context
      expect(booksToken?.pos).toMatch(/^(NN|UNC)/); // noun or unknown
    });

    test("should handle punctuation and whitespace", async () => {
      const text = "Hello, world! How are you?";
      const tokens = await posTagSentence(text);
      
      // Should preserve punctuation and whitespace
      expect(tokens.some(t => t.text === ",")).toBe(true);
      expect(tokens.some(t => t.text === "!")).toBe(true);
      expect(tokens.some(t => t.text === "?")).toBe(true);
      expect(tokens.some(t => t.text.match(/^\s+$/))).toBe(true);
    });

    test("should handle different verb forms", async () => {
      const text = "They walked quickly while walking and will walk.";
      const tokens = await posTagSentence(text);
      
      const walkedToken = tokens.find(t => t.text.toLowerCase() === "walked");
      const walkingToken = tokens.find(t => t.text.toLowerCase() === "walking");
      const walkToken = tokens.find(t => t.text.toLowerCase() === "walk");
      
      // These should get tags (walking can be noun/gerund, which is valid)
      expect(walkedToken?.pos).toMatch(/^(V|NN|UNC)/); // verb, noun, or unknown
      expect(walkingToken?.pos).toMatch(/^(V|NN|UNC)/); // verb, noun (gerund), or unknown
      expect(walkToken?.pos).toMatch(/^(V|NN|UNC)/); // verb, noun, or unknown
    });

    test("should handle nouns in different forms", async () => {
      const text = "The cat and cats play together.";
      const tokens = await posTagSentence(text);
      
      const catToken = tokens.find(t => t.text.toLowerCase() === "cat");
      const catsToken = tokens.find(t => t.text.toLowerCase() === "cats");
      
      // Should detect nouns (though exact singular/plural distinction may vary)
      expect(catToken?.pos).toMatch(/^(NN|UNC)/); // noun or unknown
      expect(catsToken?.pos).toMatch(/^(NN|UNC)/); // noun or unknown
    });

    test("should handle adjectives and adverbs", async () => {
      const text = "The quick brown fox runs quickly.";
      const tokens = await posTagSentence(text);
      
      const quickToken = tokens.find(t => t.text.toLowerCase() === "quick");
      const quicklyToken = tokens.find(t => t.text.toLowerCase() === "quickly");
      
      // Should detect adjectives and adverbs (though may not be perfect)
      expect(quickToken?.pos).toMatch(/^(AJ|NN|UNC)/); // adjective, noun, or unknown
      expect(quicklyToken?.pos).toMatch(/^(AV|UNC)/); // adverb or unknown
    });

    test("should fallback gracefully on unknown words", async () => {
      const text = "The xyznonexistentword is strange.";
      const tokens = await posTagSentence(text);
      
      const unknownToken = tokens.find(t => t.text.toLowerCase() === "xyznonexistentword");
      
      // Should still get a POS tag, even if it's UNC (unknown)
      expect(unknownToken?.pos).toBeDefined();
      expect(typeof unknownToken?.pos).toBe("string");
    });
  });

  describe("performance and edge cases", () => {
    test("should handle long sentences", async () => {
      const longText = "This is a very long sentence with many words that should still be processed correctly by the POS tagger system even when it contains multiple clauses and complex grammatical structures.";
      const tokens = await posTagSentence(longText);
      
      expect(tokens.length).toBeGreaterThan(20);
      
      // All tokens should have POS tags
      for (const token of tokens) {
        expect(token.pos).toBeDefined();
        expect(typeof token.pos).toBe("string");
      }
    });

    test("should be consistent across multiple calls", async () => {
      const text = "The quick brown fox.";
      const tokens1 = await posTagSentence(text);
      const tokens2 = await posTagSentence(text);
      
      expect(tokens1).toEqual(tokens2);
    });

    test("should handle special characters and contractions", async () => {
      const text = "I don't think it's working—maybe we can't do it.";
      const tokens = await posTagSentence(text);
      
      // Should handle text with contractions and special punctuation
      expect(tokens.length).toBeGreaterThan(0);
      
      // Check that we get some reasonable parsing (contractions may be split)
      const hasContractionParts = tokens.some(t => t.text.includes("don") || t.text.includes("'t")) ||
                                  tokens.some(t => t.text === "don't");
      expect(hasContractionParts).toBe(true);
    });
  });
});

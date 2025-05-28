/**
 * Tests for quote handling in the transliteration engine
 */
import { expect, test, describe } from "bun:test";
import { ReadlexiconTransliterator } from "../src/readlexiconTransliterator";

describe("Quote Handling", () => {
  // Initialize the transliterator
  const transliterator = new ReadlexiconTransliterator();

  test("should convert double quotes to angle brackets", async () => {
    const result1 = await transliterator.transliterate('"Hello world"');
    expect(result1).toContain('‹');
    expect(result1).toContain('›');
    
    // Test with different types of double quotes
    const result2 = await transliterator.transliterate('"Hello"');
    expect(result2).toContain('‹');
    expect(result2).toContain('›');
    
    const result3 = await transliterator.transliterate('"Hello"');
    expect(result3).toContain('‹');
    expect(result3).toContain('›');
  });

  test("should convert single quotes to angle brackets", async () => {
    const result1 = await transliterator.transliterate("'Hello world'");
    expect(result1).toContain('‹');
    expect(result1).toContain('›');
    
    // Test with different types of single quotes
    const result2 = await transliterator.transliterate("'Hello'");
    expect(result2).toContain('‹');
    expect(result2).toContain('›');
    
    const result3 = await transliterator.transliterate("'Hello'");
    expect(result3).toContain('‹');
    expect(result3).toContain('›');
  });

  test("should convert quotes in mixed text", async () => {
    const text = 'He said, "Hello" and then added, "How are you?"';
    const transliterated = await transliterator.transliterate(text);
    
    // Should have 4 angle brackets in total (2 pairs)
    const angleBracketCount = (transliterated.match(/[‹›]/g) || []).length;
    expect(angleBracketCount).toBe(4);
  });

  test("should handle nested quotes", async () => {
    const text = 'She said, "He told me \'Hello\' yesterday"';
    const transliterated = await transliterator.transliterate(text);
    
    // Should have 4 angle brackets in total (2 pairs)
    const angleBracketCount = (transliterated.match(/[‹›]/g) || []).length;
    expect(angleBracketCount).toBe(4);
  });

  test("should reverse transliterate angle brackets back to quotes", async () => {
    const shavianText = '𐑖𐑰 𐑕𐑧𐑛, ‹𐑣𐑧𐑤𐑴›';
    const latinText = await transliterator.reverseTransliterate(shavianText);
    
    // Should contain double quotes
    expect(latinText).toContain('"');
    
    // Should not contain angle brackets
    expect(latinText).not.toContain('‹');
    expect(latinText).not.toContain('›');
  });

  test("should handle complex real-world examples with quotes", async () => {
    const text = 'He exclaimed, "What a beautiful day! Isn\'t it lovely?" Then she replied, "Yes, it\'s wonderful!"';
    const transliterated = await transliterator.transliterate(text);
    
    // Count opening and closing brackets to ensure they're balanced
    const openingBrackets = (transliterated.match(/‹/g) || []).length;
    const closingBrackets = (transliterated.match(/›/g) || []).length;
    
    expect(openingBrackets).toBe(2); // Two opening quotes
    expect(closingBrackets).toBe(2); // Two closing quotes
    
    // Check if the order is correct - opening should come before closing
    const firstOpeningIndex = transliterated.indexOf('‹');
    const firstClosingIndex = transliterated.indexOf('›');
    const secondOpeningIndex = transliterated.indexOf('‹', firstClosingIndex);
    const secondClosingIndex = transliterated.indexOf('›', secondOpeningIndex);
    
    expect(firstOpeningIndex).toBeLessThan(firstClosingIndex);
    expect(secondOpeningIndex).toBeLessThan(secondClosingIndex);
  });
});

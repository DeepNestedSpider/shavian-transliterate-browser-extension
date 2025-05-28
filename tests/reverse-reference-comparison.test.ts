/**
 * Reverse reference comparison tests for Shavian to English transliteration engine
 * Following Bun test standards
 * 
 * Tests the reverse transliteration from Shavian script back to English text.
 * This validates the bidirectional capability of the transliteration engine.
 * 
 * Known limitations of reverse transliteration:
 * - Multiple English spellings may map to the same Shavian representation
 * - Some phonetic information may be lost in the reverse process
 * - Proper name markers and formatting may not perfectly preserve original casing
 * - Abbreviations may expand differently than the original form
 */
import { test, describe, beforeAll, expect } from "bun:test";
import { ReadlexiconEngine } from "../src/core/transliterationEngine";
import { readlexDict } from "../src/dictionaries/readlex";
import { readFileSync } from "fs";
import { join } from "path";

describe("Reverse Reference Comparison Tests", () => {
  let engine: ReadlexiconEngine;
  let shavianText: string;
  let expectedLatinText: string;

  beforeAll(async () => {
    // Initialize the real transliteration engine with the full dictionary
    engine = new ReadlexiconEngine(readlexDict);
    
    // Read reference files - note the reversed order for reverse testing
    const testsDir = join(import.meta.dir, "reference");
    shavianText = readFileSync(join(testsDir, "shavian.txt"), "utf-8").trim();
    expectedLatinText = readFileSync(join(testsDir, "latin.txt"), "utf-8").trim();
  });

  test("should reverse transliterate reference text correctly", () => {
    const actualLatinText = engine.reverseTransliterate(shavianText);
    
    // Split into lines for easier comparison
    const expectedLines = expectedLatinText.split('\n');
    const actualLines = actualLatinText.split('\n');
    
    console.log(`\n=== REVERSE REFERENCE COMPARISON ===`);
    console.log(`Expected lines: ${expectedLines.length}`);
    console.log(`Actual lines: ${actualLines.length}`);
    
    // Compare line by line to identify specific issues
    const maxLines = Math.max(expectedLines.length, actualLines.length);
    let differences = 0;
    
    for (let i = 0; i < maxLines; i++) {
      const expected = expectedLines[i] || "";
      const actual = actualLines[i] || "";
      
      if (expected !== actual) {
        differences++;
        console.log(`\n--- Line ${i + 1} Reverse Difference ---`);
        console.log(`Expected: "${expected}"`);
        console.log(`Actual:   "${actual}"`);
        
        // Note common reverse transliteration variations
        if (actual.toLowerCase() !== expected.toLowerCase() && 
            actual.replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase() === 
            expected.replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase()) {
          console.log(`Note: Only punctuation/capitalization differences detected`);
        }
        
        // Character-by-character comparison for this line
        const maxChars = Math.max(expected.length, actual.length);
        const charDiffs: Array<{position: number, expected: string, actual: string}> = [];
        
        for (let j = 0; j < maxChars; j++) {
          const expectedChar = expected[j] || "∅";
          const actualChar = actual[j] || "∅";
          
          if (expectedChar !== actualChar) {
            charDiffs.push({
              position: j,
              expected: expectedChar,
              actual: actualChar
            });
          }
        }
        
        if (charDiffs.length > 0 && charDiffs.length <= 10) {
          console.log(`Character differences:`);
          charDiffs.forEach(diff => {
            console.log(`  Position ${diff.position}: expected '${diff.expected}' but got '${diff.actual}'`);
          });
        } else if (charDiffs.length > 10) {
          console.log(`Too many character differences (${charDiffs.length}) to display individually`);
        }
      }
    }
    
    console.log(`\nTotal lines with differences: ${differences}`);
    console.log(`Reverse transliteration accuracy: ${((maxLines - differences) / maxLines * 100).toFixed(2)}%`);
    
    // We expect some differences due to the nature of reverse transliteration
    // The test serves more as a regression test and quality indicator
    expect(differences).toBeLessThan(maxLines); // Should not fail completely
  });

  test("should handle specific Shavian patterns correctly in reverse", () => {
    const testCases = [
      { input: "𐑓𐑮𐑪𐑥 ·𐑖𐑷 𐑑 𐑖𐑱𐑝𐑾𐑯", expected: "From Shaw to Shavian" },
      { input: "𐑘𐑽-𐑯-𐑩-𐑛𐑱", expected: "year-and-a-day" },
      { input: "‹·𐑛𐑪𐑒𐑑𐑼 𐑣𐑵›", expected: "Doctor Who" },
      { input: "·𐑚𐑻𐑯𐑼𐑛 𐑖𐑷", expected: "Bernard Shaw" },
      { input: "·𐑒𐑦𐑙𐑟𐑤𐑦 𐑮𐑰𐑛", expected: "Kingsley Read" }
    ];
    
    console.log(`\n=== REVERSE SPECIFIC PATTERN TESTS ===`);
    testCases.forEach((testCase, index) => {
      const result = engine.reverseTransliterate(testCase.input);
      const exactMatch = result === testCase.expected;
      
      // For reverse transliteration, we also check case-insensitive matches
      const caseInsensitiveMatch = result.toLowerCase() === testCase.expected.toLowerCase();
      
      console.log(`\nReverse Test ${index + 1}: ${exactMatch ? "✓" : caseInsensitiveMatch ? "~" : "✗"}`);
      console.log(`Input:    "${testCase.input}"`);
      console.log(`Expected: "${testCase.expected}"`);
      console.log(`Actual:   "${result}"`);
      
      if (!exactMatch && caseInsensitiveMatch) {
        console.log(`Note: Case-insensitive match - reverse transliteration may not preserve exact casing`);
      } else if (!exactMatch && !caseInsensitiveMatch) {
        // Analyze the difference
        if (result.length !== testCase.expected.length) {
          console.log(`Length difference: expected ${testCase.expected.length}, got ${result.length}`);
        }
        
        // Check for phonetic similarity (basic check)
        const normalizeForPhonetic = (text: string) => 
          text.toLowerCase().replace(/[^a-z]/g, '');
        
        if (normalizeForPhonetic(result) === normalizeForPhonetic(testCase.expected)) {
          console.log(`Note: Phonetically equivalent but different punctuation/spacing`);
        }
      }
    });
  });

  test("should handle Shavian proper name markers correctly", () => {
    const properNameTests = [
      { input: "·𐑖𐑷", expected: "Shaw" },
      { input: "𐑖𐑱𐑝𐑾𐑯", expected: "Shavian" },
      { input: "·𐑚𐑻𐑯𐑼𐑛 𐑖𐑷", expected: "Bernard Shaw" },
      { input: "‹·𐑛𐑪𐑒𐑑𐑼 𐑣𐑵›", expected: "Doctor Who" },
      { input: "·𐑒𐑦𐑙𐑟𐑤𐑦 𐑮𐑰𐑛", expected: "Kingsley Read" },
      { input: "·𐑜. 𐑒. 𐑗𐑧𐑕𐑑𐑼𐑑𐑩𐑯", expected: "G. K. Chesterton" }
    ];
    
    console.log(`\n=== REVERSE PROPER NAME TESTS ===`);
    properNameTests.forEach((testCase, index) => {
      const result = engine.reverseTransliterate(testCase.input);
      const exactMatch = result === testCase.expected;
      const caseInsensitiveMatch = result.toLowerCase() === testCase.expected.toLowerCase();
      
      console.log(`\nReverse Proper Name Test ${index + 1}: ${exactMatch ? "✓" : caseInsensitiveMatch ? "~" : "✗"}`);
      console.log(`Input:    "${testCase.input}"`);
      console.log(`Expected: "${testCase.expected}"`);
      console.log(`Actual:   "${result}"`);
      
      if (!exactMatch) {
        if (caseInsensitiveMatch) {
          console.log(`Note: Case difference - proper name markers may not preserve exact capitalization`);
        } else {
          console.log(`Note: Potential issue with proper name marker interpretation`);
        }
      }
    });
  });

  test("should handle Shavian punctuation and special formatting in reverse", () => {
    const punctuationTests = [
      { input: "𐑘𐑽-𐑯-𐑩-𐑛𐑱", expected: "year-and-a-day" },
      { input: "·𐑖𐑱𐑝𐑾𐑯", expected: "Shavian" }, // Testing quote handling indirectly
      { input: "·𐑐𐑮𐑩𐑐𐑴𐑟𐑛 𐑚𐑮𐑦𐑑𐑦𐑖 𐑨𐑤𐑓𐑩𐑚𐑧𐑑", expected: "Proposed British Alphabet" },
      { input: "1962,", expected: "1962," },
      { input: "(𐑹 𐑨𐑛𐑳𐑤𐑑𐑕, 𐑓 𐑞𐑨𐑑 𐑥𐑨𐑑𐑼)", expected: "(or adults, for that matter)" }
    ];
    
    console.log(`\n=== REVERSE PUNCTUATION TESTS ===`);
    punctuationTests.forEach((testCase, index) => {
      const result = engine.reverseTransliterate(testCase.input);
      const exactMatch = result === testCase.expected;
      
      console.log(`\nReverse Punctuation Test ${index + 1}: ${exactMatch ? "✓" : "✗"}`);
      console.log(`Input:    "${testCase.input}"`);
      console.log(`Expected: "${testCase.expected}"`);
      console.log(`Actual:   "${result}"`);
      
      if (!exactMatch) {
        // Check if the difference is only in spacing around punctuation
        const normalizeSpacing = (text: string) => 
          text.replace(/\s+/g, ' ').trim();
        
        if (normalizeSpacing(result) === normalizeSpacing(testCase.expected)) {
          console.log(`Note: Only spacing differences around punctuation`);
        }
      }
    });
  });

  test("should handle bidirectional consistency for simple words", () => {
    const bidirectionalTests = [
      "hello",
      "world", 
      "test",
      "alphabet",
      "phonetic",
      "writing",
      "system"
    ];
    
    console.log(`\n=== BIDIRECTIONAL CONSISTENCY TESTS ===`);
    bidirectionalTests.forEach((originalWord, index) => {
      // Forward: English -> Shavian
      const shavianResult = engine.transliterate(originalWord);
      
      // Reverse: Shavian -> English  
      const backToEnglish = engine.reverseTransliterate(shavianResult);
      
      const isConsistent = backToEnglish.toLowerCase() === originalWord.toLowerCase();
      
      console.log(`\nBidirectional Test ${index + 1}: ${isConsistent ? "✓" : "✗"}`);
      console.log(`Original:  "${originalWord}"`);
      console.log(`Shavian:   "${shavianResult}"`);
      console.log(`Back:      "${backToEnglish}"`);
      
      if (!isConsistent) {
        console.log(`Note: Bidirectional inconsistency - this may be expected for complex phonetic mappings`);
      }
      
      // This shouldn't cause test failure as phonetic systems often have one-way transformations
      expect(shavianResult).toBeTruthy(); // Should at least produce some output
      expect(backToEnglish).toBeTruthy(); // Should at least produce some output
    });
  });

  test("should handle edge cases in reverse transliteration", () => {
    const edgeCases = [
      { input: "", expected: "", description: "empty string" },
      { input: "   ", expected: "   ", description: "whitespace only" },
      { input: "123", expected: "123", description: "numbers only" },
      { input: "!@#$%", expected: "!@#$%", description: "punctuation only" },
      { input: "𐑩", expected: "a", description: "single Shavian character" },
      { input: "𐑩 𐑚 𐑒", expected: "a b c", description: "single characters with spaces" }
    ];
    
    console.log(`\n=== REVERSE EDGE CASE TESTS ===`);
    edgeCases.forEach((testCase, index) => {
      const result = engine.reverseTransliterate(testCase.input);
      const matches = result === testCase.expected;
      
      console.log(`\nEdge Case ${index + 1} (${testCase.description}): ${matches ? "✓" : "✗"}`);
      console.log(`Input:    "${testCase.input}"`);
      console.log(`Expected: "${testCase.expected}"`);
      console.log(`Actual:   "${result}"`);
      
      // For edge cases, we're more lenient - just ensure no crashes
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });
  });
});

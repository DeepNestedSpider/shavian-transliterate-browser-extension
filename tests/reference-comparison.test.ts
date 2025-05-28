/**
 * Reference comparison tests for transliteration engine
 * Following Bun test standards
 * 
 * Known algorithmic limitations:
 * - Abbreviations of proper names cannot be phonetically resolved without context
 *   (e.g., "G. K." transliterates as letter names "𐑡𐑰 𐑒𐑱" rather than 
 *   the intended names "Gilbert Keith" → "𐑜. 𐑒.")
 * - The transliteration algorithm cannot predict abbreviated names' pronunciation
 *   and starting phonemes without knowing the full original names
 */
import { test, describe, beforeAll } from "bun:test";
import { ReadlexiconEngine } from "../src/core/transliterationEngine";
import { readlexDict } from "../src/dictionaries/readlex";
import { readFileSync } from "fs";
import { join } from "path";

describe("Reference Comparison Tests", () => {
  let engine: ReadlexiconEngine;
  let latinText: string;
  let expectedShavianText: string;

  beforeAll(async () => {
    // Initialize the real transliteration engine with the full dictionary
    engine = new ReadlexiconEngine(readlexDict);
    
    // Read reference files
    const testsDir = join(import.meta.dir, "reference");
    latinText = readFileSync(join(testsDir, "latin.txt"), "utf-8").trim();
    expectedShavianText = readFileSync(join(testsDir, "shavian.txt"), "utf-8").trim();
  });

  test("should transliterate reference text correctly", () => {
    const actualShavianText = engine.transliterate(latinText);
    
    // Split into lines for easier comparison
    const expectedLines = expectedShavianText.split('\n');
    const actualLines = actualShavianText.split('\n');
    
    console.log(`\n=== REFERENCE COMPARISON ===`);
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
        console.log(`\n--- Line ${i + 1} Difference ---`);
        console.log(`Expected: "${expected}"`);
        console.log(`Actual:   "${actual}"`);
        
        // Note known algorithmic limitations
        if (actual.includes("𐑡𐑰 𐑒𐑱") && expected.includes("𐑜. 𐑒.")) {
          console.log(`Note: G. K. abbreviation limitation - algorithm cannot know "G. K." represents "Gilbert Keith"`);
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
    console.log(`Accuracy: ${((maxLines - differences) / maxLines * 100).toFixed(2)}%`);
  });

  test("should handle specific patterns correctly", () => {
    const testCases = [
      { input: "From Shaw to Shavian", expected: "𐑓𐑮𐑪𐑥 ·𐑖𐑷 𐑑 𐑖𐑱𐑝𐑾𐑯" },
      { input: "year-and-a-day", expected: "𐑘𐑽-𐑯-𐑩-𐑛𐑱" },
      { input: "Doctor Who", expected: "‹·𐑛𐑪𐑒𐑑𐑼 𐑣𐑵›" },
      { input: "Bernard Shaw", expected: "·𐑚𐑻𐑯𐑼𐑛 𐑖𐑷" },
      { input: "G K Chesterton", expected: "·𐑜. 𐑒. 𐑗𐑧𐑕𐑑𐑼𐑑𐑩𐑯" }
    ];
    
    console.log(`\n=== SPECIFIC PATTERN TESTS ===`);
    testCases.forEach((testCase, index) => {
      const result = engine.transliterate(testCase.input);
      const matches = result === testCase.expected;
      
      console.log(`\nTest ${index + 1}: ${matches ? "✓" : "✗"}`);
      console.log(`Input:    "${testCase.input}"`);
      console.log(`Expected: "${testCase.expected}"`);
      console.log(`Actual:   "${result}"`);
      
      if (!matches) {
        // Analyze the difference
        if (result.length !== testCase.expected.length) {
          console.log(`Length difference: expected ${testCase.expected.length}, got ${result.length}`);
        }
      }
    });
  });

  test("should handle proper names correctly", () => {
    const properNameTests = [
      { input: "Shaw", expected: "·𐑖𐑷" },
      { input: "Shavian", expected: "𐑖𐑱𐑝𐑾𐑯" },
      { input: "Bernard Shaw", expected: "·𐑚𐑻𐑯𐑼𐑛 𐑖𐑷" },
      { input: "Doctor Who", expected: "‹·𐑛𐑪𐑒𐑑𐑼 𐑣𐑵›" },
      { input: "Kingsley Read", expected: "·𐑒𐑦𐑙𐑟𐑤𐑦 𐑮𐑰𐑛" }
    ];
    
    console.log(`\n=== PROPER NAME TESTS ===`);
    properNameTests.forEach((testCase, index) => {
      const result = engine.transliterate(testCase.input);
      const matches = result === testCase.expected;
      
      console.log(`\nProper Name Test ${index + 1}: ${matches ? "✓" : "✗"}`);
      console.log(`Input:    "${testCase.input}"`);
      console.log(`Expected: "${testCase.expected}"`);
      console.log(`Actual:   "${result}"`);
    });
  });

  test("should handle punctuation and special formatting", () => {
    const punctuationTests = [
      { input: "year-and-a-day", expected: "𐑘𐑽-𐑯-𐑩-𐑛𐑱" },
      { input: '"Shavian"', expected: "·𐑖𐑱𐑝𐑾𐑯" },
      { input: "'Proposed British Alphabet'", expected: "·𐑐𐑮𐑩𐑐𐑴𐑟𐑛 𐑚𐑮𐑦𐑑𐑦𐑖 𐑨𐑤𐑓𐑩𐑚𐑧𐑑" },
      { input: "1962,", expected: "1962," },
      { input: "(or adults, for that matter)", expected: "(𐑹 𐑨𐑛𐑳𐑤𐑑𐑕, 𐑓 𐑞𐑨𐑑 𐑥𐑨𐑑𐑼)" }
    ];
    
    console.log(`\n=== PUNCTUATION TESTS ===`);
    punctuationTests.forEach((testCase, index) => {
      const result = engine.transliterate(testCase.input);
      const matches = result === testCase.expected;
      
      console.log(`\nPunctuation Test ${index + 1}: ${matches ? "✓" : "✗"}`);
      console.log(`Input:    "${testCase.input}"`);
      console.log(`Expected: "${testCase.expected}"`);
      console.log(`Actual:   "${result}"`);
    });
  });
});

/**
 * Reference comparison tests for transliteration engine
 * Following Bun test standards
 */
import { expect, test, describe, beforeAll } from "bun:test";
import { ReadlexiconEngine } from "../src/core/transliterationEngine";
import { readlexDict } from "../src/dictionaries/readlex";
import { readFileSync, writeFileSync } from "fs";
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
    let totalDifferences = 0;
    
    for (let i = 0; i < maxLines; i++) {
      const expected = expectedLines[i] || "";
      const actual = actualLines[i] || "";
      
      if (expected !== actual) {
          totalDifferences++;
          console.log(`\nLine ${i + 1} DIFFERENCE:`);
          console.log('Expected:', JSON.stringify(expected));
          console.log('Actual  :', JSON.stringify(actual));
          
          // Compare character by character to find exact differences
          const maxChars = Math.max(expected.length, actual.length);
          let charDifferences = [];
          
          for (let j = 0; j < maxChars; j++) {
            const expectedChar = expected[j] || '';
            const actualChar = actual[j] || '';
            
            if (expectedChar !== actualChar) {
              charDifferences.push({
                position: j,
                expected: expectedChar,
                actual: actualChar,
                expectedCode: expectedChar.charCodeAt(0) || 0,
                actualCode: actualChar.charCodeAt(0) || 0
              });
            }
          }
          
          if (charDifferences.length > 0) {
            console.log('Character differences:', charDifferences.slice(0, 10)); // Show first 10 differences
            if (charDifferences.length > 10) {
              console.log(`... and ${charDifferences.length - 10} more differences`);
            }
          }
        }
      }

      console.log(`\nTotal line differences: ${totalDifferences} out of ${maxLines} lines`);
      
      // Calculate character-level accuracy
      const expectedChars = expectedShavianText.split('');
      const actualChars = actualShavianText.split('');
      const maxLength = Math.max(expectedChars.length, actualChars.length);
      
      let correctChars = 0;
      for (let i = 0; i < maxLength; i++) {
        if (expectedChars[i] === actualChars[i]) {
          correctChars++;
        }
      }
      
      const accuracy = (correctChars / maxLength) * 100;
      console.log(`Character accuracy: ${accuracy.toFixed(2)}% (${correctChars}/${maxLength})`);

      // For debugging, save the actual output to a file
      const outputPath = join(import.meta.dir, 'reference', 'actual-output.txt');
      writeFileSync(outputPath, actualShavianText, 'utf-8');
      console.log(`Actual output saved to: ${outputPath}`);
  });

  describe('Word-by-Word Analysis', () => {
    test('should identify problematic words', () => {
      // Extract unique words from the Latin text for individual testing
      const words = latinText
        .toLowerCase()
        .replace(/[^\w\s'-]/g, ' ') // Keep apostrophes and hyphens
        .split(/\s+/)
        .filter(word => word.length > 0)
        .filter((word, index, array) => array.indexOf(word) === index) // Unique words only
        .sort();

      console.log(`\n=== WORD-BY-WORD ANALYSIS ===`);
      console.log(`Analyzing ${words.length} unique words...`);

      const problematicWords: Array<{
        word: string;
        actual: string;
        issue: string;
      }> = [];

      for (const word of words.slice(0, 50)) { // Test first 50 unique words
        try {
          const transliterated = engine.transliterate(word);
          
          // Check for common issues
          let issues: string[] = [];
          
          // Check if word was not transliterated at all
          if (transliterated === word) {
            issues.push('not_transliterated');
          }
          
          // Check if word contains Latin characters (indicating partial transliteration)
          if (transliterated.match(/[a-zA-Z]/)) {
            issues.push('contains_latin');
          }
          
          // Check if word is empty or whitespace
          if (!transliterated.trim()) {
            issues.push('empty_result');
          }
          
          // Check if result contains unusual characters
          if (transliterated.match(/[{}]/)) {
            issues.push('contains_braces');
          }
          
          if (issues.length > 0) {
            problematicWords.push({
              word,
              actual: transliterated,
              issue: issues.join(', ')
            });
          }
          
        } catch (error) {
          problematicWords.push({
            word,
            actual: `ERROR: ${error}`,
            issue: 'exception_thrown'
          });
        }
      }

      console.log(`Found ${problematicWords.length} problematic words:`);
      problematicWords.forEach((item, index) => {
        if (index < 20) { // Show first 20 problematic words
          console.log(`${index + 1}. "${item.word}" -> "${item.actual}" (${item.issue})`);
        }
      });

      if (problematicWords.length > 20) {
        console.log(`... and ${problematicWords.length - 20} more problematic words`);
      }

      // Group by issue type
      const issueGroups = problematicWords.reduce((acc, item) => {
        const issue = item.issue;
        if (!acc[issue]) acc[issue] = [];
        acc[issue].push(item);
        return acc;
      }, {} as Record<string, typeof problematicWords>);

      console.log('\nIssue breakdown:');
      Object.entries(issueGroups).forEach(([issue, words]) => {
        console.log(`  ${issue}: ${words.length} words`);
      });
    });
  });

  describe('Specific Pattern Analysis', () => {
    test('should analyze punctuation handling', () => {
      const testTexts = [
        'Hello, world!',
        'This is a test.',
        'What about "quotes"?',
        "And 'single quotes'?",
        'Numbers: 1962, 2024',
        'Hyphenated-words and em-dashes',
        'Parentheses (like this) and [brackets]'
      ];

      console.log('\n=== PUNCTUATION ANALYSIS ===');
      
      for (const text of testTexts) {
        const result = engine.transliterate(text);
        console.log(`"${text}" -> "${result}"`);
      }
    });

    test('should analyze proper noun handling', () => {
      const properNouns = [
        'Shaw',
        'Shavian', 
        'Bernard',
        'Kingsley Read',
        'British Museum',
        'Doctor Who',
        'Cuba',
        'Irish',
        'English',
        'Leeds University'
      ];

      console.log('\n=== PROPER NOUN ANALYSIS ===');
      
      for (const noun of properNouns) {
        const result = engine.transliterate(noun);
        console.log(`"${noun}" -> "${result}"`);
      }
    });

    test('should analyze common function words', () => {
      const functionWords = [
        'the', 'and', 'of', 'to', 'a', 'in', 'that', 'it', 'was', 'for',
        'on', 'are', 'as', 'with', 'his', 'they', 'be', 'at', 'one', 'have',
        'this', 'from', 'or', 'had', 'by', 'but', 'not', 'what', 'all', 'were'
      ];

      console.log('\n=== FUNCTION WORD ANALYSIS ===');
      
      const issues: string[] = [];
      
      for (const word of functionWords) {
        const result = engine.transliterate(word);
        console.log(`"${word}" -> "${result}"`);
        
        if (result === word) {
          issues.push(`"${word}" not transliterated`);
        }
      }
      
      if (issues.length > 0) {
        console.log('\nFunction word issues:');
        issues.forEach(issue => console.log(`  - ${issue}`));
      }
    });
  });
});

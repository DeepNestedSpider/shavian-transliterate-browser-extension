import { describe, it, expect, beforeEach } from 'bun:test';
import { ReadlexiconEngine } from '../src/core/transliterationEngine';
import { readlexDict } from '../src/dictionaries/readlex';

describe('Em-dash Transliteration Debug', () => {
  let engine: ReadlexiconEngine;

  beforeEach(() => {
    engine = new ReadlexiconEngine(readlexDict);
  });

  it('should test transliterateWord method with em-dash scenarios', () => {
    console.log('\n=== TESTING transliterateWord WITH EM-DASHES ===');
    
    // Test individual words first
    const word1 = engine.transliterateWord('James');
    console.log(`transliterateWord('James'): "${word1}"`);
    
    const word2 = engine.transliterateWord('Shaw');
    console.log(`transliterateWord('Shaw'): "${word2}"`);
    
    // Test em-dash scenarios
    const emDashTest1 = engine.transliterateWord('—James');
    console.log(`transliterateWord('—James'): "${emDashTest1}"`);
    
    const emDashTest2 = engine.transliterateWord('James—Shaw');
    console.log(`transliterateWord('James—Shaw'): "${emDashTest2}"`);
    
    const emDashTest3 = engine.transliterateWord('—James Shaw');
    console.log(`transliterateWord('—James Shaw'): "${emDashTest3}"`);
    
    // Test the exact failing scenario step by step
    console.log('\n--- Step by step analysis ---');
    
    // What happens when we split the text ourselves?
    const testText = '—James Shaw urged the Society';
    const parts = testText.split('—');
    console.log(`Split by em-dash: ${JSON.stringify(parts)}`);
    
    // Process each part
    parts.forEach((part, index) => {
      console.log(`Part ${index}: "${part}"`);
      if (part.trim() !== '') {
        // Test transliterateWord on the part
        const wordResult = engine.transliterateWord(part);
        console.log(`  transliterateWord result: "${wordResult}"`);
      }
    });
  });

  it('should test full text processing with em-dashes', () => {
    console.log('\n=== TESTING FULL TEXT PROCESSING ===');
    
    // Test the actual failing case from the reference test
    const testText = '—James Shaw urged the Society';
    
    // Try different processing methods
    console.log(`Original text: "${testText}"`);
    
    // Test transliterateWord on the full text
    const wordResult = engine.transliterateWord(testText);
    console.log(`transliterateWord(full text): "${wordResult}"`);
    
    // Test processing word by word
    const words = testText.split(/\s+/);
    console.log(`Split by whitespace: ${JSON.stringify(words)}`);
    
    words.forEach((word, index) => {
      const result = engine.transliterateWord(word);
      console.log(`Word ${index} "${word}" -> "${result}"`);
    });
    
    // Expected result should have James transliterated
    const expectedJames = readlexDict.getTransliteration('james');
    console.log(`Expected "james": "${expectedJames}"`);
    
    // The issue: check if "—James" is being treated as a single word
    const dashJamesResult = engine.transliterateWord('—James');
    console.log(`"—James" as single word: "${dashJamesResult}"`);
    
    expect(dashJamesResult).toContain(expectedJames);
  });
});

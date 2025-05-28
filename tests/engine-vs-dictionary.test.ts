import { describe, it, expect, beforeEach } from 'bun:test';
import { ReadlexiconEngine } from '../src/core/transliterationEngine';
import { readlexDict } from '../src/dictionaries/readlex';

describe('Engine vs Dictionary Comparison', () => {
  let engine: ReadlexiconEngine;

  beforeEach(() => {
    engine = new ReadlexiconEngine(readlexDict);
  });

  it('should compare engine transliteration vs direct dictionary lookup', () => {
    const testWords = ['james', 'shaw', 'urged', 'society'];
    
    console.log('=== ENGINE VS DICTIONARY COMPARISON ===');
    
    testWords.forEach(word => {
      // Direct dictionary lookup
      const dictResult = readlexDict.getTransliteration(word);
      
      // Engine transliteration
      const engineResult = engine.transliterateWordInternal(word, 'noun');
      
      console.log(`\nWord: "${word}"`);
      console.log(`Dictionary: "${dictResult}"`);
      console.log(`Engine:     "${engineResult}"`);
      console.log(`Match: ${dictResult === engineResult}`);
      
      // They should match
      expect(engineResult).toBe(dictResult);
    });
  });

  it('should test engine transliterationWordInternal step by step', () => {
    const word = 'james';
    
    console.log('\n=== DEBUGGING ENGINE INTERNAL LOGIC ===');
    console.log(`Testing word: "${word}"`);
    
    // Test direct dictionary access
    const dictLookup = readlexDict.getTransliteration(word);
    console.log(`Direct dictionary lookup: "${dictLookup}"`);
    
    // Test engine method
    const engineResult = engine.transliterateWordInternal(word, 'noun');
    console.log(`Engine transliterateWordInternal: "${engineResult}"`);
    
    // Test if the engine is even calling the dictionary
    const hasTransliteration = readlexDict.getTransliteration(word) !== null;
    console.log(`Dictionary has entry: ${hasTransliteration}`);
    
    expect(engineResult).toBe(dictLookup);
  });

  it('should test em-dash context specifically', () => {
    console.log('\n=== EM-DASH CONTEXT TEST ===');
    
    // Test the exact scenario from the failing test
    const testText = '—James Shaw urged the Society';
    
    // Split by em-dash like the engine does
    const parts = testText.split('—');
    console.log(`Split parts:`, parts);
    
    // Test transliterating the second part (which contains "James")
    const secondPart = parts[1]; // "James Shaw urged the Society"
    console.log(`Second part: "${secondPart}"`);
    
    // Extract first word
    const words = secondPart.trim().split(/\s+/);
    const firstWord = words[0].toLowerCase();
    console.log(`First word: "${firstWord}"`);
    
    // Test dictionary lookup
    const dictResult = readlexDict.getTransliteration(firstWord);
    console.log(`Dictionary result: "${dictResult}"`);
    
    // Test engine
    const engineResult = engine.transliterateWordInternal(firstWord, 'noun');
    console.log(`Engine result: "${engineResult}"`);
    
    expect(engineResult).toBe(dictResult);
  });
});

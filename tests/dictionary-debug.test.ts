import { describe, expect, test } from 'bun:test';
import { readlexDict } from '../src/dictionaries/readlex';
import { ReadlexiconEngine } from '../src/core/transliterationEngine';

describe('Dictionary Lookup Debug', () => {
  test('test engine vs dictionary', () => {
    console.log('=== ENGINE VS DICTIONARY TEST ===');
    
    const engine = new ReadlexiconEngine();
    const testWords = ['james', 'shaw', 'urged', 'society'];
    
    for (const word of testWords) {
      console.log(`\nTesting: "${word}"`);
      
      // Dictionary direct lookup
      const dictResult = readlexDict.getTransliteration(word);
      console.log(`Dictionary: "${dictResult || 'NOT FOUND'}"`);
      
      // Engine transliterateWordInternal
      const engineResult = engine.transliterateWordInternal(word, 0);
      console.log(`Engine: "${engineResult}"`);
      
      // Full engine transliterate
      const fullResult = engine.transliterate(word);
      console.log(`Full: "${fullResult}"`);
    }
    
    expect(true).toBe(true);
  });
});

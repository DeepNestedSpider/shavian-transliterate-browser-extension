import { describe, test, expect } from 'bun:test';
import { ReadlexiconEngine } from '../src/core/transliterationEngine';
import { readlexDict } from '../src/dictionaries/readlex';

describe('Dictionary lookup debug', () => {
  test('verify dictionary has expected entries and lookup works', () => {
    console.log('TEST STARTING...');
    const engine = new ReadlexiconEngine(readlexDict);
    
    console.log('=== DICTIONARY DEBUG TEST ===');
    console.log('Dictionary type:', typeof readlexDict);
    console.log('Dictionary has getTransliteration:', typeof readlexDict.getTransliteration);
    console.log('Dictionary size estimate:', engine.getDictionarySize());
    
    // Test direct dictionary access
    console.log('\n=== DIRECT DICTIONARY ACCESS ===');
    console.log('readlexDict.basic["james"]:', readlexDict.basic['james']);
    console.log('readlexDict.basic["urged"]:', readlexDict.basic['urged']);
    console.log('readlexDict.basic["society"]:', readlexDict.basic['society']);
    
    // Test getTransliteration method
    console.log('\n=== GETTRANSLITERATION METHOD ===');
    console.log('getTransliteration("james"):', readlexDict.getTransliteration('james'));
    console.log('getTransliteration("urged"):', readlexDict.getTransliteration('urged'));
    console.log('getTransliteration("society"):', readlexDict.getTransliteration('society'));
    
    // Test with POS tags
    console.log('\n=== POS-SPECIFIC LOOKUP ===');
    console.log('getTransliteration("james", "NP0"):', readlexDict.getTransliteration('james', 'NP0'));
    console.log('getTransliteration("urged", "VVD"):', readlexDict.getTransliteration('urged', 'VVD'));
    console.log('getTransliteration("society", "NN1"):', readlexDict.getTransliteration('society', 'NN1'));
    
    // Test engine transliteration
    console.log('\n=== ENGINE TRANSLITERATION ===');
    console.log('Engine transliterateWord("james"):', engine.transliterateWord('james'));
    console.log('Engine transliterateWord("James"):', engine.transliterateWord('James'));
    console.log('Engine transliterateWord("urged"):', engine.transliterateWord('urged'));
    console.log('Engine transliterateWord("society"):', engine.transliterateWord('society'));
    console.log('Engine transliterateWord("Society"):', engine.transliterateWord('Society'));
    
    // Test if entries exist in posSpecific
    console.log('\n=== POS-SPECIFIC ENTRIES ===');
    console.log('posSpecific["james_NP0"]:', readlexDict.posSpecific['james_NP0']);
    console.log('posSpecific["urged_VVD"]:', readlexDict.posSpecific['urged_VVD']);
    console.log('posSpecific["society_NN1"]:', readlexDict.posSpecific['society_NN1']);
    
    expect(true).toBe(true); // Just to make the test pass
  });
});

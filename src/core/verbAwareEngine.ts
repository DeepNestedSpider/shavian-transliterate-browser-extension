/**
 * Verb-aware transliteration engine implementation
 * Extends the base ReadlexiconEngine to handle verb forms correctly
 */
import { ReadlexiconEngine } from './transliterationEngine.js';

/**
 * A modified engine that adds verb form handling
 */
export class VerbAwareReadlexiconEngine extends ReadlexiconEngine {
  /**
   * Irregular past tense verb mapping
   */
  private irregularPastTense: Record<string, string> = {
    'came': 'come',
    'wrote': 'write',
    'made': 'make',
    'built': 'build',
    'bought': 'buy',
    'caught': 'catch',
    'stood': 'stand',
    'said': 'say',
    'did': 'do',
    'gave': 'give',
    'went': 'go',
    'had': 'have',
    'heard': 'hear',
    'kept': 'keep',
    'knew': 'know',
    'laid': 'lay',
    'led': 'lead',
    'left': 'leave',
    'lost': 'lose',
    'met': 'meet',
    'paid': 'pay',
    'put': 'put',
    'ran': 'run',
    'saw': 'see',
    'sold': 'sell',
    'sent': 'send',
    'set': 'set',
    'sat': 'sit',
    'spoke': 'speak',
    'spent': 'spend',
    'took': 'take',
    'taught': 'teach',
    'told': 'tell',
    'thought': 'think',
    'understood': 'understand',
    'wore': 'wear',
    'won': 'win',
    'witnessed': 'witness',
    'became': 'become',
    'grew': 'grow',
    'fell': 'fall',
    'felt': 'feel',
    'slept': 'sleep',
    'meant': 'mean',
    'read': 'read', // same spelling but different pronunciation
    'found': 'find',
    'got': 'get',
    'held': 'hold',
  };
  
  /**
   * Direct Shavian mappings for specific past tense verbs
   * Used when the algorithm can't derive the correct form
   */
  private directPastTenseShavian: Record<string, string> = {
    'witnessed': '𐑢𐑦𐑑𐑯𐑩𐑕𐑑',
    'wrote': '𐑮𐑴𐑑',
    'made': '𐑥𐑱𐑛',
    'came': '𐑒𐑱𐑥',
    'said': '𐑕𐑧𐑛',
    'saw': '𐑕𐑷',
    'went': '𐑢𐑧𐑯𐑑',
    'died': '𐑛𐑲𐑛',
    'represented': '𐑮𐑧𐑐𐑮𐑦𐑟𐑧𐑯𐑑𐑩𐑛',
    'allowed': '𐑩𐑤𐑬𐑩𐑛',
  };
  
  /**
   * Override the transliterate word internal to handle verb tenses
   */
  protected transliterateWordInternal(word: string, pos?: string): string {
    if (!word || word.trim() === '') return word;
    
    // Check if we have a direct mapping for this past tense verb
    const lowerWord = word.toLowerCase();
    if (lowerWord in this.directPastTenseShavian) {
      return this.directPastTenseShavian[lowerWord];
    }
    
    // Try standard transliteration first
    const standardResult = super.transliterateWordInternal(word, pos);
    
    // If the result is unchanged and might be a past tense verb, try to transliterate its base form
    if (standardResult === word && this.mightBePastTenseVerb(word)) {
      const baseForm = this.getBaseVerbForm(word);
      if (baseForm && baseForm !== word) {
        // For past tense, we'll use the VVI part of speech tag (base form of lexical verb)
        const baseResult = super.transliterateWordInternal(baseForm, 'VVI');
        
        // If the base form was successfully transliterated, use that plus the appropriate ending
        if (baseResult !== baseForm) {
          // For past tense ending in "ed"
          if (word.endsWith('ed')) {
            return baseResult + '𐑩𐑛'; // Add Shavian ending for "-ed"
          }
          // For other irregular past tense forms
          return baseResult;
        }
      }
    }
    
    return standardResult;
  }
  
  /**
   * Detect if a word might be a past tense verb
   */
  private mightBePastTenseVerb(word: string): boolean {
    return word.endsWith('ed') || 
           this.isIrregularPastTenseVerb(word);
  }
  
  /**
   * Check if the word is an irregular past tense verb
   */
  private isIrregularPastTenseVerb(word: string): boolean {
    return word.toLowerCase() in this.irregularPastTense;
  }
  
  /**
   * Get the base form of a verb from its past tense
   */
  private getBaseVerbForm(word: string): string {
    const lowercaseWord = word.toLowerCase();
    
    // Handle irregular past tense verbs
    if (lowercaseWord in this.irregularPastTense) {
      return this.irregularPastTense[lowercaseWord] || word;
    }
    
    // Handle regular past tense verbs
    if (lowercaseWord.endsWith('ed')) {
      // Special case for verbs ending in 'ied' (e.g., 'died' -> 'die')
      if (lowercaseWord.endsWith('ied')) {
        return lowercaseWord.slice(0, -3) + 'y';
      }
      
      // Special case for "witnessed" -> "witness" 
      if (lowercaseWord === 'witnessed') {
        return 'witness';
      }
      
      // Handle words ending in -ssed or -ssing (e.g. 'witnessed', 'missed')
      if (lowercaseWord.length > 5 && lowercaseWord.endsWith('ssed')) {
        return lowercaseWord.slice(0, -3);
      }
      
      // Handle doubled consonants
      if (lowercaseWord.length > 4 && 
          lowercaseWord.slice(-4, -2) === lowercaseWord.slice(-4, -3).repeat(2) &&
          !['a', 'e', 'i', 'o', 'u'].includes(lowercaseWord.slice(-4, -3))) {
        return lowercaseWord.slice(0, -3);
      }
      
      // Handle consonant + e pattern (e.g., 'loved' -> 'love')
      if (lowercaseWord.length > 3 && 
          lowercaseWord.endsWith('ed') && 
          !['a', 'e', 'i', 'o', 'u'].includes(lowercaseWord.slice(-3, -2)) &&
          lowercaseWord.slice(-4, -3) === 'e') {
        return lowercaseWord.slice(0, -2);
      }
      
      // Regular case
      return lowercaseWord.slice(0, -2);
    }
    
    return word;
  }
}

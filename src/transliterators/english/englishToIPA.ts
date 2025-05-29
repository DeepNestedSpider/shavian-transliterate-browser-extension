/**
 * English to IPA (International Phonetic Alphabet) Transliterator
 * 
 * Converts English text to IPA pronunciation using the IPA dictionary.
 */

import { getIPAPronunciation } from '../../dictionaries/ipa';
import type { TransliterationEngine, TransliterationResult } from './types';

export class EnglishToIPAEngine implements TransliterationEngine {
  name = 'English to IPA';
  description = 'Converts English text to International Phonetic Alphabet (IPA) pronunciation';

  /**
   * Main transliterate method for compatibility with TransliterationEngine interface
   */
  transliterate(text: string): string {
    const result = this.transliterateText(text);
    return result.transliterated;
  }

  /**
   * Reverse transliterate (not applicable for IPA, returns original)
   */
  reverseTransliterate(text: string): string {
    // IPA to English is not supported, return original text
    return text;
  }

  /**
   * Reverse transliterate word (not applicable for IPA, returns original)
   */
  reverseTransliterateWord(word: string): string {
    // IPA to English is not supported, return original word
    return word;
  }

  /**
   * Check if a word is already in IPA format or Shavian script
   */
  private isAlreadyTransliterated(word: string): boolean {
    // Check for Shavian script first (Unicode range: U+10450–U+1047F)
    const shavianRegex = /[\u{10450}-\u{1047F}]/u;
    if (shavianRegex.test(word)) {
      return true;
    }
    
    // Check for formatted IPA: word[/pronunciation1/|/pronunciation2/]
    if (/\w+\[\/[^\/]+\/(\|\/[^\/]+\/)*\]/.test(word)) {
      return true;
    }
    
    // Check for simple IPA notation: /pronunciation/
    if (/^\/[^\/]+\/$/.test(word.trim())) {
      return true;
    }
    
    // Check for IPA phonetic characters (common IPA symbols)
    const ipaChars = /[ˈˌːˑəɚɛɪɒɔʊʌʃʒθðŋɑæɜɝɨɵɞɤɯɞʏʎɢʁχʕʔˤʷʲˠˀˈˌ]/;
    if (ipaChars.test(word)) {
      return true;
    }
    
    return false;
  }

  /**
   * Transliterate a single word from English to IPA
   */
  transliterateWord(word: string): string {
    // Check if word is already transliterated (IPA or Shavian)
    if (this.isAlreadyTransliterated(word)) {
      return word; // Return as-is if already transliterated
    }
    
    // Clean the word (remove punctuation, normalize case)
    const cleanWord = word.toLowerCase().replace(/[^\w']/g, '');
    
    if (!cleanWord) {
      return word; // Return original if no valid characters
    }

    // Look up IPA pronunciation using formatted output for clarity
    const ipa = getIPAPronunciation(cleanWord, 'formatted');
    
    if (ipa) {
      return ipa;
    }

    // Fallback: return original word if not found in dictionary
    return word;
  }

  /**
   * Transliterate a phrase or sentence from English to IPA
   */
  transliterateText(text: string): TransliterationResult {
    if (!text || typeof text !== 'string') {
      return {
        transliterated: text,
        originalWords: [],
        transliteratedWords: [],
        confidence: 0
      };
    }

    const words = text.split(/(\s+|[^\w\s']+)/);
    const originalWords: string[] = [];
    const transliteratedWords: string[] = [];
    let foundWords = 0;
    let totalWords = 0;

    const result = words.map(segment => {
      // Check if this segment is a word (contains letters)
      if (/\w/.test(segment)) {
        totalWords++;
        const transliterated = this.transliterateWord(segment);
        originalWords.push(segment);
        transliteratedWords.push(transliterated);
        
        // Check if we actually found a translation (not just returned original)
        if (transliterated !== segment) {
          foundWords++;
        }
        
        return transliterated;
      } else {
        // Return whitespace and punctuation as-is
        return segment;
      }
    }).join('');

    const confidence = totalWords > 0 ? foundWords / totalWords : 0;

    return {
      transliterated: result,
      originalWords,
      transliteratedWords,
      confidence
    };
  }

  /**
   * Check if this engine can handle the given text
   */
  canTransliterate(text: string): boolean {
    // This engine can handle any text, though it works best with English
    return typeof text === 'string' && text.length > 0;
  }

  /**
   * Get information about this transliteration engine
   */
  getInfo() {
    return {
      name: this.name,
      description: this.description,
      inputScript: 'Latin (English)',
      outputScript: 'IPA (International Phonetic Alphabet)',
      bidirectional: false
    };
  }
}

// Export a default instance
export const englishToIPA = new EnglishToIPAEngine();
export default englishToIPA;

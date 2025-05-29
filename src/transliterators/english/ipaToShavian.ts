/**
 * IPA to Shavian transliteration engine
 * 
 * This engine converts English words to IPA first, then maps IPA symbols to Shavian characters.
 * This provides a more phonetically accurate transliteration compared to spelling-based approaches.
 */

import type { TransliterationEngine } from './types';
import { getIPAPronunciation, hasIPAPronunciation } from '../../dictionaries/ipa';

export class IPAToShavianEngine implements TransliterationEngine {
  
  // IPA to Shavian character mappings
  // Based on the official Shavian alphabet phonetic values
  private ipaToShavianMap: Record<string, string> = {
    // Consonants
    'p': '𐑐', // PEEP
    'b': '𐑚', // BIB
    't': '𐑑', // TOT
    'd': '𐑛', // DEAD
    'k': '𐑒', // KICK
    'ɡ': '𐑜', // GAG
    'g': '𐑜', // GAG (alternative notation)
    'f': '𐑓', // FEE
    'v': '𐑝', // VOW
    'θ': '𐑔', // THIGH
    'ð': '𐑞', // THEY
    's': '𐑕', // SO
    'z': '𐑟', // ZOO
    'ʃ': '𐑖', // SURE
    'ʒ': '𐑠', // MEASURE
    'h': '𐑣', // HA-HA
    'tʃ': '𐑗', // CHURCH
    'dʒ': '𐑡', // JUDGE
    'w': '𐑢', // WOE
    'j': '𐑘', // YEA
    'l': '𐑤', // LOLL
    'ɫ': '𐑤', // Dark L (maps to same)
    'r': '𐑮', // ROAR
    'ɹ': '𐑮', // ROAR (rhotic r)
    'ɾ': '𐑮', // Tap R (maps to same)
    'm': '𐑥', // MIME
    'n': '𐑯', // NUN
    'ŋ': '𐑙', // HUNG
    'ɲ': '𐑯𐑘', // Palatal nasal (approximation)
    
    // Vowels - Tall letters (stressed/long)
    'i': '𐑰', // EAT
    'iː': '𐑰', // EAT (long)
    'ɪ': '𐑦', // IT
    'e': '𐑱', // AGE
    'eɪ': '𐑱', // AGE
    'ɛ': '𐑧', // EGG
    'æ': '𐑨', // ASH
    'ɑ': '𐑭', // AH
    'ɑː': '𐑭', // AH (long)
    'ɒ': '𐑪', // ON
    'ɔ': '𐑷', // AWE
    'ɔː': '𐑷', // AWE (long)
    'o': '𐑴', // OAK
    'oʊ': '𐑴', // OAK
    'ʊ': '𐑫', // WOOD
    'u': '𐑵', // OOH
    'uː': '𐑵', // OOH (long)
    'ʌ': '𐑳', // UP
    'ɜ': '𐑻', // ERR
    'ɜː': '𐑻', // ERR (long)
    'ɝ': '𐑻', // R-colored schwa
    'ə': '𐑩', // UH (schwa)
    'ɚ': '𐑼', // R-colored schwa (unstressed)
    
    // Diphthongs
    'aɪ': '𐑲', // ICE
    'aʊ': '𐑬', // OUT
    'ɔɪ': '𐑶', // OIL
    'oɪ': '𐑶', // OIL (alternative)
    'ju': '𐑿', // USE (yoo)
    'jʊ': '𐑿', // USE (alternative)
    'ɪr': '𐑽', // EAR
    'ɛr': '𐑺', // AIR
    'ɑr': '𐑸', // ARE
    'ɔr': '𐑹', // OR
    'ʊr': '𐑾', // POOR
    
    // Special combinations
    'ks': '𐑒𐑕', // X sound
    'kw': '𐑒𐑢', // QU sound
    'hw': '𐑣𐑢', // WH sound (for dialects that distinguish)
  };

  // Secondary stress and syllable boundaries (mostly ignored for simplicity)
  private ignoreInIPA = /[ˈˌ\.]/g;

  transliterate(text: string): string {
    // Split text into words while preserving whitespace and punctuation
    const words = text.split(/(\s+|[^\w']+)/);
    
    return words.map(segment => {
      // Skip whitespace and pure punctuation
      if (/^\s+$/.test(segment) || /^[^\w']+$/.test(segment)) {
        return segment;
      }
      
      return this.transliterateWord(segment);
    }).join('');
  }

  transliterateWord(word: string): string {
    // Clean the word (remove leading/trailing punctuation for lookup)
    const cleanWord = word.replace(/^[^\w']+|[^\w']+$/g, '').toLowerCase();
    const leadingPunct = word.match(/^[^\w']+/)?.[0] || '';
    const trailingPunct = word.match(/[^\w']+$/)?.[0] || '';
    
    if (!cleanWord) return word;
    
    // Get IPA pronunciation
    const ipaString = getIPAPronunciation(cleanWord);
    
    if (!ipaString) {
      // Fallback: try basic letter-by-letter conversion for unknown words
      return leadingPunct + this.fallbackTransliteration(cleanWord) + trailingPunct;
    }
    
    // Convert IPA to Shavian
    const shavianResult = this.ipaToShavian(ipaString);
    
    return leadingPunct + shavianResult + trailingPunct;
  }

  private ipaToShavian(ipaString: string): string {
    // Handle multiple pronunciations (separated by commas)
    const pronunciations = ipaString.split(',');
    const primaryPronunciation = pronunciations[0].trim();
    
    // Remove stress marks and other diacritics we don't handle
    const cleanIPA = primaryPronunciation
      .replace(/^\/|\/$/g, '') // Remove IPA delimiters
      .replace(this.ignoreInIPA, ''); // Remove stress marks
    
    let result = '';
    let i = 0;
    
    while (i < cleanIPA.length) {
      let found = false;
      
      // Try longer sequences first (for diphthongs and digraphs)
      for (let len = 3; len >= 1; len--) {
        if (i + len <= cleanIPA.length) {
          const sequence = cleanIPA.substring(i, i + len);
          
          if (this.ipaToShavianMap[sequence]) {
            result += this.ipaToShavianMap[sequence];
            i += len;
            found = true;
            break;
          }
        }
      }
      
      if (!found) {
        // Skip unknown IPA symbols
        i++;
      }
    }
    
    return result || this.fallbackTransliteration(cleanIPA);
  }

  private fallbackTransliteration(word: string): string {
    // Basic fallback for words not in IPA dictionary
    // This is a simplified mapping for emergency cases
    return word.split('').map(char => {
      const mappings: Record<string, string> = {
        'a': '𐑩', 'b': '𐑚', 'c': '𐑒', 'd': '𐑛', 'e': '𐑧',
        'f': '𐑓', 'g': '𐑜', 'h': '𐑣', 'i': '𐑦', 'j': '𐑡',
        'k': '𐑒', 'l': '𐑤', 'm': '𐑥', 'n': '𐑯', 'o': '𐑪',
        'p': '𐑐', 'q': '𐑒𐑢', 'r': '𐑮', 's': '𐑕', 't': '𐑑',
        'u': '𐑳', 'v': '𐑝', 'w': '𐑢', 'x': '𐑒𐑕', 'y': '𐑘',
        'z': '𐑟'
      };
      return mappings[char.toLowerCase()] || char;
    }).join('');
  }

  reverseTransliterate(text: string): string {
    // For IPA-based transliteration, reverse conversion is complex
    // This would require Shavian -> IPA -> English mapping
    // For now, return a placeholder message
    return '(IPA-based reverse transliteration not yet implemented)';
  }

  reverseTransliterateWord(word: string): string {
    return this.reverseTransliterate(word);
  }
}

export default IPAToShavianEngine;

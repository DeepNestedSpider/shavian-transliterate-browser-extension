/**
 * English to Shavian transliteration engine
 */
import type { POSTaggedToken } from '../../core/posTagger';
import {
  isPunctuationProcessed,
  extractOriginalWord,
  processPunctuatedWord,
  reconstructWordWithPunctuation,
} from '../../core/punctuationHandler';
import type { TransliterationEngine } from './types';

// Import names dictionary - use a simple object for now instead of dynamic import
const namesDict: Record<string, string> = {
  who: '𐑣𐑵', // Doctor Who - distinct from the word "who" (𐑣)
  shaw: '𐑖𐑷', // Bernard Shaw - proper name pronunciation
};

export class EnglishToShavianEngine implements TransliterationEngine {
  private dictionary: Map<string, string> | any = new Map();
  private reverseDictionary: Map<string, string> = new Map();
  private previousWord: string = '';
  private previousPos: string = '';
  private previousWordWasProperName: boolean = false;

  // Function word heuristics from original Python code
  // These handle pronunciation changes based on context
  private beftoMap: Record<string, string> = {
    have: '𐑨𐑓', // "have to" -> "𐑨𐑓" (haf)
    has: '𐑨𐑕', // "has to" -> "𐑨𐑕" (has)
    used: '𐑕𐑑', // "used to" -> "𐑕𐑑" (st)
    unused: '𐑕𐑑', // "unused to" -> "𐑕𐑑" (st)
    supposed: '𐑕𐑑', // "supposed to" -> "𐑕𐑑" (st)
  };

  // Common function words that should have specific Shavian forms
  private functionWords: Record<string, string> = {
    and: '𐑯', // "and" -> "𐑯" (n)
    of: '𐑝', // "of" -> "𐑝" (v)
    the: '𐑞', // "the" -> "𐑞" (th)
    to: '𐑑', // "to" -> "𐑑" (t)
    a: '𐑩', // "a" -> "𐑩" (uh)
    an: '𐑩𐑯', // "an" -> "𐑩𐑯" (uh-n)
    in: '𐑦𐑯', // "in" -> "𐑦𐑯" (in)
    on: '𐑪𐑯', // "on" -> "𐑪𐑯" (on)
    at: '𐑨𐑑', // "at" -> "𐑨𐑑" (at)
    is: '𐑦𐑟', // "is" -> "𐑦𐑟" (iz)
    are: '𐑸', // "are" -> "𐑸" (ar)
    was: '𐑢𐑪𐑟', // "was" -> "𐑢𐑪𐑟" (woz)
    were: '𐑢𐑻', // "were" -> "𐑢𐑻" (wer)
    for: '𐑓', // "for" -> "𐑓" (f)
    with: '𐑢𐑦𐑞', // "with" -> "𐑢𐑦𐑞" (with)
    by: '𐑚𐑲', // "by" -> "𐑚𐑲" (by)
    from: '𐑓𐑮𐑪𐑥', // "from" -> "𐑓𐑮𐑪𐑥" (from)
    had: '𐑣𐑨𐑛', // "had" -> "𐑣𐑨𐑛" (had)
    have: '𐑣𐑨𐑝', // "have" -> "𐑣𐑨𐑝" (hav)
    has: '𐑣𐑨𐑟', // "has" -> "𐑣𐑨𐑟" (haz)
    would: '𐑢𐑫𐑛', // "would" -> "𐑢𐑫𐑛" (wood)
    could: '𐑒𐑫𐑛', // "could" -> "𐑒𐑫𐑛" (kood)
    should: '𐑖𐑫𐑛', // "should" -> "𐑖𐑫𐑛" (shood)
    will: '𐑢𐑦𐑤', // "will" -> "𐑢𐑦𐑤" (wil)
    can: '𐑒𐑨𐑯', // "can" -> "𐑒𐑨𐑯" (kan)
    may: '𐑥𐑱', // "may" -> "𐑥𐑱" (may)
    shall: '𐑖𐑨𐑤', // "shall" -> "𐑖𐑨𐑤" (shal)
    do: '𐑛', // "do" -> "𐑛" (d)
    does: '𐑛𐑳𐑟', // "does" -> "𐑛𐑳𐑟" (duz)
    did: '𐑛𐑦𐑛', // "did" -> "𐑛𐑦𐑛" (did)
    be: '𐑚', // "be" -> "𐑚" (b)
    been: '𐑚𐑰𐑯', // "been" -> "𐑚𐑰𐑯" (been)
    being: '𐑚𐑰𐑦𐑙', // "being" -> "𐑚𐑰𐑦𐑙" (being)
    this: '𐑞𐑦𐑕', // "this" -> "𐑞𐑦𐑕" (this)
    that: '𐑞𐑨𐑑', // "that" -> "𐑞𐑨𐑑" (that)
    which: '𐑢𐑦𐑗', // "which" -> "𐑢𐑦𐑗" (wich)
    who: '𐑣', // "who" -> "𐑣" (h)
    what: '𐑢𐑪𐑑', // "what" -> "𐑢𐑪𐑑" (wot)
    when: '𐑢𐑧𐑯', // "when" -> "𐑢𐑧𐑯" (wen)
    where: '𐑢𐑺', // "where" -> "𐑢𐑺" (wer)
    why: '𐑢𐑲', // "why" -> "𐑢𐑲" (wy)
    how: '𐑣𐑬', // "how" -> "𐑣𐑬" (how)
    not: '𐑯𐑪𐑑', // "not" -> "𐑯𐑪𐑑" (not)
    no: '𐑯𐑴', // "no" -> "𐑯𐑴" (no)
    yes: '𐑘𐑧𐑕', // "yes" -> "𐑘𐑧𐑕" (yes)
    all: '𐑷𐑤', // "all" -> "𐑷𐑤" (awl)
    any: '𐑧𐑯𐑦', // "any" -> "𐑧𐑯𐑦" (eny)
    some: '𐑕𐑳𐑥', // "some" -> "𐑕𐑳𐑥" (sum)
    one: '𐑢𐑳𐑯', // "one" -> "𐑢𐑳𐑯" (wun)
    two: '𐑑', // "two" -> "𐑑" (t)
    three: '𐑔𐑮', // "three" -> "𐑔𐑮" (thr)
    four: '𐑓𐑹', // "four" -> "𐑓𐑹" (for)
    five: '𐑓𐑲𐑝', // "five" -> "𐑓𐑲𐑝" (fyv)
  };

  constructor(dictionaryData?: any) {
    if (dictionaryData) {
      this.loadDictionary(dictionaryData);
    }
  }

  private loadDictionary(data: any): void {
    // Handle new POS-aware dictionary format
    if (data && typeof data.getTransliteration === 'function') {
      // New format with POS support
      this.dictionary = data;

      // Build reverse dictionary for Shavian to English transliteration
      this.reverseDictionary = new Map();
      for (const [key, value] of Object.entries(data.basic)) {
        const cleanShavian = (value as string).replace(/^[.:]+|[.:]+$/g, '');
        if (cleanShavian) {
          this.reverseDictionary.set(cleanShavian, key.toLowerCase());
        }
      }
    } else {
      // Legacy format compatibility
      this.dictionary = new Map();
      for (const [key, value] of Object.entries(data as Record<string, string>)) {
        this.dictionary.set(key.toLowerCase(), value);
        // Build reverse dictionary for Shavian to English transliteration
        const cleanShavian = value.replace(/^[.:]+|[.:]+$/g, '');
        if (cleanShavian) {
          this.reverseDictionary.set(cleanShavian, key.toLowerCase());
        }
      }
    }

    // Add function words to reverse dictionary
    for (const [english, shavian] of Object.entries(this.functionWords)) {
      const cleanShavian = shavian.replace(/^[.:]+|[.:]+$/g, '');
      if (cleanShavian) {
        this.reverseDictionary.set(cleanShavian, english);
      }
    }

    // Add specific reverse mappings to handle problematic cases
    const specificReverseMappings: Record<string, string> = {
      '𐑑': 'to',  // Ensure "𐑑" maps to "to" not "two"
      '𐑮𐑰𐑛': 'read', // Ensure "𐑮𐑰𐑛" maps to "read" not "reed"
      '𐑘𐑻': 'year', // Ensure "𐑘𐑻" maps to "year" not "yr"
      '𐑣𐑽': 'hear', // Ensure "𐑣𐑽" maps to "hear" not "heir"
      '𐑸': 'are',   // Ensure "𐑸" maps to "are" correctly
      '𐑹': 'or',    // Ensure "𐑹" maps to "or" not "ore"
      '𐑥𐑱𐑛': 'made', // Ensure "𐑥𐑱𐑛" maps to "made" not "maid"
      '𐑒𐑪𐑟': 'cause', // Ensure "𐑒𐑪𐑟" maps to "cause" not "caws"
      '𐑣𐑵': 'who',     // Function word "who" (to avoid conflict with single 'h')
      '𐑚𐑰': 'be',     // Function word "be"
      '𐑚𐑲': 'by',     // Function word "by"
      '𐑞': 'the',     // Function word "the"
      '𐑛': 'do',      // Function word "do"
      '𐑢𐑻': 'were',   // Verb "were"
      '𐑓': 'for',     // Preposition "for"
      '𐑢𐑦𐑞': 'with',  // Preposition "with"
      '𐑓𐑮𐑪𐑥': 'from', // Preposition "from"
      // Single character mappings for better accuracy
      '𐑜': 'g',       // Single 'g' character
      '𐑒': 'k',       // Single 'k' character
      '𐑩': 'a',       // Article "a" (single schwa should be "a" not capitalized)
    };

    for (const [shavian, english] of Object.entries(specificReverseMappings)) {
      this.reverseDictionary.set(shavian, english);
    }
  }

  transliterate(text: string): string {
    // Reset context at the beginning of each transliteration
    this.previousWord = '';
    this.previousPos = '';
    this.previousWordWasProperName = false;

    // Split by whitespace but preserve words with attached punctuation
    const words = text.split(/(\s+)/);
    return words
      .map(segment => {
        if (segment.match(/^\s+$/)) {
          return segment;
        } else if (segment.match(/^[.,:;!?"'()[\]{}<>]+$/)) {
          // Pure punctuation (excluding hyphens and ellipses): do not transliterate
          return segment;
        } else if (segment.length > 0) {
          const result = this.transliterateWord(segment);
          // Update previous word context (only for actual words, not punctuation)
          // Check if result is not in punctuation{word} format before updating context
          if (segment.match(/\w/) && !isPunctuationProcessed(result)) {
            this.previousWord = segment.toLowerCase().replace(/[^\w']/g, '');
            // Track if this word is a proper name for the next word's context
            const isCapitalized =
              segment.length > 0 &&
              segment[0]! === segment[0]!.toUpperCase() &&
              segment[0]! !== segment[0]!.toLowerCase();
            this.previousWordWasProperName = isCapitalized && this.isProperNameWord(segment);
          }
          return result;
        }
        return segment;
      })
      .join('');
  }

  /**
   * POS-aware transliteration using wordpos package
   */
  async transliterateWithPOS(text: string): Promise<string> {
    const { posTagSentence } = await import('../../core/posTagger');

    try {
      const tokens = await posTagSentence(text);
      return this.transliterateWithPOSTags(tokens);
    } catch (error) {
      console.warn('POS tagging failed, falling back to basic transliteration:', error);
      return this.transliterate(text);
    }
  }

  /**
   * Transliterate a sentence using an array of POS-tagged tokens.
   * Each token should have { text, pos }.
   */
  transliterateWithPOSTags(tokens: POSTaggedToken[]): string {
    this.previousWord = '';
    this.previousPos = '';
    this.previousWordWasProperName = false;
    return tokens
      .map(token => {
        if (token.text.match(/^\s+$/)) {
          return token.text;
        } else if (token.text.length > 0) {
          const result = this.transliterateWord(token.text, token.pos);
          if (token.text.match(/\w/)) {
            this.previousWord = token.text.toLowerCase();
            this.previousPos = token.pos;
            // Track if this word is a proper name for the next word's context
            const isCapitalized =
              token.text.length > 0 &&
              token.text[0]! === token.text[0]!.toUpperCase() &&
              token.text[0]! !== token.text[0]!.toLowerCase();
            this.previousWordWasProperName = isCapitalized && this.isProperNameWord(token.text);
          }
          return result;
        }
        return token.text;
      })
      .join('');
  }

  /**
   * Transliterate a single word, optionally using a POS tag for heteronyms.
   */
  transliterateWord(word: string, pos?: string): string {
    if (!word || word.trim() === '') return word;
    // const originalWord = word;

    // Handle words separated by em-dashes FIRST, before punctuation processing
    // This ensures that em-dashes with multi-word content are handled correctly
    if (word.includes('—')) {
      const parts = word.split('—');
      const transliteratedParts = parts.map((part, index) => {
        if (part.trim() === '') return part;
        
        // If the part contains multiple words (has spaces), treat it as text to transliterate
        // rather than a single word
        const transliteratedPart = part.includes(' ') 
          ? this.transliterate(part) 
          : this.transliterateWordInternal(part, pos);
        
        // Update context after each part for proper name tracking
        if (part.match(/\w/)) {
          this.previousWord = part.toLowerCase().replace(/[^\w']/g, '');
          const isCapitalized = 
            part.length > 0 &&
            part[0]! === part[0]!.toUpperCase() &&
            part[0]! !== part[0]!.toLowerCase();
          this.previousWordWasProperName = isCapitalized && this.isProperNameWord(part);
        }
        
        return transliteratedPart;
      });
      return transliteratedParts.join('—');
    }

    // Process punctuation and separate clean word from punctuation
    const punctuationResult = processPunctuatedWord(word);

    if (punctuationResult.hasNonAlphabetic) {
      // Transliterate the clean word and reconstruct with punctuation
      const transliteratedCleanWord = this.transliterateWordInternal(
        punctuationResult.cleanWord || '',
        pos
      );
      return reconstructWordWithPunctuation(
        transliteratedCleanWord,
        punctuationResult.leadingPunctuation || '',
        punctuationResult.trailingPunctuation || ''
      );
    }

    // Handle compound words with hyphens
    if (word.includes('-') && !word.match(/^[-]+$/)) {
      const parts = word.split('-');
      const transliteratedParts = parts.map(part => {
        if (part.trim() === '') return part;
        return this.transliterateWordInternal(part, pos);
      });
      return transliteratedParts.join('-');
    }

    // Handle words with ellipses
    if (word.includes('…')) {
      const parts = word.split('…');
      const transliteratedParts = parts.map(part => {
        if (part.trim() === '') return part;
        return this.transliterateWordInternal(part, pos);
      });
      return transliteratedParts.join('…');
    }

    // Handle words with pipe characters
    if (word.includes('|')) {
      const parts = word.split('|');
      const transliteratedParts = parts.map(part => {
        if (part.trim() === '') return part;
        return this.transliterateWordInternal(part, pos);
      });
      return transliteratedParts.join('|');
    }

    return this.transliterateWordInternal(word, pos);
  }

  /**
   * Internal method to transliterate a single word part without compound handling
   */
  protected transliterateWordInternal(word: string, pos?: string): string {
    if (!word || word.trim() === '') return word;

    const originalWord = word;
    const clean = word.toLowerCase().replace(/[^\w']/g, '');

    // 1. Check names dictionary only for proper nouns (highest priority for proper names)
    if (this.isProperNameWord(originalWord)) {
      const nameResult = namesDict[originalWord.toLowerCase()];
      if (nameResult) {
        return this.shouldAddProperNameMarker(originalWord, clean, pos)
          ? `·${nameResult}`
          : nameResult;
      }
    }

    // 2. Function words check (highest priority for non-proper names)
    if (clean in this.functionWords) {
      return this.functionWords[clean]!.replace(/^:+|:+$/g, '');
    }

    // 3. Handle "to" after specific function words (befto logic)
    if (clean === 'to' && this.previousWord in this.beftoMap) {
      return this.beftoMap[this.previousWord]!.replace(/^:+|:+$/g, '');
    }

    // Check if we have new POS-aware dictionary format
    if (this.dictionary && typeof this.dictionary.getTransliteration === 'function') {
      // Check if this is a capitalized word for proper name marker
      // const isCapitalized =
      //   originalWord.length > 0 &&
      //   originalWord[0]! === originalWord[0]!.toUpperCase() &&
      //   originalWord[0]! !== originalWord[0]!.toLowerCase();

      // 3. Try POS-specific lookup first if POS is provided
      const result = this.dictionary.getTransliteration(clean, pos);
      if (result) {
        const cleanResult = result.replace(/^[.:]+|[.:]+$/g, '');
        return this.shouldAddProperNameMarker(originalWord, clean, pos)
          ? `·${cleanResult}`
          : cleanResult;
      }

      // 4. Fallback to basic lookup without POS
      const basicResult = this.dictionary.getTransliteration(clean);
      if (basicResult) {
        const cleanBasicResult = basicResult.replace(/^[.:]+|[.:]+$/g, '');
        return this.shouldAddProperNameMarker(originalWord, clean, pos)
          ? `·${cleanBasicResult}`
          : cleanBasicResult;
      }

      // 5. Handle contractions with suffix patterns
      if (word.includes("'")) {
        const parts = word.split("'");
        if (parts.length === 2 && parts[0] && parts[1]) {
          const base = parts[0].toLowerCase();
          const suffix = `'${parts[1].toLowerCase()}`;
          // Look for suffix pattern in basic dictionary
          const suffixKey = `$${suffix}`;
          const suffixResult = this.dictionary.getTransliteration(suffixKey);
          if (suffixResult) {
            const baseTransliteration = this.transliterateWord(base);
            return (
              baseTransliteration + suffixResult.replace(/^[.:]+|[.:]+$/g, '').replace(/^'/, '')
            ).replace(/^:+|:+$/g, '');
          }
        }
      }

      // TODO: Handle prefix/suffix rules for new format
      // For now, fallback to original word
      return word;
    } else if (this.dictionary && typeof this.dictionary.has === 'function') {
      // Legacy Map-based dictionary format
      // 3. Prefer POS-specific dictionary entry if POS is provided
      if (pos && this.dictionary.has(`${clean}_${pos}`)) {
        const result = this.dictionary.get(`${clean}_${pos}`);
        if (result) {
          const cleanResult = result.replace(/^[.:]+|[.:]+$/g, '');
          return this.shouldAddProperNameMarker(originalWord, clean, pos)
            ? `·${cleanResult}`
            : cleanResult;
        }
      }

      // 4. Check for direct dictionary match first (including contractions with underscore)
      if (this.dictionary.has(`${clean}_`)) {
        const result = this.dictionary.get(`${clean}_`);
        if (result) {
          const cleanResult = result.replace(/^[.:]+|[.:]+$/g, '');
          return this.shouldAddProperNameMarker(originalWord, clean, pos)
            ? `·${cleanResult}`
            : cleanResult;
        }
      }

      // 5. Check direct dictionary match
      let result = this.dictionary.get(clean);
      if (result) {
        const cleanResult = result.replace(/^[.:]+|[.:]+$/g, '');
        return this.shouldAddProperNameMarker(originalWord, clean, pos)
          ? `·${cleanResult}`
          : cleanResult;
      }

      // 6. Handle contractions with suffix patterns from dictionary
      if (word.includes("'")) {
        const parts = word.split("'");
        if (parts.length === 2 && parts[0] && parts[1]) {
          const base = parts[0].toLowerCase();
          const suffix = `'${parts[1].toLowerCase()}`;
          // Look for suffix pattern in dictionary
          const suffixKey = `$${suffix}`;
          if (this.dictionary.has(suffixKey)) {
            const baseTransliteration = this.transliterateWord(base);
            const suffixTransliteration = this.dictionary.get(suffixKey)!;
            return (
              baseTransliteration +
              suffixTransliteration.replace(/^[.:]+|[.:]+$/g, '').replace(/^'/, '')
            ).replace(/^:+|:+$/g, '');
          }
        }
      }

      // 7. Prefix rule: ^prefix
      for (const [key, value] of this.dictionary.entries()) {
        if (key.startsWith('^')) {
          const prefix = key.slice(1);
          if (clean.startsWith(prefix)) {
            return (value + this.transliterateWord(clean.slice(prefix.length))).replace(
              /^:+|:+$/g,
              ''
            );
          }
        }
      }

      // 8. Suffix rule: $suffix (for non-contraction suffixes)
      for (const [key, value] of this.dictionary.entries()) {
        if (key.startsWith('$') && !key.includes("'")) {
          const suffix = key.slice(1);
          if (clean.endsWith(suffix)) {
            return (
              this.transliterateWord(clean.slice(0, clean.length - suffix.length)) +
              value.replace(/^[.:]+|[.:]+$/g, '')
            ).replace(/^:+|:+$/g, '');
          }
        }
      }

      // 9. Always dot: Capitalized word in dict
      if (this.dictionary.has(originalWord)) {
        result = this.dictionary.get(originalWord);
        if (result) return `·${result.replace(/^[.:]+|[.:]+$/g, '')}`.replace(/^:+|:+$/g, '');
      }

      // 10. Part-of-speech specific entries (word_POS) if not already checked
      if (!pos) {
        const posVariants = ['_VB', '_NN', '_NNS', '_JJ', '_RB'];
        for (const p of posVariants) {
          if (this.dictionary.has(clean + p)) {
            result = this.dictionary.get(clean + p);
            if (result) return result.replace(/^[.:]+|[.:]+$/g, '');
          }
        }
      }

      // 11. Handle word ending variations for better matching
      if (this.dictionary.has(`${clean}.`)) {
        result = this.dictionary.get(`${clean}.`);
        if (result) return result.replace(/^[.:]+|[.:]+$/g, '');
      }
    }

    // 12. Fallback - return original word if no transliteration found
    return word;
  }

  /**
   * Helper method to check if a word should be considered a proper name
   * (without determining if it needs a marker)
   */
  private isProperNameWord(originalWord: string): boolean {
    // Must be capitalized
    if (originalWord.length === 0 || originalWord[0]! !== originalWord[0]!.toUpperCase()) {
      return false;
    }

    // Check if this is an acronym (all uppercase letters with possible dots)
    const isAcronym = originalWord.match(/^[A-Z]+\.?$/);
    if (isAcronym) {
      return true;
    }

    // Check if this is a title case word that's not a common sentence starter
    const commonSentenceStarters = ['the', 'a', 'an', 'this', 'that', 'these', 'those'];
    if (commonSentenceStarters.includes(originalWord.toLowerCase())) {
      return false;
    }

    // If the word is in the function words list, it's probably not a proper name
    // unless it's at the start of a sentence
    if (originalWord.toLowerCase() in this.functionWords) {
      return false;
    }

    return true;
  }

  /**
   * Determine if a word should get a proper name marker (·)
   * Based on capitalization and linguistic patterns
   */
  private shouldAddProperNameMarker(
    originalWord: string,
    cleanWord: string,
    pos?: string
  ): boolean {
    // Never add marker for function words
    if (cleanWord in this.functionWords) {
      return false;
    }

    // Add marker for proper nouns identified by POS tagger
    if (pos && (pos === 'NNP' || pos === 'NNPS')) {
      return true;
    }

    // Add marker if it's clearly a proper name
    if (this.isProperNameWord(originalWord)) {
      // Don't add marker if previous word was also a proper name (compound names)
      if (this.previousWordWasProperName) {
        return false;
      }
      return true;
    }

    return false;
  }

  addToDictionary(word: string, transliteration: string): void {
    if (this.dictionary && typeof this.dictionary.set === 'function') {
      // Legacy Map format
      this.dictionary.set(word.toLowerCase(), transliteration);
    } else {
      // New format - we can't easily add to the ReadlexDictionaryImpl structure
      // For now, fallback to creating a Map if needed
      if (!this.dictionary || typeof this.dictionary.set !== 'function') {
        const tempMap = new Map();
        tempMap.set(word.toLowerCase(), transliteration);
        // This is a limitation - we lose POS-aware functionality for dynamically added words
        console.warn('Adding words to POS-aware dictionary not fully supported yet');
      }
    }

    // Also add to reverse dictionary
    const transliterationStr =
      typeof transliteration === 'string' ? transliteration : String(transliteration);
    const cleanShavian = transliterationStr.replace(/^[.:]+|[.:]+$/g, '');
    if (cleanShavian) {
      this.reverseDictionary.set(cleanShavian, word.toLowerCase());
    }
  }

  getDictionarySize(): number {
    if (this.dictionary && typeof this.dictionary.size === 'number') {
      return this.dictionary.size;
    } else if (this.dictionary && typeof this.dictionary.basic === 'object') {
      return Object.keys(this.dictionary.basic).length;
    }
    return 0;
  }

  /**
   * Reverse transliteration - implemented here for interface compatibility
   * This will be delegated to the ShavianToEnglishEngine
   */
  reverseTransliterate(text: string): string {
    // This should be implemented by ShavianToEnglishEngine
    // For now, return as-is to maintain compatibility
    console.warn('reverseTransliterate should be handled by ShavianToEnglishEngine');
    return text;
  }

  reverseTransliterateWord(word: string): string {
    // This should be implemented by ShavianToEnglishEngine
    // For now, return as-is to maintain compatibility
    console.warn('reverseTransliterateWord should be handled by ShavianToEnglishEngine');
    return word;
  }

  /**
   * Capitalize the first letter of a word for sentence beginnings
   */
  private capitalizeFirstLetter(word: string): string {
    if (!word || word.length === 0) return word;
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  /**
   * Capitalize proper names, handling complex cases like initials
   */
  private capitalizeProperName(word: string): string {
    if (!word || word.length === 0) return word;

    // Handle initials (like "g. k. chesterton" -> "G. K. Chesterton")
    if (word.match(/^[a-z]\./)) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }

    // Handle regular proper names
    return this.capitalizeFirstLetter(word);
  }
}

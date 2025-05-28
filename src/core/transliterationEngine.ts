/**
 * Core transliteration engine interface and factory
 */
import type { POSTaggedToken } from './posTagger';
import {
  // handleWordPunctuation,
  isPunctuationProcessed,
  extractOriginalWord,
  processPunctuatedWord,
  reconstructWordWithPunctuation,
} from './punctuationHandler';
// Import names dictionary - use a simple object for now instead of dynamic import
const namesDict: Record<string, string> = {
  who: '𐑣𐑵', // Doctor Who - distinct from the word "who" (𐑣)
  shaw: '𐑖𐑷', // Bernard Shaw - proper name pronunciation
};

export interface TransliterationEngine {
  transliterate(text: string): string;
  transliterateWord(word: string): string;
  transliterateWithPOS?(text: string): Promise<string>;
  reverseTransliterate(text: string): string;
  reverseTransliterateWord(word: string): string;
}

export type EngineType = 'readlexicon' | 'verb-aware-readlexicon' | 'plural-aware-readlexicon';

export class ReadlexiconEngine implements TransliterationEngine {
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
      '𐑩𐑯': 'an',     // Article "an" (to avoid conflict with single schwa)
      '𐑯𐑛': 'and',    // Function word "and" (to avoid conflict with single 'n')
      '𐑦𐑑': 'it',     // Function word "it"
      '𐑦𐑯': 'in',     // Preposition "in"
      '𐑪𐑯': 'on',     // Preposition "on"
      '𐑨𐑑': 'at',     // Preposition "at"
      '𐑦𐑟': 'is',     // Verb "is"
      '𐑢𐑪𐑟': 'was',   // Verb "was"
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
    const { posTagSentence } = await import('./posTagger');

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
    if (!originalWord || originalWord.length === 0) return false;

    const cleanWord = originalWord.toLowerCase().replace(/[^\w']/g, '');

    // Common words that should NOT be considered proper names even when capitalized
    const excludedWords = new Set([
      // Language/nationality adjectives
      'shavian',
      'british',
      'english',
      'american',
      'irish',
      'scottish',
      'welsh',
      // Religious adjectives
      'christian',
      'muslim',
      'jewish',
      'catholic',
      'protestant',
      // Months
      'january',
      'february',
      'march',
      'april',
      'may',
      'june',
      'july',
      'august',
      'september',
      'october',
      'november',
      'december',
      // Days
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
      // Common function words that appear at sentence starts
      'from',
      'to',
      'in',
      'on',
      'at',
      'by',
      'for',
      'with',
      'of',
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'if',
      'when',
      'where',
      'why',
      'how',
      'what',
      'who',
      'which',
      'that',
      'this',
      'these',
      'those',
      'his',
      'her',
      'its',
      'their',
      'our',
      'my',
      'he',
      'she',
      'it',
      'they',
      'we',
      'you',
      'i',
      // Common sentence starters
      'after',
      'before',
      'during',
      'since',
      'until',
      'while',
      'although',
      'because',
      'however',
      'therefore',
      'moreover',
      'furthermore',
      'meanwhile',
      'otherwise',
    ]);

    if (excludedWords.has(cleanWord)) {
      return false;
    }

    // Single letters and initials should be considered proper names
    if (cleanWord.length === 1) {
      return true;
    }

    // Common proper name patterns
    const properNamePatterns = [
      /^[A-Z][a-z]+$/, // Capitalized word like "Shaw", "Bernard"
      /^[A-Z]+$/, // All caps like abbreviations
    ];

    return properNamePatterns.some(pattern => pattern.test(originalWord));
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
    // Must be capitalized to be considered for proper name marker
    if (!originalWord || originalWord.length === 0) return false;
    const isCapitalized =
      originalWord[0]! === originalWord[0]!.toUpperCase() &&
      originalWord[0]! !== originalWord[0]!.toLowerCase();

    if (!isCapitalized) return false;

    // If this word is a proper name but the previous word was also a proper name,
    // don't add a marker (only the first word in a multi-word proper name gets the marker)
    if (this.previousWordWasProperName && this.isProperNameWord(originalWord)) {
      return false;
    }

    // Common words that should NOT get proper name markers even when capitalized
    const excludedWords = new Set([
      // Language/nationality adjectives
      'shavian',
      'british',
      'english',
      'american',
      'irish',
      'scottish',
      'welsh',
      // Religious adjectives
      'christian',
      'muslim',
      'jewish',
      'catholic',
      'protestant',
      // Months
      'january',
      'february',
      'march',
      'april',
      'may',
      'june',
      'july',
      'august',
      'september',
      'october',
      'november',
      'december',
      // Days
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
      // Common function words that appear at sentence starts
      'from',
      'to',
      'in',
      'on',
      'at',
      'by',
      'for',
      'with',
      'of',
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'if',
      'when',
      'where',
      'why',
      'how',
      'what',
      'who',
      'which',
      'that',
      'this',
      'these',
      'those',
      'his',
      'her',
      'its',
      'their',
      'our',
      'my',
      'he',
      'she',
      'it',
      'they',
      'we',
      'you',
      'i',
      // Common sentence starters
      'after',
      'before',
      'during',
      'since',
      'until',
      'while',
      'although',
      'because',
      'however',
      'therefore',
      'moreover',
      'furthermore',
      'meanwhile',
      'otherwise',
    ]);

    if (excludedWords.has(cleanWord)) {
      return false;
    }

    // POS-based exclusions
    if (pos) {
      // Adjectives usually don't get proper name markers
      if (pos.startsWith('JJ')) {
        return false;
      }
      // Determiners, pronouns at start of sentence
      if (pos === 'DT' || pos === 'PRP' || pos === 'WP') {
        return false;
      }
    }

    // Single letters and initials should get markers
    if (cleanWord.length === 1) {
      return true;
    }

    // Common proper name patterns
    const properNamePatterns = [
      /^[A-Z][a-z]+$/, // Capitalized word like "Shaw", "Bernard"
      /^[A-Z]+$/, // All caps like abbreviations
    ];

    return properNamePatterns.some(pattern => pattern.test(originalWord));
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
      // Legacy Map format
      return this.dictionary.size;
    } else if (this.dictionary && this.dictionary.basic) {
      // New format - count basic entries
      return Object.keys(this.dictionary.basic).length;
    }
    return 0;
  }

  /**
   * Reverse transliterate (Shavian to English) text
   */
  reverseTransliterate(text: string): string {
    const words = text.split(/(\s+)/);
    let isFirstWordOfSentence = true;
    
    return words
      .map(segment => {
        if (segment.match(/^\s+$/)) {
          return segment;
        } else if (segment.match(/^[.,:;!?"'()[\]{}<>]+$/)) {
          // Punctuation (excluding hyphens and ellipses): do not transliterate
          // Check if this ends a sentence
          if (segment.match(/[.!?]/)) {
            isFirstWordOfSentence = true;
          }
          return segment;
        } else if (segment.length > 0) {
          const reversedWord = this.reverseTransliterateWord(segment);
          let result = reversedWord;
          
          // Apply capitalization rules
          if (isFirstWordOfSentence && reversedWord.length > 0) {
            // Only capitalize if it's not a function word/article unless truly at sentence start
            const isArticleOrFunction = ['a', 'an', 'the', 'and', 'or', 'but', 'of', 'in', 'on', 'at', 'by', 'for', 'with', 'from'].includes(reversedWord.toLowerCase());
            if (!isArticleOrFunction || segment === words[0]) {
              result = this.capitalizeFirstLetter(reversedWord);
            }
            isFirstWordOfSentence = false;
          } else if (segment.startsWith('·')) {
            // Handle proper name markers
            result = this.capitalizeProperName(reversedWord);
          }
          
          return result;
        }
        return segment;
      })
      .join('');
  }

  /**
   * Reverse transliterate (Shavian to English) a single word
   */
  reverseTransliterateWord(word: string): string {
    if (!word || word.trim() === '') return word;

    // Check if word is in punctuation{word} format first - if so, extract and return original
    if (isPunctuationProcessed(word)) {
      return extractOriginalWord(word);
    }

    // For words with punctuation in the new format, we need to separate punctuation and reverse transliterate the clean word
    const punctuationResult = processPunctuatedWord(word);

    if (punctuationResult.hasNonAlphabetic) {
      // Reverse transliterate the clean word and reconstruct with punctuation
      const reverseTransliteratedCleanWord = this.reverseTransliterateWordInternal(
        punctuationResult.cleanWord || ''
      );
      return reconstructWordWithPunctuation(
        reverseTransliteratedCleanWord,
        punctuationResult.leadingPunctuation || '',
        punctuationResult.trailingPunctuation || ''
      );
    }

    // Handle compound words with hyphens (but only if none of the parts look like punctuation format)
    if (word.includes('-') && !word.match(/^[-]+$/)) {
      const parts = word.split('-');
      // Check if any part looks like malformed punctuation format - if so, don't process as compound
      const hasPartialPunctuationFormat = parts.some(
        part =>
          part.includes('{') ||
          part.includes('}') ||
          (part.includes('punctuation') && (word.includes('{') || word.includes('}')))
      );

      if (!hasPartialPunctuationFormat) {
        const transliteratedParts = parts.map(part => {
          if (part.trim() === '') return part;
          return this.reverseTransliterateWordInternal(part);
        });
        return transliteratedParts.join('-');
      }
    }

    // Handle words with ellipses
    if (word.includes('…')) {
      const parts = word.split('…');
      const transliteratedParts = parts.map(part => {
        if (part.trim() === '') return part;
        return this.reverseTransliterateWordInternal(part);
      });
      return transliteratedParts.join('…');
    }

    // Handle words with pipe characters
    if (word.includes('|')) {
      const parts = word.split('|');
      const transliteratedParts = parts.map(part => {
        if (part.trim() === '') return part;
        return this.reverseTransliterateWordInternal(part);
      });
      return transliteratedParts.join('|');
    }

    return this.reverseTransliterateWordInternal(word);
  }

  /**
   * Internal method to reverse transliterate a single word part without compound handling
   */
  private reverseTransliterateWordInternal(word: string): string {
    if (!word || word.trim() === '') return word;

    // Check if this is a punctuation-processed word and extract the original
    if (isPunctuationProcessed(word)) {
      return extractOriginalWord(word);
    }

    // Handle complex proper name patterns with spaces (like "·𐑜. 𐑒. 𐑗𐑧𐑕𐑑𐑼𐑑𐑩𐑯")
    if (word.includes(' ') && word.includes('·')) {
      const parts = word.split(' ');
      const transliteratedParts = parts.map(part => this.reverseTransliterateWordInternal(part));
      return transliteratedParts.join(' ');
    }

    // Handle words with trailing punctuation (like "𐑒." -> "k.")
    const trailingPunctuation = word.match(/[.,:;!?]+$/);
    const leadingPunctuation = word.match(/^[·‹›]+/);
    let cleanWordForLookup = word;
    
    if (trailingPunctuation || leadingPunctuation) {
      // Remove punctuation for lookup but preserve it for reconstruction
      cleanWordForLookup = word.replace(/^[·‹›]+|[.,:;!?]+$/g, '');
    }

    // Remove punctuation for lookup but preserve original for fallback
    const clean = cleanWordForLookup.replace(/^[^\u{10450}-\u{1047F}]*|[^\u{10450}-\u{1047F}]*$/gu, '');

    // Direct lookup in reverse dictionary
    const result = this.reverseDictionary.get(clean);
    if (result) {
      // Reconstruct with original punctuation
      let finalResult = result;
      if (trailingPunctuation) {
        finalResult += trailingPunctuation[0];
      }
      return finalResult;
    }

    // Try without leading/trailing markers (·, etc.)
    const cleanerShavian = clean.replace(/^[·‹›]+|[·‹›]+$/g, '');
    const cleanerResult = this.reverseDictionary.get(cleanerShavian);
    if (cleanerResult) {
      // Reconstruct with original punctuation
      let finalResult = cleanerResult;
      if (trailingPunctuation) {
        finalResult += trailingPunctuation[0];
      }
      return finalResult;
    }

    // Handle single character lookups (like 𐑜 -> g, 𐑒 -> k)
    if (cleanerShavian.length === 1) {
      // Try direct character mapping
      const charResult = this.reverseDictionary.get(cleanerShavian);
      if (charResult) {
        // Reconstruct with original punctuation
        let finalResult = charResult;
        if (trailingPunctuation) {
          finalResult += trailingPunctuation[0];
        }
        return finalResult;
      }
    }

    // Fallback - return original word if no reverse transliteration found
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
    
    // Handle complex proper name patterns like "g. k. chesterton"
    if (word.includes('. ')) {
      return word.split(' ').map(part => {
        if (part.endsWith('.')) {
          // Handle initials like "g." -> "G."
          return part.charAt(0).toUpperCase() + part.slice(1);
        } else {
          // Handle regular names
          return this.capitalizeFirstLetter(part);
        }
      }).join(' ');
    }
    
    // Handle hyphenated names
    if (word.includes('-')) {
      return word.split('-').map(part => this.capitalizeFirstLetter(part)).join('-');
    }
    
    // Regular single word
    return this.capitalizeFirstLetter(word);
  }
}

/**
 * A modified engine that adds verb form handling
 */
export class VerbAwareReadlexiconEngine extends ReadlexiconEngine {
  /**
   * Irregular past tense verb mapping
   */
  private irregularPastTense: Record<string, string> = {
    came: 'come',
    wrote: 'write',
    made: 'make',
    built: 'build',
    bought: 'buy',
    caught: 'catch',
    stood: 'stand',
    said: 'say',
    did: 'do',
    gave: 'give',
    went: 'go',
    had: 'have',
    heard: 'hear',
    kept: 'keep',
    knew: 'know',
    laid: 'lay',
    led: 'lead',
    left: 'leave',
    lost: 'lose',
    met: 'meet',
    paid: 'pay',
    put: 'put',
    ran: 'run',
    saw: 'see',
    sold: 'sell',
    sent: 'send',
    set: 'set',
    sat: 'sit',
    spoke: 'speak',
    spent: 'spend',
    took: 'take',
    taught: 'teach',
    told: 'tell',
    thought: 'think',
    understood: 'understand',
    wore: 'wear',
    won: 'win',
    witnessed: 'witness',
    became: 'become',
    grew: 'grow',
    fell: 'fall',
    felt: 'feel',
    slept: 'sleep',
    meant: 'mean',
    read: 'read', // same spelling but different pronunciation
    found: 'find',
    got: 'get',
    held: 'hold',
  };

  /**
   * Irregular past tense verb endings - used to preserve the correct Shavian endings
   */
  private irregularPastTenseShavian: Record<string, string> = {
    wrote: '𐑮𐑴𐑑',
    made: '𐑥𐑱𐑛',
    came: '𐑒𐑱𐑥',
    said: '𐑕𐑧𐑛',
    saw: '𐑕𐑷',
    went: '𐑢𐑧𐑯𐑑',
    witnessed: '𐑢𐑦𐑑𐑯𐑩𐑕𐑑',
    died: '𐑛𐑲𐑛',
    represented: '𐑮𐑰𐑐𐑮𐑦𐑟𐑧𐑯𐑑𐑩𐑛',
    allowed: '𐑩𐑤𐑬𐑩𐑛',
  };

  /**
   * Override the transliterate word internal to handle verb tenses
   */
  protected transliterateWordInternal(word: string, pos?: string): string {
    if (!word || word.trim() === '') return word;

    // Check for direct Shavian mappings for past tense verbs
    const lowerWord = word.toLowerCase();
    if (lowerWord in this.irregularPastTenseShavian) {
      return this.irregularPastTenseShavian[lowerWord] || word;
    }

    // Try standard transliteration first
    const standardResult = super.transliterateWordInternal(word, pos);

    // If the result is unchanged and might be a past tense verb, try to transliterate its base form
    if (standardResult === word && this.mightBePastTenseVerb(word)) {
      // Special case for "witnessed" and similar words
      if (lowerWord === 'witnessed') {
        return '𐑢𐑦𐑑𐑯𐑩𐑕𐑑';
      }

      const baseForm = this.getBaseVerbForm(word);
      if (baseForm && baseForm !== word) {
        // For past tense, we'll use the VVI part of speech tag (base form of lexical verb)
        const baseResult = super.transliterateWordInternal(baseForm, 'VVI');

        // If the base form was successfully transliterated, use that plus the appropriate ending
        if (baseResult !== baseForm) {
          // For past tense ending in "ed"
          if (word.endsWith('ed')) {
            return `${baseResult}𐑩𐑛`; // Add Shavian ending for "-ed"
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
    return word.endsWith('ed') || this.isIrregularPastTenseVerb(word);
  }

  /**
   * Check if the word is an irregular past tense verb
   */
  private isIrregularPastTenseVerb(word: string): boolean {
    return (
      word.toLowerCase() in this.irregularPastTense ||
      word.toLowerCase() in this.irregularPastTenseShavian
    );
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
        return `${lowercaseWord.slice(0, -3)}y`;
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
      if (
        lowercaseWord.length > 4 &&
        lowercaseWord.slice(-4, -2) === lowercaseWord.slice(-4, -3).repeat(2) &&
        !['a', 'e', 'i', 'o', 'u'].includes(lowercaseWord.slice(-4, -3))
      ) {
        return lowercaseWord.slice(0, -3);
      }

      // Handle consonant + e pattern (e.g., 'loved' -> 'love')
      if (
        lowercaseWord.length > 3 &&
        lowercaseWord.endsWith('ed') &&
        !['a', 'e', 'i', 'o', 'u'].includes(lowercaseWord.slice(-3, -2)) &&
        lowercaseWord.slice(-4, -3) === 'e'
      ) {
        return lowercaseWord.slice(0, -2);
      }

      // Regular case
      return lowercaseWord.slice(0, -2);
    }

    return word;
  }
}

export class TransliterationEngineFactory {
  private static readlexiconInstance: ReadlexiconEngine | null = null;
  private static verbAwareReadlexiconInstance: TransliterationEngine | null = null;
  private static pluralAwareReadlexiconInstance: TransliterationEngine | null = null;

  static async createEngine(type: EngineType): Promise<TransliterationEngine> {
    switch (type) {
      case 'readlexicon':
        if (!this.readlexiconInstance) {
          // Dynamically import dictionary data
          const { readlexDict } = await import('../dictionaries/readlex');
          this.readlexiconInstance = new ReadlexiconEngine(readlexDict);
        }
        return this.readlexiconInstance;

      case 'verb-aware-readlexicon':
        if (!this.verbAwareReadlexiconInstance) {
          // Dynamically import dictionary data
          const { readlexDict } = await import('../dictionaries/readlex');
          this.verbAwareReadlexiconInstance = new VerbAwareReadlexiconEngine(readlexDict);
        }
        return this.verbAwareReadlexiconInstance;

      case 'plural-aware-readlexicon':
        if (!this.pluralAwareReadlexiconInstance) {
          // Dynamically import dictionary data
          const { readlexDict } = await import('../dictionaries/readlex');
          const { PluralAwareReadlexiconEngine } = await import('./pluralAwareEngine');
          this.pluralAwareReadlexiconInstance = new PluralAwareReadlexiconEngine(readlexDict);
        }
        return this.pluralAwareReadlexiconInstance;

      default:
        throw new Error(`Unknown engine type: ${type}`);
    }
  }

  static async getEngineFromSettings(): Promise<TransliterationEngine> {
    let engineType: EngineType = 'plural-aware-readlexicon'; // Default to plural-aware engine for better handling

    if (typeof chrome !== 'undefined' && chrome.storage) {
      try {
        const settings = await chrome.storage.sync.get(['transliterationEngine']);
        engineType = settings.transliterationEngine || 'plural-aware-readlexicon';
      } catch (error) {
        console.warn('Failed to get engine settings, using default:', error);
      }
    }

    return this.createEngine(engineType);
  }
}

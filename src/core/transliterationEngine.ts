/**
 * Core transliteration engine interface and factory
 */
import type { POSTaggedToken } from './posTagger';
import { handleWordPunctuation, isPunctuationProcessed, extractOriginalWord } from './punctuationHandler';

export interface TransliterationEngine {
  transliterate(text: string): string;
  transliterateWord(word: string): string;
  transliterateWithPOS?(text: string): Promise<string>;
  reverseTransliterate(text: string): string;
  reverseTransliterateWord(word: string): string;
}

export type EngineType = 'readlexicon';

export class ReadlexiconEngine implements TransliterationEngine {
  private dictionary: Map<string, string> | any = new Map();
  private reverseDictionary: Map<string, string> = new Map();
  private previousWord: string = '';
  private previousPos: string = '';

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
  }

  transliterate(text: string): string {
    // Reset context at the beginning of each transliteration
    this.previousWord = '';
    this.previousPos = '';

    // Split by whitespace but preserve words with attached punctuation
    const words = text.split(/(\s+)/);
    return words
      .map(segment => {
        if (segment.match(/^\s+$/)) {
          return segment;
        } else if (segment.match(/^[.,:;!?"'()\[\]{}<>]+$/)) {
          // Pure punctuation (excluding hyphens and ellipses): do not transliterate
          return segment;
        } else if (segment.length > 0) {
          const result = this.transliterateWord(segment);
          // Update previous word context (only for actual words, not punctuation)
          // Check if result is not in punctuation{word} format before updating context
          if (segment.match(/\w/) && !isPunctuationProcessed(result)) {
            this.previousWord = segment.toLowerCase().replace(/[^\w']/g, '');
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
    return tokens
      .map(token => {
        if (token.text.match(/^\s+$/)) {
          return token.text;
        } else if (token.text.length > 0) {
          const result = this.transliterateWord(token.text, token.pos);
          if (token.text.match(/\w/)) {
            this.previousWord = token.text.toLowerCase();
            this.previousPos = token.pos;
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
    const originalWord = word;

    // Check for punctuation first - if word has non-alphabetic characters, handle with punctuation handler
    const punctuationResult = handleWordPunctuation(word);
    if (punctuationResult !== word) {
      return punctuationResult;
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

    return this.transliterateWordInternal(word, pos);
  }

  /**
   * Internal method to transliterate a single word part without compound handling
   */
  private transliterateWordInternal(word: string, pos?: string): string {
    if (!word || word.trim() === '') return word;
    
    const originalWord = word;
    const clean = word.toLowerCase().replace(/[^\w']/g, '');

    // 1. Function words check (highest priority)
    if (clean in this.functionWords) {
      return this.functionWords[clean]!.replace(/^:+|:+$/g, '');
    }

    // 2. Handle "to" after specific function words (befto logic)
    if (clean === 'to' && this.previousWord in this.beftoMap) {
      return this.beftoMap[this.previousWord]!.replace(/^:+|:+$/g, '');
    }

    // Check if we have new POS-aware dictionary format
    if (this.dictionary && typeof this.dictionary.getTransliteration === 'function') {
      // 3. Try POS-specific lookup first if POS is provided
      const result = this.dictionary.getTransliteration(clean, pos);
      if (result) {
        return result.replace(/^[.:]+|[.:]+$/g, '');
      }
      
      // 4. Fallback to basic lookup without POS
      const basicResult = this.dictionary.getTransliteration(clean);
      if (basicResult) {
        return basicResult.replace(/^[.:]+|[.:]+$/g, '');
      }
      
      // 5. Handle contractions with suffix patterns
      if (word.includes("'")) {
        const parts = word.split("'");
        if (parts.length === 2 && parts[0] && parts[1]) {
          const base = parts[0].toLowerCase();
          const suffix = "'" + parts[1].toLowerCase();
          // Look for suffix pattern in basic dictionary
          const suffixKey = '$' + suffix;
          const suffixResult = this.dictionary.getTransliteration(suffixKey);
          if (suffixResult) {
            const baseTransliteration = this.transliterateWord(base);
            return (
              baseTransliteration +
              suffixResult.replace(/^[.:]+|[.:]+$/g, '').replace(/^'/, '')
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
      if (pos && this.dictionary.has(clean + '_' + pos)) {
        const result = this.dictionary.get(clean + '_' + pos);
        if (result) return result.replace(/^[.:]+|[.:]+$/g, '');
      }

      // 4. Check for direct dictionary match first (including contractions with underscore)
      if (this.dictionary.has(clean + '_')) {
        const result = this.dictionary.get(clean + '_');
        if (result) return result.replace(/^[.:]+|[.:]+$/g, '');
      }

      // 5. Check direct dictionary match
      let result = this.dictionary.get(clean);
      if (result) {
        return result.replace(/^[.:]+|[.:]+$/g, '');
      }

      // 6. Handle contractions with suffix patterns from dictionary
      if (word.includes("'")) {
        const parts = word.split("'");
        if (parts.length === 2 && parts[0] && parts[1]) {
          const base = parts[0].toLowerCase();
          const suffix = "'" + parts[1].toLowerCase();
          // Look for suffix pattern in dictionary
          const suffixKey = '$' + suffix;
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
        if (result) return ('·' + result.replace(/^[.:]+|[.:]+$/g, '')).replace(/^:+|:+$/g, '');
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
      if (this.dictionary.has(clean + '.')) {
        result = this.dictionary.get(clean + '.');
        if (result) return result.replace(/^[.:]+|[.:]+$/g, '');
      }
    }

    // 12. Fallback - return original word if no transliteration found
    return word;
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
    const transliterationStr = typeof transliteration === 'string' ? transliteration : String(transliteration);
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
    return words
      .map(segment => {
        if (segment.match(/^\s+$/)) {
          return segment;
        } else if (segment.match(/^[.,:;!?"'()\[\]{}<>]+$/)) {
          // Punctuation (excluding hyphens and ellipses): do not transliterate
          return segment;
        } else if (segment.length > 0) {
          return this.reverseTransliterateWord(segment);
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

    // Handle compound words with hyphens (but only if none of the parts look like punctuation format)
    if (word.includes('-') && !word.match(/^[-]+$/)) {
      const parts = word.split('-');
      // Check if any part looks like malformed punctuation format - if so, don't process as compound
      const hasPartialPunctuationFormat = parts.some(part => 
        part.includes('{') || part.includes('}') || 
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

    // Remove punctuation for lookup but preserve original for fallback
    const clean = word.replace(/^[^\u{10450}-\u{1047F}]*|[^\u{10450}-\u{1047F}]*$/gu, '');

    // Direct lookup in reverse dictionary
    const result = this.reverseDictionary.get(clean);
    if (result) {
      return result;
    }

    // Try without leading/trailing markers (·, etc.)
    const cleanerShavian = clean.replace(/^[·‹›]+|[·‹›]+$/g, '');
    const cleanerResult = this.reverseDictionary.get(cleanerShavian);
    if (cleanerResult) {
      return cleanerResult;
    }

    // Fallback - return original word if no reverse transliteration found
    return word;
  }
}

export class TransliterationEngineFactory {
  private static readlexiconInstance: ReadlexiconEngine | null = null;

  static async createEngine(type: EngineType): Promise<TransliterationEngine> {
    switch (type) {
      case 'readlexicon':
        if (!this.readlexiconInstance) {
          // Dynamically import dictionary data
          const { readlexDict } = await import('../dictionaries/readlex');
          this.readlexiconInstance = new ReadlexiconEngine(readlexDict);
        }
        return this.readlexiconInstance;

      default:
        throw new Error(`Unknown engine type: ${type}`);
    }
  }

  static async getEngineFromSettings(): Promise<TransliterationEngine> {
    let engineType: EngineType = 'readlexicon';

    if (typeof chrome !== 'undefined' && chrome.storage) {
      try {
        const settings = await chrome.storage.sync.get(['transliterationEngine']);
        engineType = settings.transliterationEngine || 'readlexicon';
      } catch (error) {
        console.warn('Failed to get engine settings, using default:', error);
      }
    }

    return this.createEngine(engineType);
  }
}

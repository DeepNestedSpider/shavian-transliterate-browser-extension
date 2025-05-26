/**
 * Core transliteration engine interface and factory
 */
import toShavian from 'to-shavian';
import type { POSTaggedToken } from './posTagger';

export interface TransliterationEngine {
  transliterate(text: string): string;
  transliterateWord(word: string): string;
}

export type EngineType = 'to-shavian' | 'dechifro';

export class ToShavianEngine implements TransliterationEngine {
  private segmenter = new Intl.Segmenter('en-US', { granularity: 'word' });

  transliterate(text: string): string {
    const words = text.split(/(\s+)/);
    return words.map(segment => {
      if (segment.match(/^\s+$/)) {
        return segment;
      } else if (segment.length > 0) {
        return this.transliterateWord(segment);
      }
      return segment;
    }).join('');
  }

  transliterateWord(word: string): string {
    let shavianized = toShavian(word);
    shavianized = shavianized.replace(/ /g, '');

    if (shavianized === word && word.length > 1) {
      console.log(`Word "${word}" was not altered by to-shavian. Attempting segmentation.`);
      const segments = this.segmenter.segment(word);
      let reShavianized = '';
      for (const segment of segments) {
        if (segment.isWordLike) {
          reShavianized += toShavian(segment.segment).replace(/ /g, '');
        } else {
          reShavianized += segment.segment;
        }
      }
      if (reShavianized !== word) {
        return reShavianized;
      }
    }
    return shavianized;
  }
}

export class DechifroEngine implements TransliterationEngine {
  private dictionary: Map<string, string> = new Map();
  private previousWord: string = '';
  private previousPos: string = '';

  // Function word heuristics from original Python code
  // These handle pronunciation changes based on context
  private beftoMap: Record<string, string> = {
    'have': '𐑨𐑓',   // "have to" -> "𐑨𐑓" (haf)
    'has': '𐑨𐑕',    // "has to" -> "𐑨𐑕" (has)
    'used': '𐑕𐑑',   // "used to" -> "𐑕𐑑" (st)
    'unused': '𐑕𐑑', // "unused to" -> "𐑕𐑑" (st)
    'supposed': '𐑕𐑑' // "supposed to" -> "𐑕𐑑" (st)
  };

  // Common function words that should have specific Shavian forms
  private functionWords: Record<string, string> = {
    'and': '𐑯',      // "and" -> "𐑯" (n)
    'of': '𐑝',       // "of" -> "𐑝" (v)
    'the': '𐑞',      // "the" -> "𐑞" (th)
    'to': '𐑑',       // "to" -> "𐑑" (t)
    'a': '𐑩',        // "a" -> "𐑩" (uh)
    'an': '𐑩𐑯',      // "an" -> "𐑩𐑯" (uh-n)
    'in': '𐑦𐑯',      // "in" -> "𐑦𐑯" (in)
    'on': '𐑪𐑯',      // "on" -> "𐑪𐑯" (on)
    'at': '𐑨𐑑',      // "at" -> "𐑨𐑑" (at)
    'is': '𐑦𐑟',      // "is" -> "𐑦𐑟" (iz)
    'are': '𐑸',      // "are" -> "𐑸" (ar)
    'was': '𐑢𐑪𐑟',    // "was" -> "𐑢𐑪𐑟" (woz)
    'were': '𐑢𐑻',    // "were" -> "𐑢𐑻" (wer)
    'for': '𐑓',      // "for" -> "𐑓" (f)
    'with': '𐑢𐑦𐑞',   // "with" -> "𐑢𐑦𐑞" (with)
    'by': '𐑚𐑲',      // "by" -> "𐑚𐑲" (by)
    'from': '𐑓𐑮𐑪𐑥',  // "from" -> "𐑓𐑮𐑪𐑥" (from)
    'had': '𐑣𐑨𐑛',    // "had" -> "𐑣𐑨𐑛" (had)
    'have': '𐑣𐑨𐑝',   // "have" -> "𐑣𐑨𐑝" (hav)
    'has': '𐑣𐑨𐑟',    // "has" -> "𐑣𐑨𐑟" (haz)
    'would': '𐑢𐑫𐑛',  // "would" -> "𐑢𐑫𐑛" (wood)
    'could': '𐑒𐑫𐑛',  // "could" -> "𐑒𐑫𐑛" (kood)
    'should': '𐑖𐑫𐑛', // "should" -> "𐑖𐑫𐑛" (shood)
    'will': '𐑢𐑦𐑤',   // "will" -> "𐑢𐑦𐑤" (wil)
    'can': '𐑒𐑨𐑯',    // "can" -> "𐑒𐑨𐑯" (kan)
    'may': '𐑥𐑱',     // "may" -> "𐑥𐑱" (may)
    'shall': '𐑖𐑨𐑤',  // "shall" -> "𐑖𐑨𐑤" (shal)
    'do': '𐑛',       // "do" -> "𐑛" (d)
    'does': '𐑛𐑳𐑟',   // "does" -> "𐑛𐑳𐑟" (duz)
    'did': '𐑛𐑦𐑛',    // "did" -> "𐑛𐑦𐑛" (did)
    'be': '𐑚',       // "be" -> "𐑚" (b)
    'been': '𐑚𐑰𐑯',   // "been" -> "𐑚𐑰𐑯" (been)
    'being': '𐑚𐑰𐑦𐑙', // "being" -> "𐑚𐑰𐑦𐑙" (being)
    'this': '𐑞𐑦𐑕',   // "this" -> "𐑞𐑦𐑕" (this)
    'that': '𐑞𐑨𐑑',   // "that" -> "𐑞𐑨𐑑" (that)
    'which': '𐑢𐑦𐑗',  // "which" -> "𐑢𐑦𐑗" (wich)
    'who': '𐑣',      // "who" -> "𐑣" (h)
    'what': '𐑢𐑪𐑑',   // "what" -> "𐑢𐑪𐑑" (wot)
    'when': '𐑢𐑧𐑯',   // "when" -> "𐑢𐑧𐑯" (wen)
    'where': '𐑢𐑺',   // "where" -> "𐑢𐑺" (wer)
    'why': '𐑢𐑲',     // "why" -> "𐑢𐑲" (wy)
    'how': '𐑣𐑬',     // "how" -> "𐑣𐑬" (how)
    'not': '𐑯𐑪𐑑',    // "not" -> "𐑯𐑪𐑑" (not)
    'no': '𐑯𐑴',      // "no" -> "𐑯𐑴" (no)
    'yes': '𐑘𐑧𐑕',    // "yes" -> "𐑘𐑧𐑕" (yes)
    'all': '𐑷𐑤',     // "all" -> "𐑷𐑤" (awl)
    'any': '𐑧𐑯𐑦',    // "any" -> "𐑧𐑯𐑦" (eny)
    'some': '𐑕𐑳𐑥',   // "some" -> "𐑕𐑳𐑥" (sum)
    'one': '𐑢𐑳𐑯',    // "one" -> "𐑢𐑳𐑯" (wun)
    'two': '𐑑',      // "two" -> "𐑑" (t)
    'three': '𐑔𐑮',   // "three" -> "𐑔𐑮" (thr)
    'four': '𐑓𐑹',    // "four" -> "𐑓𐑹" (for)
    'five': '𐑓𐑲𐑝',   // "five" -> "𐑓𐑲𐑝" (fyv)
  };

  constructor(dictionaryData?: Record<string, string>) {
    if (dictionaryData) {
      this.loadDictionary(dictionaryData);
    }
  }

  private loadDictionary(data: Record<string, string>): void {
    for (const [key, value] of Object.entries(data)) {
      this.dictionary.set(key.toLowerCase(), value);
    }
  }

  transliterate(text: string): string {
    // Reset context at the beginning of each transliteration
    this.previousWord = '';
    this.previousPos = '';
    
    const words = text.split(/(\s+)/);
    return words.map(segment => {
      if (segment.match(/^\s+$/)) {
        return segment;
      } else if (segment.match(/^[.,:;!?"'()\[\]{}<>-]+$/)) {
        // Punctuation (including commas and more): do not transliterate, do not attach to previous word
        return segment;
      } else if (segment.length > 0) {
        const result = this.transliterateWord(segment);
        // Update previous word context (only for actual words, not punctuation)
        if (segment.match(/\w/)) {
          this.previousWord = segment.toLowerCase();
        }
        return result;
      }
      return segment;
    }).join('');
  }

  /**
   * Transliterate a sentence using an array of POS-tagged tokens.
   * Each token should have { text, pos }.
   */
  transliterateWithPOSTags(tokens: POSTaggedToken[]): string {
    this.previousWord = '';
    this.previousPos = '';
    return tokens.map(token => {
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
    }).join('');
  }

  /**
   * Transliterate a single word, optionally using a POS tag for heteronyms.
   */
  transliterateWord(word: string, pos?: string): string {
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
          return (baseTransliteration + suffixTransliteration.replace(/^[.:]+|[.:]+$/g, '').replace(/^'/, '')).replace(/^:+|:+$/g, '');
        }
      }
    }

    // 7. Prefix rule: ^prefix
    for (const [key, value] of this.dictionary.entries()) {
      if (key.startsWith('^')) {
        const prefix = key.slice(1);
        if (clean.startsWith(prefix)) {
          return (value + this.transliterateWord(clean.slice(prefix.length))).replace(/^:+|:+$/g, '');
        }
      }
    }

    // 8. Suffix rule: $suffix (for non-contraction suffixes)
    for (const [key, value] of this.dictionary.entries()) {
      if (key.startsWith('$') && !key.includes("'")) {
        const suffix = key.slice(1);
        if (clean.endsWith(suffix)) {
          return (this.transliterateWord(clean.slice(0, clean.length - suffix.length)) + value.replace(/^[.:]+|[.:]+$/g, '')).replace(/^:+|:+$/g, '');
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

    // 12. Fallback to to-shavian
    result = toShavian(word).replace(/ /g, '');
    return (result || word).replace(/^:+|:+$/g, '');
  }

  addToDictionary(word: string, transliteration: string): void {
    this.dictionary.set(word.toLowerCase(), transliteration);
  }

  getDictionarySize(): number {
    return this.dictionary.size;
  }
}

export class TransliterationEngineFactory {
  private static dechifroInstance: DechifroEngine | null = null;
  private static toShavianInstance: ToShavianEngine | null = null;

  static async createEngine(type: EngineType): Promise<TransliterationEngine> {
    switch (type) {
      case 'to-shavian':
        if (!this.toShavianInstance) {
          this.toShavianInstance = new ToShavianEngine();
        }
        return this.toShavianInstance;

      case 'dechifro':
        if (!this.dechifroInstance) {
          // Dynamically import dictionary data
          const { amerDict } = await import('../dictionaries/amer');
          this.dechifroInstance = new DechifroEngine(amerDict);
        }
        return this.dechifroInstance;

      default:
        throw new Error(`Unknown engine type: ${type}`);
    }
  }

  static async getEngineFromSettings(): Promise<TransliterationEngine> {
    let engineType: EngineType = 'dechifro';
    
    if (typeof chrome !== 'undefined' && chrome.storage) {
      try {
        const settings = await chrome.storage.sync.get(['transliterationEngine']);
        engineType = settings.transliterationEngine || 'dechifro';
      } catch (error) {
        console.warn('Failed to get engine settings, using default:', error);
      }
    }
    
    return this.createEngine(engineType);
  }
}
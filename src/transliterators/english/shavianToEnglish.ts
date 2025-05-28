/**
 * Shavian to English transliteration engine
 */
import type { POSTaggedToken } from '../../core/posTagger';
import {
  isPunctuationProcessed,
  extractOriginalWord,
  processPunctuatedWord,
  reconstructWordWithPunctuation,
} from '../../core/punctuationHandler';
import type { TransliterationEngine } from './types';

export class ShavianToEnglishEngine implements TransliterationEngine {
  private reverseDictionary: Map<string, string> = new Map();

  constructor(dictionaryData?: any) {
    if (dictionaryData) {
      this.loadReverseDictionary(dictionaryData);
    }
  }

  private loadReverseDictionary(data: any): void {
    this.reverseDictionary = new Map();

    // Handle new POS-aware dictionary format
    if (data && typeof data.getTransliteration === 'function') {
      // Build reverse dictionary from basic entries
      for (const [key, value] of Object.entries(data.basic)) {
        const cleanShavian = (value as string).replace(/^[.:]+|[.:]+$/g, '');
        if (cleanShavian) {
          this.reverseDictionary.set(cleanShavian, key.toLowerCase());
        }
      }
    } else {
      // Legacy format compatibility
      for (const [key, value] of Object.entries(data as Record<string, string>)) {
        const cleanShavian = value.replace(/^[.:]+|[.:]+$/g, '');
        if (cleanShavian) {
          this.reverseDictionary.set(cleanShavian, key.toLowerCase());
        }
      }
    }

    // Add function words to reverse dictionary
    const functionWords: Record<string, string> = {
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

    for (const [english, shavian] of Object.entries(functionWords)) {
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

  /**
   * Forward transliteration - not implemented in reverse engine
   * This should be delegated to EnglishToShavianEngine
   */
  transliterate(text: string): string {
    console.warn('transliterate should be handled by EnglishToShavianEngine');
    return text;
  }

  transliterateWord(word: string): string {
    console.warn('transliterateWord should be handled by EnglishToShavianEngine');
    return word;
  }

  async transliterateWithPOS(text: string): Promise<string> {
    console.warn('transliterateWithPOS should be handled by EnglishToShavianEngine');
    return text;
  }

  transliterateWithPOSTags(tokens: POSTaggedToken[]): string {
    console.warn('transliterateWithPOSTags should be handled by EnglishToShavianEngine');
    return tokens.map(t => t.text).join('');
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

    // Handle initials (like "g. k. chesterton" -> "G. K. Chesterton")
    if (word.match(/^[a-z]\./)) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }

    // Handle regular proper names
    return this.capitalizeFirstLetter(word);
  }

  addToDictionary(word: string, transliteration: string): void {
    // Add to reverse dictionary
    const cleanShavian = transliteration.replace(/^[.:]+|[.:]+$/g, '');
    if (cleanShavian) {
      this.reverseDictionary.set(cleanShavian, word.toLowerCase());
    }
  }

  getDictionarySize(): number {
    return this.reverseDictionary.size;
  }
}

/**
 * ReadlexiconTransliterator - A standalone transliterator using dictionary-based approach
 * This is for compatibility with existing tests and API usage
 */
import { ReadlexiconEngine } from './core/transliterationEngine';
import { posTagSentence } from './core/posTagger';
import type { POSTaggedToken } from './core/posTagger';

export interface ReadlexiconTransliteratorConfig {
  // Configuration options for the transliterator
  // Note: Only readlex dictionary is supported
}

export class ReadlexiconTransliterator {
  private engine: ReadlexiconEngine;
  private initializationPromise: Promise<void>;

  constructor(_config: ReadlexiconTransliteratorConfig = {}) {
    this.engine = new ReadlexiconEngine();
    this.initializationPromise = this.loadDictionary();
  }

  /**
   * Ensures the transliterator is ready to use
   */
  async ready(): Promise<void> {
    await this.initializationPromise;
  }

  private async loadDictionary(): Promise<void> {
    try {
      // Load the readlex dictionary
      const { readlexDict } = await import('./dictionaries/readlex');
      // Load the dictionary into the engine
      for (const [key, value] of Object.entries(readlexDict)) {
        this.engine.addToDictionary(key, value);
      }
      console.log(`Loaded readlex dictionary with ${this.engine.getDictionarySize()} entries`);
    } catch (error) {
      console.error(`Failed to load readlex dictionary:`, error);
      throw error;
    }
  }

  async transliterate(text: string): Promise<string> {
    await this.ready();
    let result = this.engine.transliterate(text);
    // Replace quotes with Shavian equivalents
    result = this.replaceQuotes(result);
    return result;
  }

  async transliterateWord(word: string): Promise<string> {
    await this.ready();
    let result = this.engine.transliterateWord(word);
    // Replace quotes with Shavian equivalents
    result = this.replaceQuotes(result);
    return result;
  }

  async addToDictionary(word: string, transliteration: string): Promise<void> {
    await this.ready();
    this.engine.addToDictionary(word, transliteration);
  }

  async getDictionarySize(): Promise<number> {
    await this.ready();
    return this.engine.getDictionarySize();
  }

  /**
   * Reverse transliterate text from Shavian to English
   */
  async reverseTransliterate(text: string): Promise<string> {
    await this.ready();
    let result = this.engine.reverseTransliterate(text);
    // Convert Shavian quotes back to standard quotes
    result = this.reverseReplaceQuotes(result);
    return result;
  }

  /**
   * Reverse transliterate a single word from Shavian to English
   */
  async reverseTransliterateWord(word: string): Promise<string> {
    await this.ready();
    let result = this.engine.reverseTransliterateWord(word);
    // Convert Shavian quotes back to standard quotes
    result = this.reverseReplaceQuotes(result);
    return result;
  }

  /**
   * Transliterate a sentence using POS tags (for heteronyms).
   * Uses compromise POS tagger internally.
   */
  async transliterateWithPOS(text: string): Promise<string> {
    await this.ready();
    const tokens: POSTaggedToken[] = await posTagSentence(text);
    // Use the new POS-aware method in the engine
    // @ts-ignore: method exists in our extended engine
    let result = this.engine.transliterateWithPOSTags(tokens);
    // Replace quotes with Shavian equivalents
    result = this.replaceQuotes(result);
    return result;
  }

  /**
   * Replace standard and curly quotes with Shavian equivalents ‹ and ›
   * Handles both single and double quotes, mapping them to Shavian angle brackets.
   * Intelligently distinguishes between apostrophes and actual quotes.
   * Logs input and output for debugging.
   */
  private replaceQuotes(text: string): string {
    // Match straight and curly double quotes
    // Use Unicode escape sequences for left double quote (\u201C) and right double quote (\u201D)
    const doubleQuoteRegex = /["\u201C\u201D]/g;
    let doubleOpen = true;
    let replaced = text.replace(doubleQuoteRegex, () => {
      doubleOpen = !doubleOpen;
      return doubleOpen ? '›' : '‹';
    });
    
    // Match single quotes that are likely to be actual quotes, not apostrophes
    // This regex matches single quotes at the beginning of a word or after spaces/punctuation
    // Use Unicode escape sequences for left single quote (\u2018) and right single quote (\u2019)
    const singleQuoteOpeningRegex = /(?<=^|\s|[.,!?;:])[''\u2018](?=\w)/g;
    // This regex matches single quotes at the end of a word or before spaces/punctuation
    const singleQuoteClosingRegex = /(?<=\w)[''\u2019](?=$|\s|[.,!?;:])/g;
    
    // Replace opening single quotes with ‹
    replaced = replaced.replace(singleQuoteOpeningRegex, '‹');
    // Replace closing single quotes with ›
    replaced = replaced.replace(singleQuoteClosingRegex, '›');
    
    // Debug log
    if (text !== replaced) {
      console.log('[Shavian Quote Replace] Before:', text);
      console.log('[Shavian Quote Replace] After:', replaced);
    }
    return replaced;
  }

  /**
   * Replace Shavian quotes ‹ and › back with standard quotes
   * Currently all Shavian quotes convert back to double quotes for simplicity.
   * Logs input and output for debugging.
   */
  private reverseReplaceQuotes(text: string): string {
    // Match Shavian quotes
    const shavianQuoteRegex = /[‹›]/g;
    let open = true;
    const replaced = text.replace(shavianQuoteRegex, () => {
      open = !open;
      return open ? '"' : '"';
    });
    // Debug log
    if (text !== replaced) {
      console.log('[Shavian Reverse Quote Replace] Before:', text);
      console.log('[Shavian Reverse Quote Replace] After:', replaced);
    }
    return replaced;
  }
}

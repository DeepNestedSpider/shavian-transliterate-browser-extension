/**
 * ReadlexiconTransliterator - A standalone transliterator using dictionary-based approach
 * This is for compatibility with existing tests and API usage
 */
import { ReadlexiconEngine } from './core/transliterationEngine';
import { posTagSentence } from './core/posTagger';
import type { POSTaggedToken } from './core/posTagger';

export interface ReadlexiconTransliteratorConfig {
  dictionary?: 'amer' | 'brit' | 'vs1' | 'readlex';
}

export class ReadlexiconTransliterator {
  private engine: ReadlexiconEngine;
  private initializationPromise: Promise<void>;

  constructor(config: ReadlexiconTransliteratorConfig = {}) {
    this.engine = new ReadlexiconEngine();
    this.initializationPromise = this.loadDictionary('readlex');
  }

  /**
   * Ensures the transliterator is ready to use
   */
  async ready(): Promise<void> {
    await this.initializationPromise;
  }

  private async loadDictionary(dictionary: 'amer' | 'brit' | 'vs1' | 'readlex'): Promise<void> {
    try {
      let dictionaryData: Record<string, string>;
      // Always use readlexDict regardless of input
      const { readlexDict } = await import('./dictionaries/readlex');
      dictionaryData = readlexDict;
      // Load the dictionary into the engine
      for (const [key, value] of Object.entries(dictionaryData)) {
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
   * Transliterate a sentence using POS tags (for heteronyms).
   * Uses compromise POS tagger internally.
   */
  async transliterateWithPOS(text: string): Promise<string> {
    await this.ready();
    const tokens: POSTaggedToken[] = posTagSentence(text);
    // Use the new POS-aware method in the engine
    // @ts-ignore: method exists in our extended engine
    let result = this.engine.transliterateWithPOSTags(tokens);
    // Replace quotes with Shavian equivalents
    result = this.replaceQuotes(result);
    return result;
  }

  /**
   * Replace standard and curly quotes with Shavian equivalents ‹ and ›
   * Logs input and output for debugging.
   */
  private replaceQuotes(text: string): string {
    // Match straight and curly double quotes
    const quoteRegex = /["“”]/g;
    let open = true;
    const replaced = text.replace(quoteRegex, () => (open = !open) ? '‹' : '›');
    // Debug log
    if (text !== replaced) {
      console.log('[Shavian Quote Replace] Before:', text);
      console.log('[Shavian Quote Replace] After:', replaced);
    }
    return replaced;
  }
}

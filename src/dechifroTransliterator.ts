/**
 * DechifroTransliterator - A standalone transliterator using dictionary-based approach
 * This is for compatibility with existing tests and API usage
 */
import { DechifroEngine } from './core/transliterationEngine';
import { posTagSentence } from './core/posTagger';
import type { POSTaggedToken } from './core/posTagger';

export interface DechifroTransliteratorConfig {
  dictionary?: 'amer' | 'brit' | 'vs1';
}

export class DechifroTransliterator {
  private engine: DechifroEngine;
  private initializationPromise: Promise<void>;

  constructor(config: DechifroTransliteratorConfig = {}) {
    this.engine = new DechifroEngine();
    this.initializationPromise = this.loadDictionary(config.dictionary || 'amer');
  }

  /**
   * Ensures the transliterator is ready to use
   */
  async ready(): Promise<void> {
    await this.initializationPromise;
  }

  private async loadDictionary(dictionary: 'amer' | 'brit' | 'vs1'): Promise<void> {
    try {
      let dictionaryData: Record<string, string>;
      
      switch (dictionary) {
        case 'amer':
          const { amerDict } = await import('./dictionaries/amer');
          dictionaryData = amerDict;
          break;
        case 'brit':
          const { britDict } = await import('./dictionaries/brit');
          dictionaryData = britDict;
          break;
        case 'vs1':
          const { vs1Dict } = await import('./dictionaries/vs1');
          dictionaryData = vs1Dict;
          break;
        default:
          throw new Error(`Unknown dictionary: ${dictionary}`);
      }

      // Load the dictionary into the engine
      for (const [key, value] of Object.entries(dictionaryData)) {
        this.engine.addToDictionary(key, value);
      }
      
      console.log(`Loaded ${dictionary} dictionary with ${this.engine.getDictionarySize()} entries`);
    } catch (error) {
      console.error(`Failed to load ${dictionary} dictionary:`, error);
      throw error;
    }
  }

  async transliterate(text: string): Promise<string> {
    await this.ready();
    return this.engine.transliterate(text);
  }

  async transliterateWord(word: string): Promise<string> {
    await this.ready();
    return this.engine.transliterateWord(word);
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
    return this.engine.transliterateWithPOSTags(tokens);
  }
}

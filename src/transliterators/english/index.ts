/**
 * Combined English-Shavian transliteration engine
 * Coordinates between EnglishToShavian and ShavianToEnglish engines
 */
import type { POSTaggedToken } from '../../core/posTagger';
import type { TransliterationEngine, EngineType } from './types';
import { EnglishToShavianEngine } from './englishToShavian';
import { ShavianToEnglishEngine } from './shavianToEnglish';

export class CombinedTransliterationEngine implements TransliterationEngine {
  private englishToShavian: EnglishToShavianEngine;
  private shavianToEnglish: ShavianToEnglishEngine;

  constructor(dictionaryData?: any) {
    this.englishToShavian = new EnglishToShavianEngine(dictionaryData);
    this.shavianToEnglish = new ShavianToEnglishEngine(dictionaryData);
  }

  transliterate(text: string): string {
    return this.englishToShavian.transliterate(text);
  }

  transliterateWord(word: string): string {
    return this.englishToShavian.transliterateWord(word);
  }

  async transliterateWithPOS(text: string): Promise<string> {
    return this.englishToShavian.transliterateWithPOS(text);
  }

  transliterateWithPOSTags(tokens: POSTaggedToken[]): string {
    return this.englishToShavian.transliterateWithPOSTags(tokens);
  }

  reverseTransliterate(text: string): string {
    return this.shavianToEnglish.reverseTransliterate(text);
  }

  reverseTransliterateWord(word: string): string {
    return this.shavianToEnglish.reverseTransliterateWord(word);
  }

  addToDictionary(word: string, transliteration: string): void {
    this.englishToShavian.addToDictionary(word, transliteration);
    this.shavianToEnglish.addToDictionary(word, transliteration);
  }

  getDictionarySize(): number {
    return this.englishToShavian.getDictionarySize();
  }

  // Allow access to individual engines if needed
  getEnglishToShavianEngine(): EnglishToShavianEngine {
    return this.englishToShavian;
  }

  getShavianToEnglishEngine(): ShavianToEnglishEngine {
    return this.shavianToEnglish;
  }
}

/**
 * Factory for creating transliteration engines
 */
export class TransliterationEngineFactory {
  private static readlexiconInstance: CombinedTransliterationEngine | null = null;
  private static verbAwareReadlexiconInstance: TransliterationEngine | null = null;
  private static pluralAwareReadlexiconInstance: TransliterationEngine | null = null;

  static async createEngine(type: EngineType): Promise<TransliterationEngine> {
    switch (type) {
      case 'readlexicon':
        if (!this.readlexiconInstance) {
          // Dynamically import dictionary data
          const { readlexDict } = await import('../../dictionaries/readlex');
          this.readlexiconInstance = new CombinedTransliterationEngine(readlexDict);
        }
        return this.readlexiconInstance;

      case 'verb-aware-readlexicon':
        if (!this.verbAwareReadlexiconInstance) {
          // Dynamically import dictionary data and verb-aware engine
          const { readlexDict } = await import('../../dictionaries/readlex');
          const { VerbAwareReadlexiconEngine } = await import('../../core/verbAwareEngine');
          this.verbAwareReadlexiconInstance = new VerbAwareReadlexiconEngine(readlexDict);
        }
        return this.verbAwareReadlexiconInstance;

      case 'plural-aware-readlexicon':
        if (!this.pluralAwareReadlexiconInstance) {
          // Dynamically import dictionary data and plural-aware engine
          const { readlexDict } = await import('../../dictionaries/readlex');
          const { PluralAwareReadlexiconEngine } = await import('../../core/pluralAwareEngine');
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

// Export individual engines for direct use
export { EnglishToShavianEngine } from './englishToShavian';
export { ShavianToEnglishEngine } from './shavianToEnglish';
export type { TransliterationEngine, EngineType } from './types';

/**
 * Core transliteration engine interface and factory
 */
import toShavian from 'to-shavian';

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
    // Preserve original case pattern
    const lowercaseWord = word.toLowerCase();
    const cleanWord = lowercaseWord.replace(/[^\w]/g, '');
    
    let result = this.dictionary.get(cleanWord);
    
    if (!result) {
      // Fallback to to-shavian if not in dictionary
      result = toShavian(word).replace(/ /g, '');
    }
    
    return result || word;
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
    let engineType: EngineType = 'to-shavian';
    
    if (typeof chrome !== 'undefined' && chrome.storage) {
      try {
        const settings = await chrome.storage.sync.get(['transliterationEngine']);
        engineType = settings.transliterationEngine || 'to-shavian';
      } catch (error) {
        console.warn('Failed to get engine settings, using default:', error);
      }
    }
    
    return this.createEngine(engineType);
  }
}

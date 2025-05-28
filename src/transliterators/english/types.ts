/**
 * Shared types and interfaces for English transliteration
 */
import type { POSTaggedToken } from '../../core/posTagger';

export interface TransliterationEngine {
  transliterate(text: string): string;
  transliterateWord(word: string): string;
  transliterateWithPOS?(text: string): Promise<string>;
  reverseTransliterate(text: string): string;
  reverseTransliterateWord(word: string): string;
}

export type EngineType = 'readlexicon' | 'verb-aware-readlexicon' | 'plural-aware-readlexicon';

export interface POSTaggedTokens {
  tokens: POSTaggedToken[];
}

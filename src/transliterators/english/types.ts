/**
 * Shared types and interfaces for English transliteration
 */
import type { POSTaggedToken } from '../../core/posTagger';

export interface TransliterationResult {
  transliterated: string;
  originalWords: string[];
  transliteratedWords: string[];
  confidence: number;
}

export interface TransliterationEngine {
  transliterate(text: string): string;
  transliterateWord(word: string): string;
  transliterateWithPOS?(text: string): Promise<string>;
  reverseTransliterate(text: string): string;
  reverseTransliterateWord(word: string): string;
  // Optional methods for advanced engines
  transliterateText?(text: string): TransliterationResult;
  canTransliterate?(text: string): boolean;
  getInfo?(): object;
}

export type EngineType = 'readlexicon' | 'verb-aware-readlexicon' | 'plural-aware-readlexicon' | 'english-to-ipa';

export interface POSTaggedTokens {
  tokens: POSTaggedToken[];
}

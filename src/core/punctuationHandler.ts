/**
 * Punctuation handler for words with attached non-alphabetic characters
 * This module handles words that have punctuation, apostrophes, dots, colons, etc. attached
 */

export interface PunctuationProcessingResult {
  hasNonAlphabetic: boolean;
  processedWord: string;
}

/**
 * Regex pattern to detect non-alphabetic characters except hyphens within words
 * This includes punctuation like semicolons, dots, colons, apostrophes, etc.
 * Excludes hyphens (for compound words)
 */
const NON_ALPHABETIC_PATTERN = /[^a-zA-Z-]/;

/**
 * Checks if a word contains non-alphabetic characters (excluding hyphens)
 * @param word - The word to check
 * @returns true if the word contains non-alphabetic characters
 */
export function hasNonAlphabeticCharacters(word: string): boolean {
  // Exclude pure whitespace and empty strings
  if (!word || word.trim() === '') {
    return false;
  }
  
  // Don't process pure punctuation (no letters at all)
  if (!/[a-zA-Z]/.test(word)) {
    return false;
  }
  
  // Check for non-alphabetic characters excluding hyphens
  return NON_ALPHABETIC_PATTERN.test(word);
}

/**
 * Processes a word with punctuation by replacing it with punctuation{word} format
 * @param word - The word to process
 * @returns The processed result
 */
export function processPunctuatedWord(word: string): PunctuationProcessingResult {
  const hasNonAlphabetic = hasNonAlphabeticCharacters(word);
  
  if (!hasNonAlphabetic) {
    return {
      hasNonAlphabetic: false,
      processedWord: word
    };
  }
  
  // Replace the word with punctuation{word} format
  const processedWord = `punctuation{${word}}`;
  
  return {
    hasNonAlphabetic: true,
    processedWord
  };
}

/**
 * Main function to handle punctuation processing for transliteration
 * This function should be called whenever a word needs to be checked for punctuation
 * @param word - The word to process
 * @returns The processed word (either original or punctuation{word} format)
 */
export function handleWordPunctuation(word: string): string {
  const result = processPunctuatedWord(word);
  return result.processedWord;
}

/**
 * Utility function to extract the original word from punctuation{word} format
 * @param processedWord - The processed word in punctuation{word} format
 * @returns The original word if it was in the processed format, otherwise returns the input
 */
export function extractOriginalWord(processedWord: string): string {
  const punctuationPattern = /^punctuation\{(.*)\}$/;
  const match = processedWord.match(punctuationPattern);
  
  if (match) {
    return match[1] || ''; // Handle undefined by returning empty string
  }
  
  return processedWord;
}

/**
 * Checks if a word is in the punctuation{word} format
 * @param word - The word to check
 * @returns true if the word is in punctuation{word} format
 */
export function isPunctuationProcessed(word: string): boolean {
  return /^punctuation\{.*\}$/.test(word);
}

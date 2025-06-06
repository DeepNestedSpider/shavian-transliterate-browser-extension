/**
 * Punctuation handler for words with attached non-alphabetic characters
 * This module handles words that have punctuation, apostrophes, dots, colons, etc. attached
 * It separates the punctuation from the word and returns both parts for proper processing
 */

export interface PunctuationProcessingResult {
  hasNonAlphabetic: boolean;
  processedWord: string;
  cleanWord?: string;
  leadingPunctuation?: string;
  trailingPunctuation?: string;
}

/**
 * Regex patterns for punctuation separation
 */
const LEADING_PUNCTUATION_PATTERN = /^([^\p{L}\s-]+)/u;
const TRAILING_PUNCTUATION_PATTERN = /([^\p{L}\s-]+.*)$/u; // Modified to capture everything from first non-letter char
const APOSTROPHE_CONTRACTIONS = /^(.*)'([tsdm]|re|ve|ll)$/i; // don't, it's, we're, I've, they'll
const POSSESSIVE_PATTERN = /^(.+)'s$/i; // possessive forms like "Shaw's", "John's"
// List of common contraction words that end in 's to exclude from possessive handling
const CONTRACTION_WORDS_ENDING_S = ['it', 'that', 'what', 'let', 'here', 'there', 'where'];
// Quote patterns for special handling
// const QUOTE_PATTERNS = /["""''']/g;

/**
 * Separates punctuation from a word
 * @param word - The word to separate
 * @returns Object with clean word and separated punctuation
 */
export function separatePunctuation(word: string): {
  cleanWord: string;
  leadingPunctuation: string;
  trailingPunctuation: string;
} {
  let cleanWord = word;
  let leadingPunctuation = '';
  let trailingPunctuation = '';

  // Handle leading punctuation (like quotes, parentheses)
  const leadingMatch = cleanWord.match(LEADING_PUNCTUATION_PATTERN);
  if (leadingMatch) {
    leadingPunctuation = leadingMatch[1] ?? '';
    cleanWord = cleanWord.slice(leadingPunctuation.length);
  }

  // Handle trailing punctuation (like periods, commas, quotes)
  const trailingMatch = cleanWord.match(TRAILING_PUNCTUATION_PATTERN);
  if (trailingMatch) {
    trailingPunctuation = trailingMatch[1] ?? '';
    cleanWord = cleanWord.slice(0, -trailingPunctuation.length);
  }

  return {
    cleanWord,
    leadingPunctuation,
    trailingPunctuation,
  };
}

/**
 * Handles contractions by separating the contraction part
 * @param word - The word to check for contractions
 * @returns Object with the base word and contraction part
 */
export function handleContractions(word: string): {
  baseWord: string;
  contractionPart: string;
} {
  const contractionMatch = word.match(APOSTROPHE_CONTRACTIONS);
  if (contractionMatch) {
    return {
      baseWord: contractionMatch[1] ?? '',
      contractionPart: `'${contractionMatch[2]}`,
    };
  }

  return {
    baseWord: word,
    contractionPart: '',
  };
}

/**
 * Handles possessive forms by converting "'s" to Shavian "𐑟"
 * Also handles possessives inside quotes like "Shaw's"
 * @param word - The word to check for possessive form
 * @returns Object with the base word and possessive part
 */
export function handlePossessives(word: string): {
  baseWord: string;
  possessivePart: string;
} {
  // First try direct possessive match
  const possessiveMatch = word.match(POSSESSIVE_PATTERN);
  if (possessiveMatch) {
    const baseWord = possessiveMatch[1] ?? '';

    // Check if this is actually a contraction (like "it's", "that's", "let's")
    if (CONTRACTION_WORDS_ENDING_S.includes(baseWord.toLowerCase())) {
      return {
        baseWord: word,
        possessivePart: '',
      };
    }

    return {
      baseWord,
      possessivePart: '𐑟', // Convert "'s" to Shavian /z/ sound
    };
  }

  // Handle possessives inside quotes like "Shaw's"
  const quotedPossessiveMatch = word.match(/^(["']?)(.+)'s(["']?)$/i);
  if (quotedPossessiveMatch) {
    const leadingQuote = quotedPossessiveMatch[1] ?? '';
    const baseWord = quotedPossessiveMatch[2] ?? '';
    const trailingQuote = quotedPossessiveMatch[3] ?? '';

    // Check if this is actually a contraction
    if (CONTRACTION_WORDS_ENDING_S.includes(baseWord.toLowerCase())) {
      return {
        baseWord: word,
        possessivePart: '',
      };
    }

    return {
      baseWord: leadingQuote + baseWord + trailingQuote,
      possessivePart: '𐑟',
    };
  }

  return {
    baseWord: word,
    possessivePart: '',
  };
}

/**
 * Checks if a word contains non-alphabetic characters (excluding hyphens and ellipses)
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

  // Don't process words that only contain ellipses - let ellipsis handler deal with them
  if (word.includes('…')) {
    return false;
  }

  // Don't process words that contain pipe characters - let pipe handler deal with them
  if (word.includes('|')) {
    return false;
  }

  // Check for non-alphabetic characters excluding hyphens
  return /[^\p{L}-]/u.test(word);
}

/**
 * Processes a word with punctuation by separating the punctuation from the clean word
 * @param word - The word to process
 * @returns The processed result with separated components
 */
export function processPunctuatedWord(word: string): PunctuationProcessingResult {
  const hasNonAlphabetic = hasNonAlphabeticCharacters(word);

  if (!hasNonAlphabetic) {
    return {
      hasNonAlphabetic: false,
      processedWord: word,
      cleanWord: word,
      leadingPunctuation: '',
      trailingPunctuation: '',
    };
  }

  // Check for possessives FIRST, before any punctuation separation
  const { baseWord: possessiveBase, possessivePart } = handlePossessives(word);

  if (possessivePart) {
    // It's a possessive form, now separate any additional punctuation from the base word
    const {
      cleanWord: finalCleanWord,
      leadingPunctuation,
      trailingPunctuation,
    } = separatePunctuation(possessiveBase);

    return {
      hasNonAlphabetic: true,
      processedWord: word,
      cleanWord: finalCleanWord,
      leadingPunctuation,
      trailingPunctuation: possessivePart + trailingPunctuation,
    };
  }

  // If not possessive, separate punctuation normally
  const {
    cleanWord: wordWithoutExternalPunctuation,
    leadingPunctuation,
    trailingPunctuation,
  } = separatePunctuation(word);

  // Handle contractions if it's not a possessive
  const { baseWord, contractionPart } = handleContractions(wordWithoutExternalPunctuation);

  // If it's a contraction, process the base word and keep the contraction
  const finalCleanWord = contractionPart ? baseWord : wordWithoutExternalPunctuation;
  const finalTrailingPunctuation = contractionPart
    ? contractionPart + trailingPunctuation
    : trailingPunctuation;

  return {
    hasNonAlphabetic: true,
    processedWord: word, // Keep original for now, will be updated by transliteration engine
    cleanWord: finalCleanWord,
    leadingPunctuation,
    trailingPunctuation: finalTrailingPunctuation,
  };
}

/**
 * Reconstructs a word with its punctuation after transliteration
 * @param transliteratedWord - The transliterated clean word
 * @param leadingPunctuation - Punctuation that goes before the word
 * @param trailingPunctuation - Punctuation that goes after the word
 * @returns The complete word with punctuation
 */
export function reconstructWordWithPunctuation(
  transliteratedWord: string,
  leadingPunctuation: string,
  trailingPunctuation: string
): string {
  return leadingPunctuation + transliteratedWord + trailingPunctuation;
}

/**
 * Main function to handle punctuation processing for transliteration
 * This function should be called whenever a word needs to be checked for punctuation
 * @param word - The word to process
 * @returns The processed word (either original or punctuation{word} format for compatibility)
 */
export function handleWordPunctuation(word: string): string {
  const result = processPunctuatedWord(word);

  // For backward compatibility, still return punctuation{word} format for now
  // This will be updated by the transliteration engine to use the new logic
  if (result.hasNonAlphabetic) {
    return `punctuation{${word}}`;
  }

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

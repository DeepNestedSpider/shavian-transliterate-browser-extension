/**
 * IPA (International Phonetic Alphabet) Dictionary for English (US)
 *
 * This dictionary maps English words to their IPA pronunciations.
 * Used for phonetic-based transliteration to Shavian script.
 */

import ipaData from './ipa-en_US.json';

export interface IPADictionaryEntry {
  [word: string]: string;
}

export interface IPADictionary {
  en_US: IPADictionaryEntry[];
}

// Extract the dictionary data
const ipaDictionary: IPADictionaryEntry = (ipaData as IPADictionary).en_US[0] || {};

/**
 * Get IPA pronunciation for a given English word
 * @param word - The English word to look up
 * @param format - How to format multiple pronunciations: 'all' (default), 'primary', or 'formatted'
 * @returns IPA pronunciation string or null if not found
 */
export function getIPAPronunciation(
  word: string,
  format: 'all' | 'primary' | 'formatted' = 'formatted'
): string | null {
  const normalizedWord = word.toLowerCase().trim();
  const pronunciation = ipaDictionary[normalizedWord];

  if (!pronunciation) {
    return null;
  }

  // Handle different formatting options
  switch (format) {
    case 'primary':
      // Return only the first pronunciation
      const firstPronunciation = pronunciation.split(', ')[0];
      return firstPronunciation || null;

    case 'formatted':
      // Format multiple pronunciations clearly
      const pronunciations = pronunciation.split(', ');
      if (pronunciations.length === 1) {
        return pronunciation;
      }
      // Format as: word[pronunciation1|pronunciation2|...]
      return `${normalizedWord}[${pronunciations.join('|')}]`;

    case 'all':
    default:
      // Return the original string with all pronunciations
      return pronunciation;
  }
}

/**
 * Check if a word exists in the IPA dictionary
 * @param word - The word to check
 * @returns True if the word exists in the dictionary
 */
export function hasIPAPronunciation(word: string): boolean {
  const normalizedWord = word.toLowerCase().trim();
  return normalizedWord in ipaDictionary;
}

/**
 * Get all available words in the IPA dictionary
 * @returns Array of all words in the dictionary
 */
export function getAvailableWords(): string[] {
  return Object.keys(ipaDictionary);
}

/**
 * Get the size of the IPA dictionary
 * @returns Number of entries in the dictionary
 */
export function getDictionarySize(): number {
  return Object.keys(ipaDictionary).length;
}

/**
 * Search for words that start with a given prefix
 * @param prefix - The prefix to search for
 * @returns Array of words that start with the prefix
 */
export function searchByPrefix(prefix: string): string[] {
  const normalizedPrefix = prefix.toLowerCase().trim();
  return Object.keys(ipaDictionary).filter(word => word.startsWith(normalizedPrefix));
}

export { ipaDictionary };
export default ipaDictionary;

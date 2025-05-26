/**
 * Type declarations for the to-shavian library
 */

declare module 'to-shavian' {
  /**
   * Transliterates English text to Shavian script
   * @param text The English text to transliterate
   * @returns The transliterated Shavian text
   */
  function toShavian(text: string): string;
  
  export default toShavian;
}

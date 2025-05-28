/**
 * Integration test for possessive handling with transliteration
 */
import { describe, test, expect } from 'bun:test';
import { ReadlexiconTransliterator } from '../src/readlexiconTransliterator';

describe('Possessive Integration Test', () => {
  test('Shaw\'s should transliterate to ·𐑖𐑷𐑟', async () => {
    const transliterator = new ReadlexiconTransliterator();
    const result = await transliterator.transliterate("Shaw's");
    
    console.log('Shaw\'s transliterates to:', result);
    // Should be ·𐑖𐑷𐑟 (Shaw + possessive suffix)
    expect(result).toMatch(/𐑖𐑷𐑟/);
  });

  test('John\'s should transliterate with possessive suffix', async () => {
    const transliterator = new ReadlexiconTransliterator();
    const result = await transliterator.transliterate("John's");
    
    console.log('John\'s transliterates to:', result);
    // Should end with 𐑟 (possessive suffix)
    expect(result).toMatch(/𐑟$/);
  });

  test('Children\'s should transliterate with possessive suffix', async () => {
    const transliterator = new ReadlexiconTransliterator();
    const result = await transliterator.transliterate("children's");
    
    console.log('children\'s transliterates to:', result);
    // Should end with 𐑟 (possessive suffix)
    expect(result).toMatch(/𐑟$/);
  });

  test('it\'s should still work as contraction (not possessive)', async () => {
    const transliterator = new ReadlexiconTransliterator();
    const result = await transliterator.transliterate("it's");
    
    console.log('it\'s transliterates to:', result);
    // Should still be treated as a contraction, not possessive
    expect(result).not.toMatch(/𐑟$/);
  });
});

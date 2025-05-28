import { ReadlexiconEngine } from './src/core/transliterationEngine';

describe("Debug remaining issues", () => {
  let engine: ReadlexiconEngine;
  
  beforeEach(async () => {
    // Create and initialize engine
    const { readlexDict } = await import('./src/dictionaries/readlex');
    engine = new ReadlexiconEngine(readlexDict);
  });

  test("Doctor Who issue", () => {
    const input = "Doctor Who";
    const result = engine.transliterate(input);
    console.log(`"${input}" → "${result}"`);
    console.log(`Expected: ‹·𐑛𐑪𐑒𐑑𐑼 𐑣𐑵›`);
    
    // Test individual words
    console.log(`"Doctor" alone → "${engine.transliterateWord("Doctor")}"`);
    console.log(`"Who" alone → "${engine.transliterateWord("Who")}"`);
  });

  test("G. K. Chesterton issue", () => {
    const input = "G. K. Chesterton";
    const result = engine.transliterate(input);
    console.log(`"${input}" → "${result}"`);
    console.log(`Expected: ·𐑜. 𐑒. 𐑗𐑧𐑕𐑑𐑼𐑑𐑩𐑯`);
  });

  test("Bernard Shaw issue", () => {
    const input = "Bernard Shaw";
    const result = engine.transliterate(input);
    console.log(`"${input}" → "${result}"`);
    console.log(`Expected: ·𐑚𐑻𐑯𐑼𐑛 𐑖𐑷`);
    
    // Test individual words
    console.log(`"Bernard" alone → "${engine.transliterateWord("Bernard")}"`);
    console.log(`"Shaw" alone → "${engine.transliterateWord("Shaw")}"`);
  });

  test("Missing word translations", () => {
    const words = ["ended", "adults", "came"];
    words.forEach(word => {
      const result = engine.transliterateWord(word);
      console.log(`"${word}" → "${result}"`);
    });
  });
});
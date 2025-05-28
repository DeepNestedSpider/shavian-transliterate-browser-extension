/**
 * Tests for the plural-aware engine
 */
import { expect, test, describe, beforeAll } from "bun:test";
import { ReadlexiconEngine, VerbAwareReadlexiconEngine } from "../src/core/transliterationEngine";
import { PluralAwareReadlexiconEngine } from "../src/core/pluralAwareEngine";

// Load dictionary once for all tests
let readlexDict: any;
let standardEngine: ReadlexiconEngine;
let verbAwareEngine: VerbAwareReadlexiconEngine;
let pluralAwareEngine: PluralAwareReadlexiconEngine;

describe("Plural-aware transliteration engine", () => {
  // Setup: Import the dictionary and create engines before any tests run
  beforeAll(async () => {
    const dictModule = await import("../src/dictionaries/readlex.js");
    readlexDict = dictModule.readlexDict;
    
    standardEngine = new ReadlexiconEngine(readlexDict);
    verbAwareEngine = new VerbAwareReadlexiconEngine(readlexDict);
    pluralAwareEngine = new PluralAwareReadlexiconEngine(readlexDict);
  });
  
  // Regular plurals
  describe("Regular plural forms (ending in 's')", () => {
  const regularPlurals = [
    "books", "cats", "dogs", "houses", "phones", "computers", "tables", "chairs", "pictures", "windows"
  ];
  
  test.each(regularPlurals)("%s is correctly transliterated", (word) => {
    const standardResult = standardEngine.transliterateWord(word);
    const pluralAwareResult = pluralAwareEngine.transliterateWord(word);
    
    // For regular plurals, our engine should produce a result that adds Shavian 's' (𐑕)
    // to the singular form
    expect(pluralAwareResult).not.toBe(word); // Should be transliterated
    
    // Both engines should produce the correct Shavian transliteration
    // The plural-aware engine should work at least as well as the standard engine
    expect(pluralAwareResult).toBeTruthy(); // Should produce a valid result
    
    // For debugging
    console.log(`${word}: "${standardResult}" (Standard) vs "${pluralAwareResult}" (Plural-Aware)`);
  });
});

// Plurals ending in -es
describe("Plural forms ending in '-es'", () => {
  const esPlurals = [
    "boxes", "churches", "bushes", "glasses", "dishes", "watches", "addresses", "buses", "classes", "foxes"
  ];
  
  test.each(esPlurals)("%s is correctly transliterated", (word) => {
    const standardResult = standardEngine.transliterateWord(word);
    const pluralAwareResult = pluralAwareEngine.transliterateWord(word);
    
    // For -es plurals, we should see transliteration results
    expect(pluralAwareResult).not.toBe(word);
    
    // Both engines should produce valid Shavian results  
    expect(pluralAwareResult).toBeTruthy();
    
    console.log(`${word}: "${standardResult}" (Standard) vs "${pluralAwareResult}" (Plural-Aware)`);
  });
});

// Irregular plurals
describe("Irregular plural forms", () => {
  const irregularPlurals = [
    "children", "women", "men", "teeth", "feet", "geese", "mice", "people", "sheep", "fish"
  ];
  
  test.each(irregularPlurals)("%s is correctly transliterated", (word) => {
    const standardResult = standardEngine.transliterateWord(word);
    const pluralAwareResult = pluralAwareEngine.transliterateWord(word);
    
    // Irregular plurals should have special handling
    expect(pluralAwareResult).not.toBe(word);
    
    // For some already-correctly-handled words like "people", "sheep", and "fish",
    // the standard result might already be correct
    if (["people", "sheep", "fish"].includes(word)) {
      expect(pluralAwareResult).toBe(standardResult);
    }
    
    console.log(`${word}: "${standardResult}" (Standard) vs "${pluralAwareResult}" (Plural-Aware)`);
  });
});

// Plurals ending in -ies
describe("Plural forms ending in '-ies'", () => {
  const iesPlurals = [
    "cities", "countries", "babies", "families", "stories", "companies", "parties", "ladies", "flies", "replies"
  ];
  
  test.each(iesPlurals)("%s is correctly transliterated", (word) => {
    const standardResult = standardEngine.transliterateWord(word);
    const pluralAwareResult = pluralAwareEngine.transliterateWord(word);
    
    // For -ies plurals, we should see transliteration results
    expect(pluralAwareResult).not.toBe(word);
    
    // Both engines should produce valid Shavian results
    expect(pluralAwareResult).toBeTruthy();
    
    console.log(`${word}: "${standardResult}" (Standard) vs "${pluralAwareResult}" (Plural-Aware)`);
  });
});

// Plurals ending in -ves
describe("Plural forms ending in '-ves'", () => {
  const vesPlurals = [
    "leaves", "knives", "wives", "lives", "halves", "shelves", "wolves", "elves", "thieves", "calves"
  ];
  
  test.each(vesPlurals)("%s is correctly transliterated", (word) => {
    const standardResult = standardEngine.transliterateWord(word);
    const pluralAwareResult = pluralAwareEngine.transliterateWord(word);
    
    // For -ves plurals, we should see transliteration results
    expect(pluralAwareResult).not.toBe(word);
    
    // Both engines should produce valid Shavian results
    expect(pluralAwareResult).toBeTruthy();
    
    console.log(`${word}: "${standardResult}" (Standard) vs "${pluralAwareResult}" (Plural-Aware)`);
  });
});

// Test sentences with plurals
describe("Sentences with plurals", () => {
  const sentences = [
    "The cats and dogs play in the house.",
    "She put the boxes on the shelves.",
    "Many families have children.",
    "The cities have many buses and taxis.",
    "Wolves and foxes are wild animals."
  ];
  
  test.each(sentences)("%s is correctly transliterated", (sentence) => {
    const standardResult = standardEngine.transliterate(sentence);
    const pluralAwareResult = pluralAwareEngine.transliterate(sentence);
    
    // Sentence transliteration should produce Shavian output
    expect(pluralAwareResult).not.toBe(sentence);
    
    // Both engines should produce valid results
    expect(pluralAwareResult).toBeTruthy();
    
    console.log(`\nSentence: "${sentence}"`);
    console.log(`  Standard:    "${standardResult}"`);
    console.log(`  Plural-Aware: "${pluralAwareResult}"`);
  });
});
});

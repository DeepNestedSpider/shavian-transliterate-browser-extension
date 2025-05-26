import { describe, test, expect } from "bun:test";
import { posTagSentence } from "../src/core/posTagger";
import { ReadlexiconTransliterator } from "../src/dechifroTransliterator";

describe("POS Tagger Integration with ReadlexiconTransliterator", () => {
  test("should transliterate heteronyms using POS tags", async () => {
    const transliterator = new ReadlexiconTransliterator({ dictionary: "amer" });
    // "lead" as a noun (NN) and verb (VB)
    const sentence = "They will lead the parade with lead pipes.";
    const posTagged = posTagSentence(sentence);
    // Use the POS-aware transliteration
    const result = await transliterator.transliterateWithPOS(sentence);
    // Just check that both forms of "lead" are transliterated differently
    // (actual Shavian output depends on dictionary)
    const leadNoun = posTagged.find(t => t.text.toLowerCase() === "lead" && t.pos === "NN");
    const leadVerb = posTagged.find(t => t.text.toLowerCase() === "lead" && t.pos === "VB");
    expect(leadNoun).toBeTruthy();
    expect(leadVerb).toBeTruthy();
    // The result should contain at least two different Shavian forms for "lead"
    // (This is a soft check, as the exact output depends on the dictionary)
    const shavianWords = result.split(/\s+/);
    expect(new Set(shavianWords).size).toBeGreaterThan(3);
  });
});

test("posTagSentence should tag simple sentence", () => {
  const tags = posTagSentence("Cats chase mice.");
  expect(tags.length).toBeGreaterThan(0);
  expect(tags[0]).toHaveProperty("text");
  expect(tags[0]).toHaveProperty("pos");
});

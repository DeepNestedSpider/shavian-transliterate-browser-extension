import { describe, test, expect } from "bun:test";

// Test just the imports first
test("can import bun:test", () => {
  expect(true).toBe(true);
});

// Try importing our modules one by one
import { handleWordPunctuation } from "../src/core/punctuationHandler";

test("can import punctuationHandler", () => {
  const result = handleWordPunctuation("hello");
  expect(result).toBe("hello");
});

// Try importing the transliteration engine
import { ReadlexiconEngine } from "../src/core/transliterationEngine";

test("can import ReadlexiconEngine", () => {
  const testDict = { "hello": "𐑣𐑧𐑤𐑴" };
  const engine = new ReadlexiconEngine(testDict);
  expect(engine.transliterateWord("hello")).toBe("𐑣𐑧𐑤𐑴");
});

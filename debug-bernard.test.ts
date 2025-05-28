import { test, expect } from "bun:test";
import { ReadlexiconEngine } from "./src/core/transliterationEngine";

test("Debug Bernard Shaw transliteration", () => {
  const engine = new ReadlexiconEngine();
  
  // Test each word individually
  console.log("=== Individual words ===");
  const bernardResult = engine.transliterate("Bernard");
  const shawResult = engine.transliterate("Shaw");
  console.log("'Bernard':", bernardResult);
  console.log("'Shaw':", shawResult);
  
  // Test the full phrase
  console.log("\n=== Full phrase ===");
  const fullResult = engine.transliterate("Bernard Shaw");
  console.log("'Bernard Shaw':", fullResult);
  
  // Test what should happen
  console.log("\n=== Expected: ·𐑚𐑻𐑯𐑼𐑛 𐑖𐑷 ===");
  
  expect(true).toBe(true); // Just to make test run
});

import { test, expect } from "bun:test";
import { ReadlexiconEngine } from "./src/core/transliterationEngine";

test("Debug From Shaw with logging", () => {
  const engine = new ReadlexiconEngine();
  
  console.log("=== Testing 'From Shaw' with debug logging ===");
  const result = engine.transliterate("From Shaw");
  console.log("Result:", result);
  
  expect(true).toBe(true);
});

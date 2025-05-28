import { test, expect } from "bun:test";
import { ReadlexiconEngine } from "./src/core/transliterationEngine";

test("Debug Shaw proper name marker", () => {
  const engine = new ReadlexiconEngine();
  
  // Test the "From Shaw" case specifically
  const result = engine.transliterate("From Shaw");
  console.log("Full result:", result);
  console.log("Individual word results:");
  
  // Test each word individually
  const fromResult = engine.transliterate("From");
  const shawResult = engine.transliterate("Shaw");
  
  console.log("'From':", fromResult);
  console.log("'Shaw':", shawResult);
  
  // Debug Shaw specifically - check if it's identified as proper name
  console.log("\nDebugging Shaw word processing:");
  
  // We need to check what happens in the internal methods
  // Let's see if Shaw is in any dictionaries
});

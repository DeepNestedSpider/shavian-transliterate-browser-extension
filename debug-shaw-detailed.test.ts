import { describe, expect, test } from "bun:test";
import { ReadlexiconEngine } from "./src/core/transliterationEngine";

describe("Debug Shaw proper name marker - detailed", () => {
  test("Debug Shaw word processing with detailed logging", () => {
    const engine = new ReadlexiconEngine();

    console.log("=== Testing individual words ===");
    const shawAlone = engine.transliterate("Shaw");
    console.log(`'Shaw' alone: ${shawAlone}`);
    
    const fromAlone = engine.transliterate("From");
    console.log(`'From' alone: ${fromAlone}`);

    console.log("\n=== Testing sentence context ===");
    const fullResult = engine.transliterate("From Shaw");
    console.log(`'From Shaw': ${fullResult}`);

    // Test with different contexts
    console.log("\n=== Testing different contexts ===");
    const contexts = [
      "Shaw",
      "From Shaw", 
      "By Shaw",
      "Shaw wrote",
      "Bernard Shaw",
      "Shaw and others"
    ];

    for (const context of contexts) {
      const result = engine.transliterate(context);
      console.log(`'${context}': ${result}`);
    }
    
    // Add an assertion so the test actually passes/fails
    expect(shawAlone).toContain("𐑖𐑷");
  });
});

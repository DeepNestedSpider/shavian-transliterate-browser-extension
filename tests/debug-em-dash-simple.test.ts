import { test, expect } from "bun:test";
import { ReadlexiconEngine } from "../src/core/transliterationEngine";

test("debug em-dash transliteration behavior", () => {
  const engine = new ReadlexiconEngine();
  
  console.log('=== EM-DASH DEBUG TEST ===');

  const testCases = [
    'alphabet reform—James Pitman MP',
    'Shaw Society—urged',
    'James',
    'urged',
  ];

  for (const testCase of testCases) {
    console.log(`\nInput: "${testCase}"`);
    const result = engine.transliterate(testCase);
    console.log(`Output: "${result}"`);
  }

  // Test individual cases
  expect(true).toBe(true); // Just to make the test pass
});

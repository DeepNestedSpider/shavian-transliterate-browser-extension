/**
 * Basic tests to ensure core functionality works
 */

import { describe, test, expect } from "bun:test";

describe('Basic Environment Tests', () => {
  test('should have Bun test framework available', () => {
    expect(describe).toBeDefined();
    expect(test).toBeDefined();
    expect(expect).toBeDefined();
  });

  test('should be able to import modules', async () => {
    // Test that we can import our core modules
    const coreModule = await import('../src/core/transliterationEngine');
    expect(coreModule).toBeDefined();
    expect(coreModule.TransliterationEngineFactory).toBeDefined();
  });

  test('should handle basic JavaScript operations', () => {
    const testString = 'Hello World';
    const testArray = [1, 2, 3];
    const testObject = { key: 'value' };

    expect(testString).toBe('Hello World');
    expect(testArray).toHaveLength(3);
    expect(testObject.key).toBe('value');
  });

  test('should handle async operations', async () => {
    const promise = new Promise((resolve) => {
      setTimeout(() => resolve('resolved'), 10);
    });

    await expect(promise).resolves.toBe('resolved');
  });
});
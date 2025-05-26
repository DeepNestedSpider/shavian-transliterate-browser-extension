import { describe, test, expect } from "bun:test";

describe('Basic Test', () => {
  test('should pass a simple test', () => {
    expect(1 + 1).toBe(2);
  });

  test('should handle strings', () => {
    expect('hello').toBe('hello');
  });
});

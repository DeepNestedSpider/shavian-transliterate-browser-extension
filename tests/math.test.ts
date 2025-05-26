/**
 * Very basic test to verify Bun testing works
 */

import { describe, test, expect } from "bun:test";

describe('Basic Math Operations', () => {
  test('should add numbers correctly', () => {
    expect(2 + 2).toBe(4);
    expect(10 + 5).toBe(15);
  });

  test('should multiply numbers correctly', () => {
    expect(3 * 4).toBe(12);
    expect(7 * 8).toBe(56);
  });

  test('should handle string operations', () => {
    const str1 = 'Hello';
    const str2 = 'World';
    expect(str1 + ' ' + str2).toBe('Hello World');
    expect(str1.length).toBe(5);
  });

  test('should handle array operations', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(arr.length).toBe(5);
    expect(arr.includes(3)).toBe(true);
    expect(arr.includes(6)).toBe(false);
  });

  test('should handle promises', async () => {
    const promise = Promise.resolve('test');
    await expect(promise).resolves.toBe('test');
  });
});

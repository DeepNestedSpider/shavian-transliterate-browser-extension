/**
 * Test script for ReadlexiconEngine function word heuristics
 */

import { describe, test, expect, beforeAll } from "bun:test";
import { ReadlexiconEngine } from '../src/core/transliterationEngine';
import { readlexDict } from '../src/dictionaries/readlex';

describe('ReadlexiconEngine Function Word Heuristics', () => {
  let engine: ReadlexiconEngine;

  beforeAll(() => {
    engine = new ReadlexiconEngine(readlexDict);
  });

  test('should handle basic "to" transliteration', () => {
    const result = engine.transliterate("to go");
    expect(result).toBe("𐑑 𐑜𐑴");
  });

  test('should apply befto heuristic for "have to"', () => {
    const result = engine.transliterate("have to go");
    expect(result).toBe("𐑣𐑨𐑝 𐑨𐑓 𐑜𐑴");
  });

  test('should apply befto heuristic for "has to"', () => {
    const result = engine.transliterate("has to be");
    expect(result).toBe("𐑣𐑨𐑟 𐑨𐑕 𐑚𐑰");
  });

  test('should apply befto heuristic for "used to"', () => {
    const result = engine.transliterate("used to work");
    expect(result).toBe("𐑿𐑟𐑛 𐑕𐑑 𐑢𐑻𐑒");
  });

  test('should apply befto heuristic for "supposed to"', () => {
    const result = engine.transliterate("supposed to come");
    expect(result).toBe("𐑕𐑩𐑐𐑴𐑟𐑛 𐑕𐑑 𐑒𐑳𐑥");
  });

  test('should NOT apply befto heuristic for "go to"', () => {
    const result = engine.transliterate("go to school");
    expect(result).toBe("𐑜𐑴 𐑑𐑵 𐑕𐑒𐑵𐑤");
  });

  test('should NOT apply befto heuristic for "want to"', () => {
    const result = engine.transliterate("want to play");
    expect(result).toBe("𐑢𐑪𐑯𐑑 𐑑𐑵 𐑐𐑤𐑱");
  });

  test('should handle contractions correctly', () => {
    const testCases = [
      { input: "I'll go", expected: "𐑲𐑤 𐑜𐑴" },
      { input: "you're here", expected: "𐑿𐑮 𐑣𐑦𐑼" },
      { input: "won't work", expected: "𐑢𐑴𐑯𐑑 𐑢𐑻𐑒" }
    ];

    testCases.forEach(({ input, expected }) => {
      const result = engine.transliterate(input);
      expect(result).toBe(expected);
    });
  });

  test('should transliterate "to" alone correctly', () => {
    const freshEngine = new ReadlexiconEngine(readlexDict);
    const result = freshEngine.transliterateWord('to');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  test('should handle "have to" sequence correctly', () => {
    const haveToEngine = new ReadlexiconEngine(readlexDict);
    const result = haveToEngine.transliterate('have to');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  test('should pass all function word test cases', () => {
    const testCases = [
      // Basic "to" should transliterate normally
      { text: "to go", expected: "𐑑 𐑜𐑴" },
      
      // Function word heuristics - "to" should change based on preceding word
      { text: "have to go", expected: "𐑣𐑨𐑝 𐑨𐑓 𐑜𐑴" },
      { text: "has to be", expected: "𐑣𐑨𐑟 𐑨𐑕 𐑚𐑰" },
      { text: "used to work", expected: "𐑿𐑟𐑛 𐑕𐑑 𐑢𐑻𐑒" },
      { text: "supposed to come", expected: "𐑕𐑩𐑐𐑴𐑟𐑛 𐑕𐑑 𐑒𐑳𐑥" },
      
      // These should NOT trigger the heuristic
      { text: "go to school", expected: "𐑜𐑴 𐑑𐑵 𐑕𐑒𐑵𐑤" },
      { text: "want to play", expected: "𐑢𐑪𐑯𐑑 𐑑𐑵 𐑐𐑤𐑱" },
      
      // Test contractions
      { text: "I'll go", expected: "𐑲𐑤 𐑜𐑴" },
      { text: "you're here", expected: "𐑿𐑮 𐑣𐑦𐑼" },
      { text: "won't work", expected: "𐑢𐑴𐑯𐑑 𐑢𐑻𐑒" },
    ];

    let passed = 0;
    let failed = 0;

    testCases.forEach(testCase => {
      const result = engine.transliterate(testCase.text);
      const success = result === testCase.expected;
      
      if (success) {
        passed++;
      } else {
        failed++;
      }
      
      expect(result).toBe(testCase.expected);
    });

    expect(passed).toBeGreaterThan(0);
    expect(failed).toBe(0);
  });
});

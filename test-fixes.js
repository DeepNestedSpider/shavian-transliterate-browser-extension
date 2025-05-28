#!/usr/bin/env node

// Simple test script to verify our fixes
console.log("Testing our fixes...");

// Test 1: Check separatePunctuation function
try {
  const { separatePunctuation } = require('./src/core/punctuationHandler.js');
  const result = separatePunctuation("Shaw's");
  console.log('✓ separatePunctuation works:', result);
  console.log('  cleanWord:', result.cleanWord, '(expected: Shaw)');
  console.log('  trailingPunctuation:', result.trailingPunctuation, "(expected: 's)");
} catch (e) {
  console.log('✗ separatePunctuation test failed:', e.message);
}

console.log("\nTest completed.");

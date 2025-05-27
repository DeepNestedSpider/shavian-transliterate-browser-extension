// Test script to verify the new readlex.ts dictionary
console.log('Starting dictionary test...');

try {
  const { readlexDict } = await import('./src/dictionaries/readlex.ts');
  console.log('Successfully imported readlexDict');
  console.log('Testing new readlex dictionary...');
console.log('Dictionary entries count:', Object.keys(readlexDict).length);
console.log('Sample entries:');
console.log('  "hello":', readlexDict['hello']);
console.log('  "world":', readlexDict['world']);
console.log('  "test":', readlexDict['test']);
console.log('  "a":', readlexDict['a']);

// Test some entries that should exist
const testWords = ['hello', 'world', 'test', 'the', 'and', 'to', 'of', 'a'];
for (const word of testWords) {
  if (readlexDict[word]) {
    console.log(`✓ "${word}" -> "${readlexDict[word]}"`);
  } else {
    console.log(`✗ "${word}" not found`);
  }
}

} catch (error) {
  console.error('Error importing dictionary:', error);
}

export {};

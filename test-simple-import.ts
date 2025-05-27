// Simple test to isolate the import issue
console.log('Testing ReadlexiconTransliterator import...');

try {
  // Try importing the class directly
  console.log('Step 1: Importing ReadlexiconTransliterator...');
  const { ReadlexiconTransliterator } = await import('./src/readlexiconTransliterator.ts');
  console.log('✓ Import successful');
  
  console.log('Step 2: Creating instance...');
  const transliterator = new ReadlexiconTransliterator();
  console.log('✓ Instance created');
  
  console.log('Step 3: Testing transliteration...');
  const result = await transliterator.transliterate('hello world');
  console.log('✓ Transliteration result:', result);
  
} catch (error) {
  console.error('✗ Error:', error);
  console.error('Stack:', error.stack);
}

export {};

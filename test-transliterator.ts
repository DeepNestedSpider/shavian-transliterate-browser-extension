// Test importing ReadlexiconTransliterator
console.log('Testing import...');

try {
  const module = await import('./src/readlexiconTransliterator.ts');
  console.log('Module exports:', Object.keys(module));
  console.log('ReadlexiconTransliterator available:', !!module.ReadlexiconTransliterator);
} catch (error) {
  console.error('Import error:', error);
}

export {};

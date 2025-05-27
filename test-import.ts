// Test script to debug import issues
console.log('Starting import test...');

try {
  console.log('Importing transliterationEngine...');
  const engine = await import('./src/core/transliterationEngine.ts');
  console.log('Engine exports:', Object.keys(engine));
  
  console.log('Importing posTagger...');
  const pos = await import('./src/core/posTagger.ts');
  console.log('POS exports:', Object.keys(pos));
  
  console.log('Importing readlex...');
  const dict = await import('./src/dictionaries/readlex.ts');
  console.log('Dict exports:', Object.keys(dict));
  
  console.log('Importing readlexiconTransliterator...');
  const transliterator = await import('./src/readlexiconTransliterator.ts');
  console.log('Transliterator exports:', Object.keys(transliterator));
  
  console.log('Test completed successfully');
} catch (error) {
  console.error('Import error:', error);
}

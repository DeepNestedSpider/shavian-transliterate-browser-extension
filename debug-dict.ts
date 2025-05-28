import { readlexDict } from './src/dictionaries/readlex.ts';

console.log('Dictionary has', Object.keys(readlexDict).length, 'entries');
console.log('Sample entries:', Object.keys(readlexDict).slice(0, 10));
console.log('Does it have "book"?', 'book' in readlexDict);
console.log('Does it have "cat"?', 'cat' in readlexDict);
console.log('Does it have "dog"?', 'dog' in readlexDict);
console.log('Does it have "computer"?', 'computer' in readlexDict);
console.log('Does it have "chair"?', 'chair' in readlexDict);
console.log('Does it have "table"?', 'table' in readlexDict);

// Also check if plurals logic is working in isolation
import { PluralAwareReadlexiconEngine } from './src/core/pluralAwareEngine.ts';

const engine = new PluralAwareReadlexiconEngine(readlexDict);
console.log('Testing plurals:');
console.log('books ->', engine.transliterateWord('books'));
console.log('cats ->', engine.transliterateWord('cats'));
console.log('dogs ->', engine.transliterateWord('dogs'));

import { ReadlexiconEngine } from './src/core/transliterationEngine';

console.log('Starting test...');

try {
  // Test simple reverse transliteration
  const engine = new ReadlexiconEngine({
    basic: {
      'hello': '𐑣𐑧𐑤𐑴',
      'world': '𐑢𐑻𐑤𐑛',
      'shaw': '𐑖𐑷',
      'to': '𐑑',
      'read': '𐑮𐑰𐑛'
    },
    posSpecific: {},
    getTransliteration(word: string, pos?: string): string | undefined {
      const cleanWord = word.toLowerCase();
      if (pos) {
        const posKey = `${cleanWord}_${pos}`;
        if (this.posSpecific[posKey]) {
          return this.posSpecific[posKey];
        }
      }
      return this.basic[cleanWord];
    },
    getAllVariants(word: string) {
      return [];
    }
  });

  console.log('Engine created successfully');
  
  console.log('Testing simple reverse transliteration:');
  console.log('𐑣𐑧𐑤𐑴 ->', engine.reverseTransliterateWord('𐑣𐑧𐑤𐑴'));
  console.log('𐑢𐑻𐑤𐑛 ->', engine.reverseTransliterateWord('𐑢𐑻𐑤𐑛'));
  console.log('·𐑖𐑷 ->', engine.reverseTransliterateWord('·𐑖𐑷'));
  console.log('𐑑 ->', engine.reverseTransliterateWord('𐑑'));

  // Test a simple sentence
  console.log('\nTesting simple sentence:');
  console.log('𐑣𐑧𐑤𐑴 𐑢𐑻𐑤𐑛 ->', engine.reverseTransliterate('𐑣𐑧𐑤𐑴 𐑢𐑻𐑤𐑛'));
  
  console.log('Test completed successfully');
} catch (error) {
  console.error('Error during test:', error);
}

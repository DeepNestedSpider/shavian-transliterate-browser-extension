console.log('🧪 Starting Simple Dechifro Test...');

const testDict = {
  "hello": "𐑣𐑧𐑤𐑴",
  "world": "𐑢𐑻𐑤𐑛",
  "test": "𐑑𐑧𐑕𐑑",
  "the": "𐑞",
  "and": "𐑯"
};

class TestTransliterator {
  constructor() {
    console.log('✅ TestTransliterator created with', Object.keys(testDict).length, 'entries');
  }
  
  transliterate(word) {
    const lower = word.toLowerCase();
    const result = testDict[lower] || `[${word}]`;
    console.log(`  "${word}" → "${result}"`);
    return result;
  }
}

const transliterator = new TestTransliterator();

console.log('\n📝 Testing words:');
transliterator.transliterate('hello');
transliterator.transliterate('world');
transliterator.transliterate('test');
transliterator.transliterate('unknown');

console.log('\n✅ Test completed!');

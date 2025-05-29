// Quick test of the IPA transliteration functionality
import { createEnglishToIPAEngine } from '../src/transliterators/english';

// Test the IPA engine
async function testIPAEngine() {
    console.log('Testing English-to-IPA transliteration engine...\n');
    
    const engine = await createEnglishToIPAEngine();
    
    // Test individual words
    const testWords = ['hello', 'world', 'phonetic', 'alphabet', 'pronunciation'];
    
    console.log('=== Individual Word Transliterations ===');
    for (const word of testWords) {
        const result = await engine.transliterateWord(word);
        console.log(`${word} → ${result.transliteration} (confidence: ${result.confidence})`);
    }
    
    // Test phrases
    console.log('\n=== Phrase Transliterations ===');
    const testPhrases = [
        'Hello world',
        'The International Phonetic Alphabet',
        'This is a test of pronunciation'
    ];
    
    for (const phrase of testPhrases) {
        const result = await engine.transliterateText(phrase);
        console.log(`"${phrase}" → "${result.transliteration}"`);
    }
    
    // Show engine info
    console.log('\n=== Engine Information ===');
    const info = engine.getInfo();
    console.log(`Name: ${info.name}`);
    console.log(`Description: ${info.description}`);
    console.log(`Version: ${info.version}`);
    console.log(`Author: ${info.author}`);
}

// Run the test
testIPAEngine().catch(console.error);

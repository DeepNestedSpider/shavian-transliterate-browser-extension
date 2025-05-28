import { readlexDict } from './src/dictionaries/readlex';
import { ReadlexiconEngine } from './src/core/transliterationEngine';

async function debugHyphenatedCompound() {
    console.log("=== Debugging Hyphenated Compound: year-and-a-day ===\n");
    
    // Create engine with dictionary
    const engine = new ReadlexiconEngine(readlexDict);
    
    // Test individual parts
    console.log("1. Testing individual parts:");
    console.log("'year':", readlexDict.getTransliteration('year'));
    console.log("'and':", readlexDict.getTransliteration('and'));
    console.log("'a':", readlexDict.getTransliteration('a'));
    console.log("'day':", readlexDict.getTransliteration('day'));
    
    // Test the full compound using the engine
    console.log("\n2. Testing full compound:");
    const result = engine.transliterate('year-and-a-day');
    console.log("'year-and-a-day':", result);
    
    // Test individual word parts through the engine
    console.log("\n3. Testing individual parts through engine:");
    console.log("'year':", engine.transliterateWord('year'));
    console.log("'and':", engine.transliterateWord('and'));
    console.log("'a':", engine.transliterateWord('a'));
    console.log("'day':", engine.transliterateWord('day'));
    
    // Test with different casing
    console.log("\n4. Testing with different casing:");
    console.log("'Year-and-a-day':", engine.transliterate('Year-and-a-day'));
    console.log("'YEAR-AND-A-DAY':", engine.transliterate('YEAR-AND-A-DAY'));
    
    // Test individual words without hyphens
    console.log("\n5. Testing without hyphens:");
    console.log("'year and a day':", engine.transliterate('year and a day'));
    
    // Test other hyphenated words
    console.log("\n6. Testing other hyphenated compounds:");
    console.log("'twenty-one':", engine.transliterate('twenty-one'));
    console.log("'self-help':", engine.transliterate('self-help'));
}

debugHyphenatedCompound().catch(console.error);
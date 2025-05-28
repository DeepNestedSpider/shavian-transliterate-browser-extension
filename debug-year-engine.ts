import { readlexDict } from './src/dictionaries/readlex';
import { ReadlexiconEngine } from './src/core/transliterationEngine';

async function debugYearProcessing() {
    try {
        console.log("=== Debugging Year Processing ===\n");
        
        const engine = new ReadlexiconEngine(readlexDict);
        
        // Test the transliterateWordInternal method directly if possible
        console.log("1. Engine transliterateWord for 'year':");
        const result1 = engine.transliterateWord('year');
        console.log(result1);
        
        // Test with POS tag
        console.log("\n2. Engine transliterateWord for 'year' with NN1 POS:");
        const result2 = engine.transliterateWord('year', 'NN1');
        console.log(result2);
        
        // Test in context where it might be treated differently
        console.log("\n3. Engine transliterate for full sentence with 'year':");
        const result3a = engine.transliterate('It was a year');
        console.log("'It was a year':", result3a);
        const result3b = engine.transliterate('one year ago');
        console.log("'one year ago':", result3b);
        const result3c = engine.transliterate('this year');
        console.log("'this year':", result3c);
        
        // Test individual parts to see where the 's' comes from
        console.log("\n4. Testing possible suffix rules:");
        const directLookup = readlexDict.getTransliteration('year');
        console.log("Direct dictionary lookup for 'year':", directLookup);
        const basicEntry = readlexDict.basic['year'];
        console.log("Dictionary basic entry:", basicEntry);
        
        // Check if there are suffix rules being applied
        console.log("\n5. Check for potential suffix patterns:");
        // Look for any suffix entries in the dictionary
        const posSpecific = Object.entries(readlexDict.posSpecific);
        const suffixEntries = posSpecific.filter(([key]) => key.startsWith('$'));
        console.log("Found suffix patterns:", suffixEntries.slice(0, 10)); // Show first 10
        
        console.log("\n=== Debug Complete ===");
    } catch (error) {
        console.error("Error in debug:", error);
    }
}

debugYearProcessing();

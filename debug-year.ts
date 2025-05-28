import { readlexDict } from './src/dictionaries/readlex';

async function debugYear() {
    console.log("=== Investigating 'year' dictionary entries ===\n");

    // Get all variants of "year"
    const variants = readlexDict.getAllVariants('year');
    console.log("All variants for 'year':");
    variants.forEach(variant => {
        console.log(`  ${variant.key}: ${variant.transliteration} (POS: ${variant.pos})`);
    });

    // Check basic lookup
    console.log("\nBasic lookup:");
    console.log("year (basic):", readlexDict.getTransliteration('year'));

    // Check with different POS tags
    console.log("\nPOS-specific lookups:");
    const commonPosTags = ['NN1', 'NN2', 'VV0', 'VVI', 'VVD', 'VVG', 'VVN'];
    commonPosTags.forEach(pos => {
        const result = readlexDict.getTransliteration('year', pos);
        if (result) {
            console.log(`year (${pos}):`, result);
        }
    });

    // Check if there's a years entry
    console.log("\nChecking 'years':");
    console.log("years (basic):", readlexDict.getTransliteration('years'));

    // Check the basic dictionary directly for year-related entries
    console.log("\nChecking basic dictionary for year entries:");
    const basicEntries = Object.entries(readlexDict.basic);
    const yearEntries = basicEntries.filter(([key]) => key.includes('year'));
    yearEntries.forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
    });
}

debugYear().catch(console.error);

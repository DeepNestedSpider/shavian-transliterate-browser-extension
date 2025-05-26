#!/usr/bin/env bun
/**
 * Test script for our refactored architecture
 */

console.log('🧪 Starting test...');

async function testRefactoredArchitecture() {
  console.log('🧪 Testing Refactored Architecture...\n');

  try {
    console.log('📦 Importing modules...');
    const { TransliterationEngineFactory } = await import('../src/core/transliterationEngine');
    console.log('✅ Modules imported successfully!');

    // Test ToShavian engine
    console.log('📦 Creating ToShavian engine...');
    const toShavianEngine = await TransliterationEngineFactory.createEngine('to-shavian');
    console.log('✅ ToShavian engine created successfully!');

    // Test basic transliteration
    const testText = 'Hello world';
    console.log(`🔤 Transliterating: "${testText}"`);
    const transliterated = toShavianEngine.transliterate(testText);
    console.log(`"${testText}" → "${transliterated}"`);

    // Test word transliteration
    const testWord = 'hello';
    const transliteratedWord = toShavianEngine.transliterateWord(testWord);
    console.log(`Word "${testWord}" → "${transliteratedWord}"`);

    console.log('\n✅ ToShavian test completed successfully!');
    
    // Test Dechifro engine
    console.log('\n📦 Creating Dechifro engine...');
    const dechifroEngine = await TransliterationEngineFactory.createEngine('dechifro');
    console.log('✅ Dechifro engine created successfully!');

    // Test dechifro transliteration
    const dechifroResult = dechifroEngine.transliterate(testText);
    console.log(`Dechifro: "${testText}" → "${dechifroResult}"`);

    console.log('\n✅ Refactored architecture test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

testRefactoredArchitecture();

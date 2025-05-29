/**
 * Quick test script for the IPA transliteration functionality
 */

import fs from 'fs';
import path from 'path';

// Load the IPA dictionary
const ipaDataPath = path.join(process.cwd(), 'src/dictionaries/ipa-en_US.json');
const ipaData = JSON.parse(fs.readFileSync(ipaDataPath, 'utf8'));
const ipaDictionary = ipaData.en_US[0];

// Simple test function
function getIPAPronunciation(word) {
  const normalizedWord = word.toLowerCase().trim();
  return ipaDictionary[normalizedWord] || null;
}

// Test some common words
const testWords = ['hello', 'world', 'test', 'pronunciation', 'water', 'computer'];

console.log('Testing IPA Dictionary Functionality:\n');

testWords.forEach(word => {
  const ipa = getIPAPronunciation(word);
  console.log(`${word} -> ${ipa || 'Not found'}`);
});

console.log(`\nDictionary contains ${Object.keys(ipaDictionary).length} entries.`);

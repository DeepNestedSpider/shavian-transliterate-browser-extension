// Robust deduplication script for readlex.ts
// Usage: node scripts/deduplicate-readlex.js

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/dictionaries/readlex.ts');
const fileContent = fs.readFileSync(filePath, 'utf8');

const dictStart = fileContent.indexOf('export const readlexDict');
const openBrace = fileContent.indexOf('{', dictStart);
const closeBrace = fileContent.indexOf('};', openBrace);

if (dictStart === -1 || openBrace === -1 || closeBrace === -1) {
    console.error('Dictionary object not found.');
    process.exit(1);
}

const beforeDict = fileContent.slice(0, openBrace + 1);
const dictBlock = fileContent.slice(openBrace + 1, closeBrace);
const afterDict = fileContent.slice(closeBrace);

const lines = dictBlock.split('\n');
const seen = new Set();
const dedupedLines = [];

for (const line of lines) {
    const match = line.match(/^\s*"([^"]+)":/);
    if (match) {
        const key = match[1];
        if (seen.has(key)) continue;
        seen.add(key);
    }
    dedupedLines.push(line);
}

const newContent = beforeDict + '\n' + dedupedLines.join('\n') + afterDict;
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Deduplication complete.');

#!/usr/bin/env bun
/**
 * Script to convert .dict files to TypeScript objects for bundling
 * Based on readlexicon's dictionary loading logic
 */

const fs = require('fs');
const path = require('path');

function convertDictToJS(dictFilePath, outputPath) {
    console.log(`Converting ${dictFilePath} to ${outputPath}...`);
    
    const dictContent = fs.readFileSync(dictFilePath, 'utf-8');
    const lines = dictContent.split('\n').filter(line => line.trim() && !line.startsWith('//'));
    
    const dictObject = {};
    
    for (const line of lines) {
        const parts = line.split(' ');
        if (parts.length < 2) continue;
        
        const word = parts[0];
        const translation = parts.slice(1).join(' ');
        
        // Handle multiple translations (@ separator in original code)
        if (dictObject[word]) {
            if (typeof dictObject[word] === 'string' && !dictObject[word].includes('@')) {
                dictObject[word] += '@' + translation;
            }
        } else {
            dictObject[word] = translation;
        }
        
        // Handle deletion marker
        if (translation === '.') {
            delete dictObject[word];
        }
    }
    
    const jsContent = `// Auto-generated from ${path.basename(dictFilePath)}
// Do not edit manually - regenerate using npm run convert-dict

export const ${path.basename(dictFilePath, '.dict')}Dict: Record<string, string> = ${JSON.stringify(dictObject, null, 2)};
`;
    
    fs.writeFileSync(outputPath, jsContent, 'utf-8');
    console.log(`✓ Generated ${outputPath} with ${Object.keys(dictObject).length} entries`);
}

// Convert all dictionary files
const dictDir = path.join(__dirname, '..', 'readlexicon-dictionaries');
const outputDir = path.join(__dirname, '..', 'src', 'dictionaries');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Convert each dictionary file
const dictFiles = ['amer.dict', 'brit.dict', 'vs1.dict'];

for (const dictFile of dictFiles) {
    const dictPath = path.join(dictDir, dictFile);
    const outputPath = path.join(outputDir, dictFile.replace('.dict', '.ts'));
    
    if (fs.existsSync(dictPath)) {
        convertDictToJS(dictPath, outputPath);
    } else {
        console.warn(`Warning: ${dictPath} not found, skipping...`);
    }
}

// Create index file
const indexContent = `// Auto-generated dictionary exports
// Do not edit manually - regenerate using npm run convert-dict

${dictFiles.map(file => {
    const name = path.basename(file, '.dict');
    return `export { ${name}Dict } from './${name}';`;
}).join('\n')}

export type DictionaryName = ${dictFiles.map(file => `'${path.basename(file, '.dict')}'`).join(' | ')};

export const dictionaries = {
${dictFiles.map(file => {
    const name = path.basename(file, '.dict');
    return `  ${name}: ${name}Dict,`;
}).join('\n')}
} as const;
`;

fs.writeFileSync(path.join(outputDir, 'index.ts'), indexContent, 'utf-8');
console.log('✓ Generated index.ts');

console.log('\nDictionary conversion complete!');

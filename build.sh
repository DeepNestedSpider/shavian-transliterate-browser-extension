#!/bin/bash
echo "Building popup.ts, content.ts and background.ts into ./dist for target 'browser'"
bun build ./src/popup.ts ./src/content.ts ./src/background.ts --outdir ./dist --target=browser 
echo "Copying forcefully all files from './public/' into './dist/'"
cp ./public/* ./dist/ --force -v
echo "Copying 'src/popup.html' into './dist'"
cp ./src/popup.html ./dist/ --force -v

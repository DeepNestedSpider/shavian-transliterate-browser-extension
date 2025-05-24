#!/bin/bash

set -e

rm -rf dist/*
echo "Building popup.ts, content.ts into ./dist for target 'browser'"
# Note: languageDetector.ts and shavianTransliterator.ts are imported by content.ts,
# so they don't need to be explicitly listed here for Bun's build.
bun build ./src/popup.ts ./src/content.ts --outdir ./dist --target=browser
echo "Copying forcefully all files from './public/' into './dist/'"
cp ./public/* ./dist/ -f -r -v
echo "Copying 'src/popup.html' into './dist'"
cp ./src/popup.html ./dist/ --force -v


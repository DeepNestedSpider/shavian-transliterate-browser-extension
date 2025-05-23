#!/bin/bash

set -e

echo "Building popup.ts, content.ts and background.ts into ./dist for target 'browser'"
bun build ./src/popup.ts ./src/content.ts ./src/background.ts --outdir ./dist --target=browser 
echo "Copying forcefully all files from './public/' into './dist/'"
cp ./public/* ./dist/ --force -v
echo "Copying 'src/popup.html' into './dist'"
cp ./src/popup.html ./dist/ --force -v

echo "Packaging up at 'shavianize-extension'"

if [ ! -d "shavianize-extension" ]; then
    mkdir -p "shavianize-extension"
fi

rm -rf ./shavianize-extension/
cp ./dist -r -f -v ./shavianize-extension

rm -rf ./releases/*
echo "Compressing to tar.gz" 
env GZIP=-9 tar cvzf ./releases/shavianize-extension.tar.gz ./shavianize-extension
echo "Compressing to .zip"
zip -r ./releases/shavianize-extension.zip ./shavianize-extension/
echo "All done"

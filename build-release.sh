#!/bin/bash

set -e

bun run build:dist

echo "Packaging up at 'shavian-transliterate-browser-extension'"

if [ ! -d "shavian-transliterate-browser-extension" ]; then
    echo "Creating folder 'shavian-transliterate-browser-extension'"
    mkdir -p "shavian-transliterate-browser-extension"
fi

echo "Purging 'shavian-transliterate-browser-extension' folder contents"
rm -rf shavian-transliterate-browser-extension/* # More precise purge
echo "Copying contents of './dist' to './shavian-transliterate-browser-extension'"
cp -r -f -v ./dist/* ./shavian-transliterate-browser-extension/ # Copy contents, not the 'dist' folder itself

echo "Purging './releases' folder contents"
rm -rf ./releases/*

mkdir -p ./releases

echo "Compressing to *.tar.gz and storing in 'releases'"
env GZIP=-9 tar cvzf ./releases/shavian-transliterate-browser-extension.tar.gz ./shavian-transliterate-browser-extension
echo "Compressing to *.zip and storing in 'releases'"
zip -r ./releases/shavian-transliterate-browser-extension.zip ./shavian-transliterate-browser-extension/
echo "All done"

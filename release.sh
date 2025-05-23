#!/bin/bash

set -e

bash build.sh

echo "Packaging up at 'shavianize-extension'"

if [ ! -d "shavianize-extension" ]; then
    echo "Creating folder './shavianize-extension'"
    mkdir -p "shavianize-extension"
fi

echo "Purging 'shavianize-extension' folder contents"
rm -rf ./shavianize-extension/
echo "Copying contents of './dist' to './shavianize-extension'"
cp ./dist -r -f -v ./shavianize-extension

echo "Purging './releases' folder contents"
rm -rf ./releases/*

echo "Compressing to *.tar.gz and storing in 'releases'" 
env GZIP=-9 tar cvzf ./releases/shavianize-extension.tar.gz ./shavianize-extension
echo "Compressing to *.zip and storing in 'releases'" 
zip -r ./releases/shavianize-extension.zip ./shavianize-extension/
echo "All done"

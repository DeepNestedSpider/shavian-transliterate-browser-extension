#!/bin/bash

# Path to your manifest.json
MANIFEST_PATH="./public/manifest.json"

# Read the current version
current_version=$(jq -r '.version' "$MANIFEST_PATH")
echo "Current version: $current_version"

# Split the version into parts (major, minor, patch)
IFS='.' read -r major minor patch <<< "$current_version"

# Increment the patch version
new_patch=$((patch + 1))

# Form the new version string
new_version="${major}.${minor}.${new_patch}"
echo "New version: $new_version"

# Update the version in the manifest.json using jq in-place
jq ".version = \"$new_version\"" "$MANIFEST_PATH" > temp_manifest.json && mv temp_manifest.json "$MANIFEST_PATH"

echo "Version updated in $MANIFEST_PATH to $new_version"

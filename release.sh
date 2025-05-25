#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Starting version bump and Git push process..."

# 1. Run the Bun script to increment the version in manifest.json
echo "Incrementing version in manifest.json..."
bun run increment-version

# Check if the version increment was successful
if [ $? -ne 0 ]; then
    echo "Error: Failed to increment version. Exiting."
    exit 1
fi

# 2. Get the new version from manifest.json
echo "Retrieving new version from manifest.json..."
NEW_VERSION=$(jq -r '.version' ./public/manifest.json)
if [ -z "$NEW_VERSION" ]; then
    echo "Error: Could not read new version from manifest.json. Exiting."
    exit 1
fi
echo "New version detected: v$NEW_VERSION"

# 3. Add the updated manifest.json to staging
echo "Adding updated manifest.json to Git staging..."
git add ./public/manifest.json

# 4. Commit the version bump
echo "Committing version bump..."
git commit -m "Bump version to v$NEW_VERSION"

# 5. Create a Git tag
echo "Creating Git tag v$NEW_VERSION..."
git tag "v$NEW_VERSION"

# 6. Push commits to the 'master' branch
echo "Pushing commits to origin master..."
git push -u origin master

# 7. Push the new tag
echo "Pushing tag v$NEW_VERSION to origin..."
git push -u origin "v$NEW_VERSION"

echo "Process completed successfully: Version bumped, committed, tagged, and pushed."

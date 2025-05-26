#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "🚀 Starting automated release process..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository. Please run this from the project root."
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Warning: You have uncommitted changes. Please commit or stash them first."
    git status --short
    exit 1
fi

# Check if jq is available
if ! command -v jq &> /dev/null; then
    echo "❌ Error: jq is required but not installed. Please install jq first."
    exit 1
fi

# Sync with remote (handle branch divergence)
echo "🔄 Syncing with remote repository..."
git fetch origin

# Check if we need to pull/merge
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u} 2>/dev/null || echo "")
BASE=$(git merge-base @ @{u} 2>/dev/null || echo "")

if [ "$LOCAL" != "$REMOTE" ] && [ -n "$REMOTE" ]; then
    if [ "$LOCAL" = "$BASE" ]; then
        echo "🔄 Pulling latest changes from remote..."
        git pull origin master
    elif [ "$REMOTE" = "$BASE" ]; then
        echo "✅ Local branch is ahead of remote (will push later)"
    else
        echo "⚠️  Warning: Local and remote branches have diverged."
        echo "Please resolve this manually with 'git pull' or 'git rebase' before releasing."
        exit 1
    fi
fi

# 1. Run the Bun script to increment the version in manifest.json
echo "📈 Incrementing version in manifest.json..."
bun run increment-version

# Check if the version increment was successful
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to increment version. Exiting."
    exit 1
fi

# 2. Get the new version from manifest.json
echo "🔍 Retrieving new version from manifest.json..."
NEW_VERSION=$(jq -r '.version' ./public/manifest.json)
if [ -z "$NEW_VERSION" ] || [ "$NEW_VERSION" = "null" ]; then
    echo "❌ Error: Could not read new version from manifest.json. Exiting."
    exit 1
fi
echo "✨ New version detected: v$NEW_VERSION"

# 3. Build the extension
echo "🔨 Building extension..."
bun run build:dist

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Error: Build failed. Exiting."
    exit 1
fi

# 4. Create release packages
echo "📦 Creating release packages..."
./build-release.sh

# Check if packaging was successful
if [ $? -ne 0 ]; then
    echo "❌ Error: Release packaging failed. Exiting."
    exit 1
fi

# 5. Add all changes to staging (including built files)
echo "📋 Adding changes to Git staging..."
git add ./public/manifest.json
git add ./releases/

# 6. Commit the version bump and releases
echo "💾 Committing version v$NEW_VERSION..."
git commit -m "Release v$NEW_VERSION

- Bump version to v$NEW_VERSION
- Add release packages
- Built extension files"

# 7. Create a Git tag
echo "🏷️  Creating Git tag v$NEW_VERSION..."
git tag "v$NEW_VERSION" -m "Release version $NEW_VERSION"

# 8. Push commits to the 'master' branch
echo "⬆️  Pushing commits to origin master..."
git push origin master

# 9. Push the new tag
echo "🏷️  Pushing tag v$NEW_VERSION to origin..."
git push origin "v$NEW_VERSION"

echo "🎉 Release process completed successfully!"
echo "📋 Summary:"
echo "   • Version bumped to: v$NEW_VERSION"
echo "   • Extension built and packaged"
echo "   • Changes committed and tagged"
echo "   • Pushed to GitHub"
echo ""
echo "🔗 Next steps:"
echo "   • Create a GitHub release at: https://github.com/DeepNestedSpider/shavian-transliterate-browser-extension/releases"
echo "   • Upload the release files from ./releases/"

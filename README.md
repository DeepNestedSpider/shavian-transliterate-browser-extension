# What is this?

This project bundles to a browser extension that transliterates all the relevant content of a webpage

# Why does this exist?

1. All the other implementations that i found for this same thing use ancient code, and they follow the manifest 2 specification.
2. I wanted to try out Bunn
3. I wanted to try out TypeScript/JavaScript
4. I wanted to make a Browser Extension

# Build Process

## Linux

### Install bun

```bash
curl -fsSL https://bun.sh/install | bash
```

[Source](https://bun.sh/)

### Install Project's Dependencies

```bash
bun install
```

### Build to `./dist/`

```bash
bun run build:dist
```

### Build and archive to `*.zip` and `*.tar.gz`

```bash
./build-release.sh
```

## Development Scripts

### Available Commands

```bash
# Build the extension
bun run build:dist

# Run tests
bun run test          # Run main test
bun run test:all      # Run all tests

# Version management
bun run increment-version

# Dictionary conversion (from dechifro format)
bun run convert-dict

# Clean temporary files
bun run clean
```

### Project Structure

```
src/                 # Source TypeScript files
  core/             # Core transliteration engines
  dictionaries/     # Generated dictionary files
  types/           # Type definitions
tests/              # Test files
scripts/            # Build and utility scripts
public/             # Static assets (manifest, icons)
dist/               # Built extension (generated)
```

# ToDo

## Implemented Features:

- [x] Build process mostly contained in bun (release packaging still contained in `./build-release.\*` scripts)
- [x] Transliteration by `npm to-shavian`
- [x] Avoidance of text that should not be transliterated such as:
  - [x] Code Snippets: `<code>`,`<pre>`, `<xmp>`
  - [x] User Input Spaces: `<input>`, `<textarea>`
  - [x] Embeded code: `<script>`, `<style>`, `<noscript>`, `<iframe>`
  - [x] Non english scripts: (IPA, Turkish, etc) (alpha implementation)
- [x] Recognize non-changed words and attempt to split them with `Intl.Segmenter`
- [x] HTML Language recognition. (lang attribute)
- [x] Chrome i18n Page Detection
- [x] Preference popup options:
  - [x] Disable transliteration
  - [x] Website language detection method:
    - [x] HTML Lang
    - [x] Chrome i18n Page Detection
    - [x] Force Transliteration

## High Priority and Low Complexity

- [ ] Work on the UI design

## High Priority and High Complexity

- [ ] Modularize Transliteration (to facilitate Engine integration)
- [ ] Translate 'dechifro-transliterator' Python's Code to JavaScript

## Low Priority and Low Complexity

- [ ] Add custom font support.

## Low Priority and High Complexity

- [ ] Create my own transliteration implementation.
  - Use a Phonetic Dictionary from English to IPA.
  - [ ] Offer transliteration for IPA.
  - Transliterate from IPA to Shavian

## Thinkpad for Logic:

1.  Manifest calls for `content.ts`
2.  `content.ts` imports and initiates `languageDetector.ts`
3.  `languageDetector.ts` retrieves configuration and tries to match the HTML language or browser UI language to English.
4.  If English is detected and transliteration is enabled, `languageDetector.ts` dynamically imports and executes `shavianTransliterator.ts`.
5.  `shavianTransliterator.ts` uses `to-shavian` to transliterate all relevant text elements on the website and sets up a `MutationObserver` for dynamic content.

## This project was developed using:

PC: SteamDeck
OS: Bazzite/Distrobox/Archlinux btw
Bundler: Bun
Transliteration Engines: `to-shavian`
Text Editor: NeoVim + AstronVim + AstroCommunity

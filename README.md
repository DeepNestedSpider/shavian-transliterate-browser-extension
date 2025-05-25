# shavian-transliterate-browser-extension

This project uses to-shavian as the engine, and bun as the packager

To install dependencies:

```bash
bun install
```

To build a release:

```bash
chmod +x ./release.sh
./release.sh
```

# ToDo

## Implemented Features:

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

Nothing Really

## High Priority and High Complexity

- [ ] Modularize Transliteration (to facilitate Engine integration)
- [ ] Translate 'dechifro-transliterator' Python's Code to JavaScript
- [ ] Work on the UI design

## Low Priority and Low Complexity

- [ ] Refactor the code and expand comments.
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

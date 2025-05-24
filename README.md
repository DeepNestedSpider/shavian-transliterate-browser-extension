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

## Minimum viable product

- [x] Effectively transliterate pages to Shavian alphabet.

## Short-term goals

- [x] modularize system:
  - [x] English transliteration.
  - [x] Text language recognition.
- [x] Set up language recognition
- [x] Set up a method to store preferences. (extension popup)
- [x] Offer a select menu with language recognition options as follow:
  - [x] Use HTML provided language.
  - [x] Use Chrome built-in language recognition.
- [x] Offer a way to turn off the transliteration.
- [x] Setup automatic IPA recognition and avoidance
- [x] Setup unchanged word recognition and splitting
- [x] Setup code snipet avoidance
- [x] Offer force transliteration button to user

## Medium Term

- [ ] Setup options for transliteration library.
- [ ] Create my own transliteration implementation.
  - Use a Phonetic Dictionary from English to IPA.
  - [ ] Offer transliteration for IPA.
  - Transliterate from IPA to Shavian
- [ ] Work on the UI design

## Long-term goals

- [ ] Refactor the code and expand comments.
- [ ] Avoid transliterating code snipets.
- [ ] Add custom font support.

## Thinkpad for Logic:

1.  Manifest calls for `content.ts`
2.  `content.ts` imports and initiates `languageDetector.ts`
3.  `languageDetector.ts` retrieves configuration and tries to match the HTML language or browser UI language to English.
4.  If English is detected and transliteration is enabled, `languageDetector.ts` dynamically imports and executes `shavianTransliterator.ts`.
5.  `shavianTransliterator.ts` uses `to-shavian` to transliterate all relevant text elements on the website and sets up a `MutationObserver` for dynamic content.

This project was created using `bun init` in bun v1.2.13.
[Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

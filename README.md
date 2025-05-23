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

![Enabled Screenshot Showoff](./brave_screenshot_en.wikipedia.org.png)

# ToDo

## Minimum viable product

- [x] Effectively transliterate pages to Shavian alphabet.

## Short-term goals

- [ ] modularize system:
  - [ ] English transliteration. // Uses to-shavian to transliterate the given text and repleaces it
  - [ ] Text extraction and replacement // Extracts and Replaces text from the website || Arguments: IDK
  - [x] Text language recognition. // Uses a variety of methods to recognize text language || Arguments: RecognitionType
  - [ ] Backgroud service. // Reads a config file .toml || Argumetns: None.
- [x] Set up language recognition
  - [ ] Set up a method to store preferences globally. ( Config menu)
  - [ ] Set up a method to store preferences per website. ( Pop-up menu)
  - [ ] Offer a select menu with language recognition options as follow:
    - [x] Use HTML provided language.
    - [ ] Language check off.
    - [ ] Use Chrome built in language recognition. (Global)
    - [ ] Use Chrome's built-in language recognition. (Per Text node)
- [ ] Offer a way to turn off the transliteration. (Or Undo it)

## Long-term goals

- [ ] Create my own transliteration implementation.
  - Use a Phonetic Dictionary from English to IPA.
  - Transliterate from IPA to Shavian
- [ ] Offer transliteration for IPA.
- [ ] Offer transliteration for a variety of scripts.

## Thinkpad for Logic:

1. Manifest calls for content.ts
<!-- 2. content.ts calls config-reader.ts and gets all the relevant configurations -->
2. content.ts calls language-matcher.ts passing down the relevant arguments
3. language-matcher.ts tries to match the html language to one of the supported languages
4. language-matcher.ts calls transliterator.ts and passes the relevant language of origin and transliteration target (two arguments)
5. transliterator.ts uses the relevant arguments and transliterates all the elements on the website using a transliteration library (to-shavian for now, plan is to make my own)

This project was created using `bun init` in bun v1.2.13. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

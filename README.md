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
- [ ] Text language recognition. // Uses a variety of methods to recognize text language || Arguments: RecognitionType
- [ ] Backgroud service. // Reads a config file .toml || Argumetns: None.
- [ ] Set up language recognition
  - [ ] Set up a method to store preferences globally. ( Config menu)
  - [ ] Set up a method to store preferences per website. ( Pop-up menu)
  - [ ] Offer a select menu with language recognition options as follow:
    - [ ] Use HTML provided language.
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

## Logic:

- Recognize language

Ideas: Html language specification

if english then shavianize
else dont do shit

-

This project was created using `bun init` in bun v1.2.13. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

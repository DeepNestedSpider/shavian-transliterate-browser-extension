// simple-quote-test.js
import { ReadlexiconTransliterator } from "./src/readlexiconTransliterator.ts";

const transliterator = new ReadlexiconTransliterator();

async function test() {
  await transliterator.ready();
  
  const text = '"Hello world" and \'Test\'';
  console.log("Input:", text);
  
  const result = await transliterator.transliterate(text);
  console.log("Output:", result);
}

test();

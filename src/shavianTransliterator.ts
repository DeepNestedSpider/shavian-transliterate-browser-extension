import { TransliterationEngineFactory } from './core/transliterationEngine';
import { DOMTransliterator, DOMObserver, DefaultTextNodeFilter } from './core/domTransliterator';

console.log('Shavian Transliteration Content Script loaded.');

let domTransliterator: DOMTransliterator | null = null;
let domObserver: DOMObserver | null = null;

async function initializeTransliterator() {
  try {
    const engine = await TransliterationEngineFactory.getEngineFromSettings();
    const filter = new DefaultTextNodeFilter();

    domTransliterator = new DOMTransliterator(engine, filter);
    domObserver = new DOMObserver(domTransliterator);

    // Perform initial transliteration
    domTransliterator.transliteratePage();
    console.log('Initial transliteration completed.');

    // Start observing for changes
    domObserver.start();
    console.log('DOM observer started for dynamic content.');
  } catch (error) {
    console.error('Failed to initialize transliterator:', error);
  }
}

// Initialize the transliterator
initializeTransliterator();

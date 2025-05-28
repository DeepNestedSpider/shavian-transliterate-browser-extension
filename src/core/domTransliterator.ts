/**
 * Core DOM manipulation utilities for transliteration
 */
import type { TransliterationEngine } from './transliterationEngine';

export interface TextNodeFilter {
  acceptNode(_node: Text): number;
}

export class DefaultTextNodeFilter implements TextNodeFilter {
  private static readonly EXCLUDED_TAGS = [
    'SCRIPT',
    'STYLE',
    'NOSCRIPT',
    'IFRAME',
    'TEXTAREA',
    'INPUT',
    'CODE',
    'PRE',
    'XMP',
  ];

  private static readonly IPA_CLASSES = ['IPA'];

  private static readonly IPA_PATTERN = /[ˈˌaɪeæɑɔʊŋʃʒθðʔçɾʁʀɱɲʋʤʧɡɣɬ]/u;

  acceptNode(node: Text): number {
    return this.shouldAcceptNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
  }

  private shouldAcceptNode(node: Text): boolean {
    // Check if empty or whitespace-only
    if (!node.nodeValue || node.nodeValue.trim().length === 0) {
      return false;
    }

    // Check ancestors for exclusion criteria
    let currentNode: Node | null = node.parentNode;
    while (currentNode) {
      if (currentNode instanceof HTMLElement) {
        // Check for excluded tag names
        if (DefaultTextNodeFilter.EXCLUDED_TAGS.includes(currentNode.nodeName)) {
          return false;
        }

        // Check for IPA class names
        if (
          DefaultTextNodeFilter.IPA_CLASSES.some(
            cls => currentNode instanceof HTMLElement && currentNode.classList.contains(cls)
          )
        ) {
          return false;
        }

        // Check for non-English lang attribute
        const langAttribute = currentNode.getAttribute('lang');
        if (langAttribute && !langAttribute.toLowerCase().startsWith('en')) {
          console.log(
            `Skipping content with non-English lang attribute: ${langAttribute} on element <${currentNode.nodeName}>`
          );
          return false;
        }
      }

      currentNode = currentNode.parentNode;
    }

    // Check for IPA content in square brackets
    if (node.nodeValue.match(/\[.*?\]/)) {
      if (DefaultTextNodeFilter.IPA_PATTERN.test(node.nodeValue)) {
        return false;
      }
    }

    return true;
  }
}

export class DOMTransliterator {
  protected engine: TransliterationEngine;
  protected filter: TextNodeFilter;

  constructor(engine: TransliterationEngine, filter: TextNodeFilter = new DefaultTextNodeFilter()) {
    this.engine = engine;
    this.filter = filter;
  }

  async transliteratePage(): Promise<boolean> {
    console.log('Attempting to transliterate page content...');
    let changesMade = false;

    const walker = document.createTreeWalker(
      document.body || document.documentElement,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node: Text) => this.filter.acceptNode(node),
      }
    );

    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (node.nodeType === Node.TEXT_NODE && node.nodeValue !== null) {
        const originalValue = node.nodeValue;
        const transliteratedValue = this.engine.transliterate(originalValue);

        if (transliteratedValue !== originalValue) {
          node.nodeValue = transliteratedValue;
          changesMade = true;
        }
      }
    }

    if (changesMade) {
      console.log('Page transliteration complete. Changes were made.');
    } else {
      console.log('Page transliteration complete. No changes were made.');
    }

    return changesMade;
  }

  updateEngine(engine: TransliterationEngine): void {
    this.engine = engine;
  }
}

export class DOMObserver {
  private domTransliterator: DOMTransliterator;
  private observer: MutationObserver | null = null;
  private debouncedTransliterate: () => void;

  constructor(domTransliterator: DOMTransliterator, debounceDelay: number = 500) {
    this.domTransliterator = domTransliterator;
    this.debouncedTransliterate = this.debounce(
      () => this.domTransliterator.transliteratePage(),
      debounceDelay
    );
  }

  start(): void {
    if (this.observer) {
      this.stop();
    }

    this.observer = new MutationObserver(mutationsList => {
      const hasRelevantChanges = mutationsList.some(
        mutation => mutation.type === 'childList' || mutation.type === 'characterData'
      );

      if (hasRelevantChanges) {
        console.log('DOM change detected, triggering transliteration...');
        this.debouncedTransliterate();
      }
    });

    this.observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    console.log('MutationObserver started for dynamic content.');

    // Also observe visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    console.log('MutationObserver stopped.');
  }

  private handleVisibilityChange = (): void => {
    if (document.visibilityState === 'visible') {
      console.log('Page became visible, re-transliterating...');
      this.debouncedTransliterate();
    }
  };

  private debounce<T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): (..._args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>;
    return function (this: any, ..._args: Parameters<T>) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, _args), delay);
    };
  }
}

/**
 * ReverseDOMTransliterator - Transliterates from Shavian script back to English
 */
export class ReverseDOMTransliterator extends DOMTransliterator {
  async transliteratePage(): Promise<boolean> {
    console.log('Attempting to reverse transliterate page content (Shavian → English)...');
    let changesMade = false;

    const walker = document.createTreeWalker(
      document.body || document.documentElement,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node: Text) => this.filter.acceptNode(node),
      }
    );

    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (node.nodeType === Node.TEXT_NODE && node.nodeValue !== null) {
        const originalValue = node.nodeValue;
        // Use reverse transliteration instead of normal transliteration
        const transliteratedValue = this.engine.reverseTransliterate(originalValue);

        if (transliteratedValue !== originalValue) {
          node.nodeValue = transliteratedValue;
          changesMade = true;
        }
      }
    }

    if (changesMade) {
      console.log('Reverse transliteration complete. Changes were made.');
    } else {
      console.log('Reverse transliteration complete. No changes were made.');
    }

    return changesMade;
  }
}

// src/shavianTransliterator.ts
import toShavian from 'to-shavian';

console.log("Shavian Transliteration Content Script loaded.");
const segmenter = new Intl.Segmenter('en-US', { granularity: 'word' });

function shavianizeWord(word: string): string {
  let shavianized = toShavian(word);
  shavianized = shavianized.replace(/ /g, '');

  if (shavianized === word && word.length > 1) {
    console.log(`Word "${word}" was not altered by to-shavian. Attempting segmentation.`);
    const segments = segmenter.segment(word);
    let reShavianized = '';
    for (const segment of segments) {
      if (segment.isWordLike) {
        reShavianized += toShavian(segment.segment).replace(/ /g, '');
      } else {
        reShavianized += segment.segment;
      }
    }
    if (reShavianized !== word) {
      return reShavianized;
    }
  }
  return shavianized;
}

function shavianizePage(): void {
  console.log("Attempting to shavianize page content...");
  let changesMade = false;

  const walker = document.createTreeWalker(
    document.body || document.documentElement,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function (node: Text) {
        const excludedTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'TEXTAREA', 'INPUT', 'CODE', 'PRE', 'XMP'];
        const ipaClasses = ['IPA'];

        let currentNode: ParentNode | null = node.parentNode;
        while (currentNode) {
          // 1. Check for excluded tag names
          if (excludedTags.includes(currentNode.nodeName)) {
            return NodeFilter.FILTER_REJECT;
          }

          // 2. Check for common IPA class names on any ancestor
          if (currentNode instanceof HTMLElement && ipaClasses.some(cls => currentNode.classList.contains(cls))) {
            return NodeFilter.FILTER_REJECT;
          }

          // 3. Check for non-English 'lang' attribute on any ancestor
          if (currentNode instanceof HTMLElement) {
            const langAttribute = currentNode.getAttribute('lang');
            // If a 'lang' attribute exists and it's not 'en' or starts with 'en'
            if (langAttribute && !langAttribute.toLowerCase().startsWith('en')) {
              console.log(`Skipping content with non-English lang attribute: ${langAttribute} on element <${currentNode.nodeName}>`);
              return NodeFilter.FILTER_REJECT;
            }
          }

          currentNode = currentNode.parentNode;
        }

        // 4. Heuristic for IPA within square brackets in the text node itself (last resort)
        if (node.nodeValue && node.nodeValue.match(/\[.*?\]/)) {
          if (/[ˈˌaɪeæɑɔʊŋʃʒθðʔçɾʁʀɱɲʋʤʧɡɣɬ]/u.test(node.nodeValue)) {
            return NodeFilter.FILTER_REJECT;
          }
        }

        // Reject empty or whitespace-only text nodes
        if (node.nodeValue === null || node.nodeValue.trim().length === 0) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node.nodeType === Node.TEXT_NODE && node.nodeValue !== null) {
      const originalValue = node.nodeValue;
      const words = originalValue.split(/(\s+)/);
      let shavianizedSegments: string[] = [];

      for (const segment of words) {
        if (segment.match(/^\s+$/)) {
          shavianizedSegments.push(segment);
        } else if (segment.length > 0) {
          shavianizedSegments.push(shavianizeWord(segment));
        }
      }

      const finalShavianizedValue = shavianizedSegments.join('');
      if (finalShavianizedValue !== originalValue) {
        node.nodeValue = finalShavianizedValue;
        changesMade = true;
      }
    }
  }

  if (changesMade) {
    console.log("Page shavianization complete. Changes were made.");
  } else {
    console.log("Page shavianization complete. No changes were made.");
  }
}

function debounce<T extends (...args: any[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

shavianizePage();
console.log("Initial shavianization triggered.");
const debouncedShavianize = debounce(shavianizePage, 500);

const observer = new MutationObserver((mutationsList, observer) => {
  let relevantChange = false;
  for (const mutation of mutationsList) {
    if (mutation.type === 'childList' || mutation.type === 'characterData') {
      relevantChange = true;
      break;
    }
  }

  if (relevantChange) {
    console.log("DOM change detected, ");
    debouncedShavianize();
  }
});

observer.observe(document.body || document.documentElement, {
  childList: true,
  subtree: true,
  characterData: true
});
console.log("MutationObserver started for dynamic content.");

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    console.log("Page became visible, re-shavianizing...");
    debouncedShavianize();
  }
});

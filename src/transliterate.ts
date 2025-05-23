const toShavian = require('to-shavian');

console.log("Shavian Transliteration Content Script loaded.");

function shavianizeWord(word: string): string {
  // Transliterate the word to Shavian
  let shavianized = toShavian(word);
  // Remove any spaces that the to-shavian library might have inserted between characters
  // This is crucial to prevent "𐑦 𐑥 𐑐 𐑹 𐑑" from becoming "𐑦𐑥𐑐𐑹𐑑" when it should be a single word.
  return shavianized.replace(/ /g, '');
}

function shavianizePage(): void {
  console.log("Attempting to shavianize page content...");
  let changesMade = false;

  // Create a TreeWalker to efficiently traverse text nodes
  const walker = document.createTreeWalker(
    document.body || document.documentElement,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function (node: Text) {
        // Reject nodes within script, style, and interactive elements
        if (node.parentNode && (
          node.parentNode.nodeName === 'SCRIPT' ||
          node.parentNode.nodeName === 'STYLE' ||
          node.parentNode.nodeName === 'NOSCRIPT' ||
          node.parentNode.nodeName === 'IFRAME' ||
          node.parentNode.nodeName === 'TEXTAREA' ||
          node.parentNode.nodeName === 'INPUT'
        )) {
          return NodeFilter.FILTER_REJECT;
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

      // Split the text by spaces, process each word, and then rejoin
      const words = originalValue.split(/(\s+)/); // Use regex to capture spaces as well
      let shavianizedSegments: string[] = [];

      for (const segment of words) {
        if (segment.match(/^\s+$/)) {
          // If it's a whitespace segment, keep it as is
          shavianizedSegments.push(segment);
        } else if (segment.length > 0) {
          // If it's a non-empty word, shavianize it
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

function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
  let timeout: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  } as T;
}

shavianizePage();
console.log("Initial shavianization triggered.");

const debouncedShavianize = debounce(shavianizePage, 500);

const observer = new MutationObserver((mutationsList, observer) => {
  let relevantChange = false;
  for (const mutation of mutationsList) {
    // Check if the change is a childList modification (nodes added/removed)
    // or characterData modification (text content changed)
    if (mutation.type === 'childList' || mutation.type === 'characterData') {
      relevantChange = true;
      break;
    }
  }

  if (relevantChange) {
    console.log("DOM change detected, re-shavianizing soon...");
    debouncedShavianize();
  }
});

observer.observe(document.body || document.documentElement, {
  childList: true,   // Observe direct children of the target
  subtree: true,     // Observe all descendants of the target
  characterData: true // Observe changes to the text content of nodes
});

console.log("MutationObserver started for dynamic content.");

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    console.log("Page became visible, re-shavianizing...");
    debouncedShavianize();
  }
});
export { };

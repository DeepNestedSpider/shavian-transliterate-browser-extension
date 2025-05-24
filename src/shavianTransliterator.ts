import toShavian from 'to-shavian';

console.log("Shavian Transliteration Content Script loaded.");
// Initialize Intl.Segmenter for word segmentation
// 'en-US' is used as a locale, you might want to make this configurable or detect the page's language
const segmenter = new Intl.Segmenter('en-US', { granularity: 'word' });
/**
 * Transliterates a single English word to Shavian.
 * If the word doesn't change after initial transliteration,
 * it attempts to segment it and transliterate segments individually.
 * @param word The English word to transliterate.
 * @returns The shavianized word, with internal spaces removed.
 */
function shavianizeWord(word: string): string {
  // Transliterate the word to Shavian
  let shavianized = toShavian(word);
  //
  // Remove any spaces that the to-shavian library might have inserted between characters
  shavianized = shavianized.replace(/ /g, '');
  //

  // IMPORTANT CHANGE: Check if the transliterated word is *exactly* the same as the original input word,
  // indicating that to-shavian did not process it.
  if (shavianized === word && word.length > 1) { // Only attempt segmentation if to-shavian made no change
    console.log(`Word "${word}" was not altered by to-shavian. Attempting segmentation.`);
    const segments = segmenter.segment(word);
    let reShavianized = '';
    for (const segment of segments) {
      if (segment.isWordLike) {
        // Only transliterate word-like segments
        reShavianized += toShavian(segment.segment).replace(/ /g, '');
      } else {
        // Keep non-word segments (like punctuation or spaces) as they are
        reShavianized += segment.segment;
      }
    }
    // If re-shavianization through segmentation yields a different result than the original word, use it.
    // Otherwise, stick with the original shavianized (which was the same as the original word)
    if (reShavianized !== word) { // Ensure segmented result is actually different
      return reShavianized;
    }
  }

  return shavianized;
}

/**
 * Traverses the DOM and replaces English text nodes with their Shavian transliteration.
 */
function shavianizePage(): void {
  console.log("Attempting to shavianize page content..."); //
  let changesMade = false;
  //
  // Create a TreeWalker to efficiently traverse text nodes
  const walker = document.createTreeWalker(
    document.body || document.documentElement, // Start from body or html element
    NodeFilter.SHOW_TEXT, // Only show text nodes
    {
      acceptNode: function (node: Text) {
        // List of tags whose content should not be transliterated
        const excludedTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'TEXTAREA', 'INPUT', 'CODE', 'PRE', 'XMP'];

        let currentNode = node.parentNode;
        while (currentNode) {
          if (excludedTags.includes(currentNode.nodeName)) {
            return NodeFilter.FILTER_REJECT;
          }
          currentNode = currentNode.parentNode;
        }

        // Reject empty or whitespace-only text nodes
        if (node.nodeValue === null || node.nodeValue.trim().length === 0) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
        //
      }
    }
  );

  let node: Node | null;
  //
  while ((node = walker.nextNode())) {
    if (node.nodeType === Node.TEXT_NODE && node.nodeValue !== null) {
      const originalValue = node.nodeValue;
      //
      // Split the text by spaces, process each word, and then rejoin
      const words = originalValue.split(/(\s+)/);
      //
      let shavianizedSegments: string[] = [];
      //
      for (const segment of words) {
        if (segment.match(/^\s+$/)) {
          // If it's a whitespace segment, keep it as is
          shavianizedSegments.push(segment);
          //
        } else if (segment.length > 0) {
          // If it's a non-empty word, shavianize it
          shavianizedSegments.push(shavianizeWord(segment));
          //
        }
      }

      const finalShavianizedValue = shavianizedSegments.join('');
      //
      // Only update the DOM if a change actually occurred
      if (finalShavianizedValue !== originalValue) {
        node.nodeValue = finalShavianizedValue;
        //
        changesMade = true;
        //
      }
    }
  }

  if (changesMade) {
    console.log("Page shavianization complete. Changes were made.");
    //
  } else {
    console.log("Page shavianization complete. No changes were made.");
    //
  }
}

/**
 * Debounces a function call, ensuring it's not called too frequently.
 * @param func The function to debounce.
 * @param delay The delay in milliseconds.
 * @returns A debounced version of the function.
 */
function debounce<T extends (...args: any[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  //
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  }; //
}

// Initial shavianization of the page when the script loads
shavianizePage();
console.log("Initial shavianization triggered.");
// Debounce the shavianization function to avoid excessive calls on rapid DOM changes
const debouncedShavianize = debounce(shavianizePage, 500);
//
// Set up a MutationObserver to re-shavianize content when the DOM changes
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
    console.log("DOM change detected, ");
    //
    debouncedShavianize();
  }
});

// Start observing the body (or html element) for changes
observer.observe(document.body || document.documentElement, {
  childList: true,   // Observe direct children of the target
  subtree: true,     // Observe all descendants of the target
  characterData: true // Observe changes to the text content of nodes
});
console.log("MutationObserver started for dynamic content.");

// Re-shavianize when the tab becomes visible again (e.g., after switching tabs)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    console.log("Page became visible, re-shavianizing...");
    debouncedShavianize();
  }
});

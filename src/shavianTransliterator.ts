import toShavian from 'to-shavian'; // Using default import as per common practice for libraries 

console.log("Shavian Transliteration Content Script loaded.");

/**
 * Transliterates a single English word to Shavian.
 * @param word The English word to transliterate.
 * @returns The shavianized word, with internal spaces removed. 
 */
function shavianizeWord(word: string): string {
  // Transliterate the word to Shavian 
  let shavianized = toShavian(word);
  // Remove any spaces that the to-shavian library might have inserted between characters 
  return shavianized.replace(/ /g, '');
}

/**
 * Traverses the DOM and replaces English text nodes with their Shavian transliteration.
 */
function shavianizePage(): void {
  console.log("Attempting to shavianize page content...");
  let changesMade = false;

  // Create a TreeWalker to efficiently traverse text nodes 
  const walker = document.createTreeWalker(
    document.body || document.documentElement, // Start from body or html element 
    NodeFilter.SHOW_TEXT, // Only show text nodes 
    {
      acceptNode: function (node: Text) {
        // Reject nodes within script, style, noscript, iframe, textarea, and input elements 
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
      // Only update the DOM if a change actually occurred 
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

/**
 * Debounces a function call, ensuring it's not called too frequently.
 * @param func The function to debounce. 
 * @param delay The delay in milliseconds. 
 * @returns A debounced version of the function.
 */
function debounce<T extends (...args: any[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

// Initial shavianization of the page when the script loads 
shavianizePage();
console.log("Initial shavianization triggered.");

// Debounce the shavianization function to avoid excessive calls on rapid DOM changes 
const debouncedShavianize = debounce(shavianizePage, 500);

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
    console.log("DOM change detected, re-shavianizing soon...");
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

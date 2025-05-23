function replaceTextOnPage(from: string, to: string) {
  const replacementRegex = new RegExp(quote(from), 'g'); // Create the regex once for efficiency

  getAllTextNodes().forEach(function (node) {
    if (node.nodeValue !== null) {
      const originalValue = node.nodeValue; // Store the original value

      // Perform the replacement
      node.nodeValue = originalValue.replace(replacementRegex, to);

      // Check if a replacement actually occurred by comparing original and new values
      if (node.nodeValue !== originalValue) {
        // Log the replacement. You can customize the log message.
        console.log(`Replaced "${from}" with "${to}" in node: "${originalValue}" -> "${node.nodeValue}"`);
        // If you want to log each *instance* of replacement within a node, it's more complex
        // as the replace method replaces all at once. The current approach logs per node that changes.
      }
    }
  });

  function getAllTextNodes(): Text[] {
    const result: Text[] = [];

    function scanSubTree(node: Node) {
      for (const childNode of Array.from(node.childNodes)) {
        scanSubTree(childNode);
      }

      if (node.nodeType === Node.TEXT_NODE) {
        result.push(node as Text);
      }
    }

    if (document.body) {
      scanSubTree(document.body);
    } else if (document.documentElement) {
      scanSubTree(document.documentElement);
    }

    return result;
  }

  function quote(str: string): string {
    return (str + '').replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
  }
}

replaceTextOnPage('hello', 'wasup');
replaceTextOnPage('Hello', 'Wasup');

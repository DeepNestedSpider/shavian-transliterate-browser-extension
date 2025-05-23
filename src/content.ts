/**
 * This script checks the language of the HTML document and, if it's English,
 * calls the 'transliterate.ts' script
 */
// Function to check the HTML language and run transliterate.ts
function checkAndCallTranscribe() {
  // Get the HTML element of the current document
  const htmlElement = document.documentElement;
  // Get the 'lang' attribute value.
  // The 'lang' attribute specifies the primary language for the element's contents
  // and for the element's attributes that contain text.
  const lang = htmlElement.getAttribute('lang');
  // Check if the 'lang' attribute exists and starts with 'en' (case-insensitive)
  // This ensures that the script only runs on English-language pages.
  if (lang && lang.toLowerCase().startsWith('en')) {
    console.log('HTML language is English. runing transliterate.ts...');
    const transliterate = require('./transliterate.ts')
    // For now 'transliterate.ts' does not stop so the console will never print the next message,
    // the plan is to make it so that this script is checks on the DOM for changes, not the transliterate.ts
    console.log('transliterate.ts was Called successfully.');

  } else {
    // The next text is logged to the console when the language is not english
    console.log(`HTML language is not English (${lang}). transliterate.ts will not be called.`);
  }
}

// Run the check and run function as soon as the content script loads.
// This ensures the language check happens early in the page load process.
checkAndCallTranscribe();



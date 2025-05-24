/**
 * This script is responsible for determining the document's language
 * based on user settings and initiating Shavian transliteration if the
 * detected language is English and transliteration is enabled.
 */

/**
 * Enum for different language checking modes.
 * Must match the LanguageCheckMode enum in popup.ts.
 */
enum LanguageCheckMode {
  HtmlLang = 'htmlLang',
  I18nPageText = 'i18nPageText', // Changed from I18nGlobal
}

/**
 * Retrieves the stored language check mode and transliteration setting from Chrome storage.
 * Defaults to HtmlLang and enabled transliteration if settings are not found or storage is unavailable.
 * @returns A promise that resolves to an object containing the languageCheckMode and transliterationEnabled settings.
 */
async function getSettings(): Promise<{ languageCheckMode: LanguageCheckMode, transliterationEnabled: boolean }> {
  let languageCheckMode: LanguageCheckMode = LanguageCheckMode.HtmlLang;
  let transliterationEnabled: boolean = true;

  // Check if chrome.storage API is available (i.e., running as an extension)
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
    try {
      const settings = await chrome.storage.sync.get(['languageCheckMode', 'transliterationEnabled']);
      // Validate and apply languageCheckMode setting
      if (settings.languageCheckMode && Object.values(LanguageCheckMode).includes(settings.languageCheckMode)) {
        languageCheckMode = settings.languageCheckMode as LanguageCheckMode;
      }
      // Apply transliterationEnabled setting
      if (typeof settings.transliterationEnabled === 'boolean') {
        transliterationEnabled = settings.transliterationEnabled;
      }
    } catch (error) {
      console.warn('Failed to retrieve settings from chrome.storage.sync. Defaulting to HTML Lang and enabled transliteration.', error);
    }
  } else {
    console.warn('chrome.storage.sync is not available. Script may not be running in a Chrome extension. Defaulting to HTML Lang and enabled transliteration.');
  }

  return { languageCheckMode, transliterationEnabled };
}

/**
 * Checks the document's language based on user settings and
 * calls the Shavian transliteration function if conditions are met.
 */
async function checkAndTransliterate(): Promise<void> {
  const { languageCheckMode, transliterationEnabled } = await getSettings();
  let isEnglish = false;
  let detectedLang = 'unknown';

  // If transliteration is disabled by the user, exit early.
  if (!transliterationEnabled) {
    console.log("Shavian transliteration is disabled by user settings.");
    return;
  }

  switch (languageCheckMode) {
    case LanguageCheckMode.HtmlLang:
      const htmlElement = document.documentElement;
      const lang = htmlElement.getAttribute('lang');
      if (lang) {
        detectedLang = lang;
        isEnglish = lang.toLowerCase().startsWith('en');
        if (isEnglish) {
          console.log("HTML 'lang' attribute indicates English.");
        }
      }
      break;
    case LanguageCheckMode.I18nPageText: // Changed from I18nGlobal
      // Check if chrome.i18n API is available
      if (typeof chrome !== 'undefined' && chrome.i18n) {
        // Sample text from the page (e.g., first 500 characters of body text)
        const textContent = document.body ? document.body.innerText.substring(0, 500) : '';
        if (textContent.length > 0) {
          try {
            const detectionResult = await chrome.i18n.detectLanguage(textContent);
            if (detectionResult && detectionResult.languages.length > 0) {
              const primaryLanguage = detectionResult.languages[0];
              detectedLang = primaryLanguage.language;
              isEnglish = primaryLanguage.language.toLowerCase().startsWith('en') && primaryLanguage.percentage > 70; // Consider English if confidence is high
              if (isEnglish) {
                console.log(`Chrome i18n API detected English page text (${detectedLang} with ${primaryLanguage.percentage}% confidence).`);
              } else {
                console.log(`Chrome i18n API detected page text as ${detectedLang} (${primaryLanguage.percentage}% confidence).`);
              }
            } else {
              console.warn('chrome.i18n.detectLanguage() returned no language. Proceeding without English detection.');
            }
          } catch (error) {
            console.error('Error detecting language using chrome.i18n.detectLanguage:', error);
          }
        } else {
          console.warn('No text content found to detect language from. Proceeding without English detection.');
        }
      } else {
        console.warn('chrome.i18n API is not available. Cannot perform page text i18n language check. Proceeding without English detection.');
      }
      break;

    default:
      console.warn(`An unrecognized language check mode was encountered: ${languageCheckMode}. Falling back to HtmlLang mode.`);
      // Default to HTML Lang if an unknown mode is encountered
      const defaultHtmlElement = document.documentElement;
      const defaultLang = defaultHtmlElement.getAttribute('lang');
      if (defaultLang) {
        detectedLang = defaultLang;
        isEnglish = defaultLang.toLowerCase().startsWith('en');
      }
      break;
  }

  // If English is detected, invoke the transliteration script
  if (isEnglish) {
    console.log(`Detected language is English (${detectedLang}). Initializing shavianTransliterator.ts...`);
    // Dynamically import and execute the transliteration logic
    // Using `import()` for cleaner separation and potential future code splitting
    try {
      await import('./shavianTransliterator');
      // This will execute the side effects (shavianizePage, MutationObserver)
      console.log('shavianTransliterator.ts was successfully invoked.');
    } catch (e) {
      console.error('Failed to load or execute shavianTransliterator.ts', e);
    }
  } else {
    console.log(`Detected language is not English (${detectedLang}). shavianTransliterator.ts will not be invoked.`);
  }
}

// Execute the language check and transliteration process when the script loads
checkAndTransliterate();

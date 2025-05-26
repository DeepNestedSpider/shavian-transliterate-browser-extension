/**
 * This script is responsible for determining the document's language
 * based on user settings and initiating Shavian transliteration if the
 * detected language is English and transliteration is enabled.
 */

import { TransliterationEngineFactory } from './core/transliterationEngine';
import { DOMTransliterator, DOMObserver } from './core/domTransliterator';

/**
 * Enum for different language checking modes.
 * Must match the LanguageCheckMode enum in popup.ts.
 */
enum LanguageCheckMode {
  HtmlLang = 'htmlLang',
  I18nPageText = 'i18nPageText', // Changed from I18nGlobal
}

/**
 * Language detection result interface
 */
interface LanguageDetectionResult {
  isEnglish: boolean;
  detectedLang: string;
  confidence?: number;
}

/**
 * User settings interface
 */
interface UserSettings {
  languageCheckMode: LanguageCheckMode;
  transliterationEnabled: boolean;
}

/**
 * Class responsible for detecting document language using various methods
 */
class LanguageDetector {
  /**
   * Detects the document language based on the specified mode
   */
  static async detectLanguage(mode: LanguageCheckMode): Promise<LanguageDetectionResult> {
    switch (mode) {
      case LanguageCheckMode.HtmlLang:
        return this.detectFromHtmlLang();
      case LanguageCheckMode.I18nPageText:
        return this.detectFromPageText();
      default:
        console.warn(`Unrecognized language check mode: ${mode}. Falling back to HtmlLang mode.`);
        return this.detectFromHtmlLang();
    }
  }

  /**
   * Detects language from HTML lang attribute
   */
  private static detectFromHtmlLang(): LanguageDetectionResult {
    const htmlElement = document.documentElement;
    const lang = htmlElement.getAttribute('lang');
    
    if (lang) {
      const isEnglish = lang.toLowerCase().startsWith('en');
      if (isEnglish) {
        console.log("HTML 'lang' attribute indicates English.");
      }
      return { isEnglish, detectedLang: lang };
    }
    
    return { isEnglish: false, detectedLang: 'unknown' };
  }

  /**
   * Detects language from page text using Chrome i18n API
   */
  private static async detectFromPageText(): Promise<LanguageDetectionResult> {
    // Check if chrome.i18n API is available
    if (typeof chrome === 'undefined' || !chrome.i18n) {
      console.warn('chrome.i18n API is not available. Cannot perform page text language check.');
      return { isEnglish: false, detectedLang: 'unknown' };
    }

    // Sample text from the page (e.g., first 500 characters of body text)
    const textContent = document.body?.innerText.substring(0, 500) || '';
    
    if (textContent.length === 0) {
      console.warn('No text content found to detect language from.');
      return { isEnglish: false, detectedLang: 'unknown' };
    }

    try {
      const detectionResult = await chrome.i18n.detectLanguage(textContent);
      
      if (detectionResult?.languages.length > 0) {
        const primaryLanguage = detectionResult.languages[0];
        
        if (primaryLanguage) {
          const isEnglish = primaryLanguage.language.toLowerCase().startsWith('en') && primaryLanguage.percentage > 70;
          
          if (isEnglish) {
            console.log(`Chrome i18n API detected English page text (${primaryLanguage.language} with ${primaryLanguage.percentage}% confidence).`);
          } else {
            console.log(`Chrome i18n API detected page text as ${primaryLanguage.language} (${primaryLanguage.percentage}% confidence).`);
          }
          
          return {
            isEnglish,
            detectedLang: primaryLanguage.language,
            confidence: primaryLanguage.percentage
          };
        }
      }
      
      console.warn('chrome.i18n.detectLanguage() returned no language.');
      return { isEnglish: false, detectedLang: 'unknown' };
    } catch (error) {
      console.error('Error detecting language using chrome.i18n.detectLanguage:', error);
      return { isEnglish: false, detectedLang: 'unknown' };
    }
  }

  /**
   * Gets user settings from Chrome storage
   */
  static async getSettings(): Promise<UserSettings> {
    let languageCheckMode: LanguageCheckMode = LanguageCheckMode.HtmlLang;
    let transliterationEnabled: boolean = true;

    // Check if chrome.storage API is available
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
        console.warn('Failed to retrieve settings from chrome.storage.sync. Using defaults.', error);
      }
    } else {
      console.warn('chrome.storage.sync is not available. Using default settings.');
    }

    return { languageCheckMode, transliterationEnabled };
  }
}

/**
 * Class responsible for managing transliteration lifecycle
 */
class TransliterationManager {
  private domTransliterator: DOMTransliterator | null = null;
  private domObserver: DOMObserver | null = null;

  /**
   * Checks document language and initializes transliteration if appropriate
   */
  async checkAndTransliterate(): Promise<void> {
    const settings = await LanguageDetector.getSettings();
    
    // If transliteration is disabled by the user, exit early
    if (!settings.transliterationEnabled) {
      console.log("Shavian transliteration is disabled by user settings.");
      return;
    }

    // Detect document language
    const detectionResult = await LanguageDetector.detectLanguage(settings.languageCheckMode);
    
    // If English is detected, start transliteration
    if (detectionResult.isEnglish) {
      console.log(`Detected language is English (${detectionResult.detectedLang}). Initializing Shavian transliteration...`);
      await this.initializeTransliteration();
    } else {
      console.log(`Detected language is not English (${detectionResult.detectedLang}). Shavian transliteration will not be initiated.`);
    }
  }

  /**
   * Forces transliteration regardless of language detection
   */
  async forceTransliteration(): Promise<void> {
    console.log("Force transliteration requested. Initializing Shavian transliteration...");
    await this.initializeTransliteration();
    console.log('Forced Shavian transliteration complete.');
  }

  /**
   * Initializes the transliteration system with DOM manipulation and observation
   */
  private async initializeTransliteration(): Promise<void> {
    try {
      // Create engine and DOM transliterator
      const engine = await TransliterationEngineFactory.getEngineFromSettings();
      this.domTransliterator = new DOMTransliterator(engine);
      
      // Transliterate existing content
      await this.domTransliterator.transliteratePage();
      
      // Set up DOM observation for dynamic content
      this.domObserver = new DOMObserver(this.domTransliterator);
      this.domObserver.start();
      
      console.log('Shavian transliteration system initialized successfully.');
    } catch (error) {
      console.error('Failed to initialize Shavian transliteration:', error);
    }
  }

  /**
   * Stops transliteration and cleans up observers
   */
  cleanup(): void {
    if (this.domObserver) {
      this.domObserver.stop();
      this.domObserver = null;
    }
    this.domTransliterator = null;
    console.log('Transliteration system cleaned up.');
  }
}

// Global transliteration manager instance
const transliterationManager = new TransliterationManager();

// Listen for messages from the popup
if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'forceTransliteration') {
      transliterationManager.forceTransliteration().then(() => {
        sendResponse({ status: 'transliteration initiated' });
      }).catch((error) => {
        console.error('Force transliteration failed:', error);
        sendResponse({ status: 'transliteration failed', error: error.message });
      });
      return true; // Indicates that the response is sent asynchronously
    }
  });
}

// Execute the language check and transliteration process when the script loads
transliterationManager.checkAndTransliterate();

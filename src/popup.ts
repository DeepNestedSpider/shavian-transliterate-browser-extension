/**
 * This script manages the user interface for the extension's popup.
 * It allows users to select their preferred language detection mode
 * and toggle Shavian transliteration, saving these settings using chrome.storage.sync.
 */

/**
 * Enum for different language checking modes.
 * Must match the LanguageCheckMode enum in languageDetector.ts.
 */
enum LanguageCheckMode {
  HtmlLang = 'htmlLang',
  I18nPageText = 'i18nPageText',
}

/**
 * References to DOM elements in the popup.
 */
const htmlLangRadio = document.getElementById('htmlLang') as HTMLInputElement;
const i18nPageTextRadio = document.getElementById('i18nPageText') as HTMLInputElement;
// Changed from i18nGlobalRadio
const saveButton = document.getElementById('saveButton') as HTMLButtonElement;
const statusMessage = document.getElementById('statusMessage') as HTMLParagraphElement;
const transliterationToggle = document.getElementById('transliterationToggle') as HTMLInputElement;

/**
 * Loads the current language check mode and transliteration enabled setting
 * from chrome.storage.sync and updates the UI accordingly.
 */
async function loadSettings(): Promise<void> {
  try {
    // Attempt to retrieve settings from Chrome storage
    const settings = await chrome.storage.sync.get(['languageCheckMode', 'transliterationEnabled']);
    const currentMode = settings.languageCheckMode as LanguageCheckMode | undefined;
    const transliterationEnabled = settings.transliterationEnabled as boolean | undefined;
    // Set the selected radio button based on the loaded mode
    if (currentMode === LanguageCheckMode.HtmlLang) {
      htmlLangRadio.checked = true;
    } else {
      // Default to I18nPageText if no setting is found, it's invalid, or it's the default
      i18nPageTextRadio.checked = true;
    }

    // Set the state of the transliteration toggle
    transliterationToggle.checked = transliterationEnabled !== false;
    // Default to true if not explicitly set to false
  } catch (error) {
    console.error('Error loading settings:', error);
    showStatusMessage('Error loading settings.', 'error');
  }
}

/**
 * Saves the selected language check mode and transliteration toggle state
 * to chrome.storage.sync.
 *
 * @param {boolean} [reloadPage=false] - Whether to reload the active tab after saving settings.
 */
async function saveSettings(reloadPage: boolean = false): Promise<void> {
  let selectedMode: LanguageCheckMode;

  // Determine the selected language check mode
  if (htmlLangRadio.checked) {
    selectedMode = LanguageCheckMode.HtmlLang;
  } else if (i18nPageTextRadio.checked) {
    selectedMode = LanguageCheckMode.I18nPageText;
  } else {
    // This case should ideally not be hit if radio buttons are properly set.
    showStatusMessage('Please select a language mode.', 'error');
    return;
  }

  const isTransliterationEnabled = transliterationToggle.checked;
  try {
    // Save settings to Chrome storage
    await chrome.storage.sync.set({
      languageCheckMode: selectedMode,
      transliterationEnabled: isTransliterationEnabled
    });
    showStatusMessage('Settings saved successfully!', 'success');
    console.log(`Language check mode set to: ${selectedMode}, Transliteration enabled: ${isTransliterationEnabled}`);

    if (reloadPage) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs[0] && tabs[0].id) {
          chrome.tabs.reload(tabs[0].id);
        }
      });
    }

  } catch (error) {
    console.error('Error saving settings:', error);
    showStatusMessage('Error saving settings.', 'error');
  }
}

/**
 * Displays a status message to the user in the popup.
 * @param message The message to display.
 * @param type The type of message ('success' or 'error') to apply styling.
 */
function showStatusMessage(message: string, type: 'success' | 'error'): void {
  statusMessage.textContent = message;
  statusMessage.style.color = (type === 'success') ?
    '#27ae60' : '#e74c3c';

  // Clear message after a few seconds
  setTimeout(() => {
    statusMessage.textContent = '';
  }, 3000);
}

/**
 * Event Listeners:
 * - When the DOM content is fully loaded, load the current settings.
 * - When the save button is clicked, save the new settings.
 * - When the transliteration toggle changes, save the new settings and reload the page.
 */
document.addEventListener('DOMContentLoaded', loadSettings);
saveButton.addEventListener('click', () => saveSettings(false)); // Save without reloading for radio buttons
transliterationToggle.addEventListener('change', () => saveSettings(true)); // Save and reload for the toggle

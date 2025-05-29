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
 * Enum for transliteration engine types.
 */
enum TransliterationEngine {
  Readlexicon = 'readlexicon',
  EnglishToIPA = 'english-to-ipa',
}

/**
 * Interface for popup settings
 */
interface PopupSettings {
  languageCheckMode: LanguageCheckMode;
  transliterationEnabled: boolean;
  transliterationEngine: TransliterationEngine;
  reverseMode: boolean;
}

/**
 * Default settings for the extension
 */
const DEFAULT_SETTINGS: PopupSettings = {
  languageCheckMode: LanguageCheckMode.HtmlLang,
  transliterationEnabled: true,
  transliterationEngine: TransliterationEngine.Readlexicon,
  reverseMode: false,
};

/**
 * Class responsible for managing popup settings and UI interactions
 */
class PopupManager {
  private languageModeSelect: HTMLSelectElement;
  private saveButton: HTMLButtonElement;
  private statusMessage: HTMLParagraphElement;
  private transliterationToggle: HTMLInputElement;
  private forceTransliterationButton: HTMLButtonElement;
  private transliterationEngineSelect: HTMLSelectElement;
  private refreshButton: HTMLButtonElement;
  private resetDefaultsButton: HTMLButtonElement;
  private reverseToggle: HTMLInputElement;
  private directionLabel: HTMLSpanElement;
  private perSiteToggle: HTMLInputElement;
  private currentDomain: string | null = null;

  constructor() {
    // Initialize DOM element references
    this.languageModeSelect = this.getElement('languageModeSelect') as HTMLSelectElement;
    this.saveButton = this.getElement('saveButton') as HTMLButtonElement;
    this.statusMessage = this.getElement('statusMessage') as HTMLParagraphElement;
    this.transliterationToggle = this.getElement('transliterationToggle') as HTMLInputElement;
    this.forceTransliterationButton = this.getElement(
      'forceTransliterationButton'
    ) as HTMLButtonElement;
    this.transliterationEngineSelect = this.getElement(
      'transliterationEngineSelect'
    ) as HTMLSelectElement;
    this.refreshButton = this.getElement('refreshButton') as HTMLButtonElement;
    this.resetDefaultsButton = this.getElement('resetDefaultsButton') as HTMLButtonElement;
    this.reverseToggle = this.getElement('reverseToggle') as HTMLInputElement;
    this.directionLabel = this.getElement('directionLabel') as HTMLSpanElement;
    this.perSiteToggle = this.getElement('perSiteToggle') as HTMLInputElement;

    this.setupEventListeners();
    this.initPerSite();
  }

  /**
   * Helper method to get DOM elements with error handling
   */
  private getElement(id: string): HTMLElement {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`Element with ID '${id}' not found`);
    }
    return element;
  }

  /**
   * Sets up all event listeners for the popup
   */
  private setupEventListeners(): void {
    // Load settings when popup opens
    document.addEventListener('DOMContentLoaded', () => this.loadSettings());

    // Save settings
    this.saveButton.addEventListener('click', () => this.saveSettings(false));
    this.transliterationToggle.addEventListener('change', () => this.saveSettings(true));
    this.reverseToggle.addEventListener('change', () => this.updateDirectionLabel());
    this.reverseToggle.addEventListener('change', () => this.saveReverseMode());

    // Engine and mode changes
    this.transliterationEngineSelect.addEventListener('change', () => this.saveEngineSettings());
    this.languageModeSelect.addEventListener('change', () => this.saveLanguageModeSettings());

    // Action buttons
    this.forceTransliterationButton.addEventListener('click', () => this.forceTransliteration());
    this.refreshButton.addEventListener('click', () => this.refreshPage());
    this.resetDefaultsButton.addEventListener('click', () => this.resetToDefaults());
  }

  private async initPerSite() {
    // Get current tab's domain
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) return;
    try {
      const url = new URL(tab.url);
      this.currentDomain = url.hostname;
      await this.loadPerSiteSetting();
    } catch (e) {
      this.currentDomain = null;
    }
  }

  private async loadPerSiteSetting() {
    if (!this.currentDomain) return;
    const data = await chrome.storage.sync.get(['perSiteSettings']);
    const perSiteSettings = data.perSiteSettings || {};
    const enabled = perSiteSettings[this.currentDomain];
    this.perSiteToggle.checked = enabled !== false; // default to true
    this.perSiteToggle.disabled = false;
    this.perSiteToggle.addEventListener('change', () => this.savePerSiteSetting());
  }

  private async savePerSiteSetting() {
    if (!this.currentDomain) return;
    const data = await chrome.storage.sync.get(['perSiteSettings']);
    const perSiteSettings = data.perSiteSettings || {};
    perSiteSettings[this.currentDomain] = this.perSiteToggle.checked;
    await chrome.storage.sync.set({ perSiteSettings });
    this.showStatusMessage('Per-site setting saved!', 'success');
  }

  /**
   * Loads current settings from Chrome storage and updates UI
   */
  async loadSettings(): Promise<void> {
    try {
      const settings = await chrome.storage.sync.get([
        'languageCheckMode',
        'transliterationEnabled',
        'transliterationEngine',
        'reverseMode',
      ]);

      // Update UI with loaded settings or defaults
      this.languageModeSelect.value =
        settings.languageCheckMode || DEFAULT_SETTINGS.languageCheckMode;
      this.transliterationToggle.checked = settings.transliterationEnabled !== false;
      this.transliterationEngineSelect.value =
        settings.transliterationEngine || DEFAULT_SETTINGS.transliterationEngine;
      this.reverseToggle.checked = settings.reverseMode || DEFAULT_SETTINGS.reverseMode;
      this.updateDirectionLabel();

    } catch (error) {
      console.error('Error loading settings:', error);
      this.showStatusMessage('Error loading settings.', 'error');
    }
  }

  /**
   * Saves language mode and transliteration toggle settings
   */
  async saveSettings(reloadPage: boolean = false): Promise<void> {
    try {
      const settings = {
        languageCheckMode: this.languageModeSelect.value as LanguageCheckMode,
        transliterationEnabled: this.transliterationToggle.checked,
      };

      await chrome.storage.sync.set(settings);
      this.showStatusMessage('Settings saved successfully!', 'success');

      if (reloadPage) {
        await this.refreshPage();
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      this.showStatusMessage('Error saving settings.', 'error');
    }
  }

  /**
   * Saves transliteration engine setting
   */
  async saveEngineSettings(): Promise<void> {
    try {
      await chrome.storage.sync.set({
        transliterationEngine: this.transliterationEngineSelect.value,
      });
      this.showStatusMessage('Engine setting saved!', 'success');
    } catch (error) {
      console.error('Error saving engine setting:', error);
      this.showStatusMessage('Error saving engine setting.', 'error');
    }
  }

  /**
   * Saves language mode setting
   */
  async saveLanguageModeSettings(): Promise<void> {
    try {
      await chrome.storage.sync.set({
        languageCheckMode: this.languageModeSelect.value,
      });
      this.showStatusMessage('Language mode saved!', 'success');
    } catch (error) {
      console.error('Error saving language mode:', error);
      this.showStatusMessage('Error saving language mode.', 'error');
    }
  }

  /**
   * Forces transliteration on the current active tab
   */
  async forceTransliteration(): Promise<void> {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (tab?.id) {
        await chrome.tabs.sendMessage(tab.id, {
          action: 'forceTransliteration',
        });
        this.showStatusMessage('Forcing transliteration on current page...', 'success');
      } else {
        this.showStatusMessage('No active tab found.', 'error');
      }
    } catch (error) {
      console.error('Error forcing transliteration:', error);
      this.showStatusMessage('Error forcing transliteration.', 'error');
    }
  }

  /**
   * Refreshes the current active tab
   */
  async refreshPage(): Promise<void> {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (tab?.id !== undefined) {
        await chrome.tabs.reload(tab.id);
        this.showStatusMessage('Page refreshed!', 'success');
      } else {
        this.showStatusMessage('No active tab found.', 'error');
      }
    } catch (error) {
      console.error('Error refreshing page:', error);
      this.showStatusMessage('Error refreshing page.', 'error');
    }
  }

  /**
   * Resets all settings to default values
   */
  async resetToDefaults(): Promise<void> {
    try {
      await chrome.storage.sync.set(DEFAULT_SETTINGS);

      // Update UI to reflect defaults
      this.transliterationToggle.checked = DEFAULT_SETTINGS.transliterationEnabled;
      this.transliterationEngineSelect.value = DEFAULT_SETTINGS.transliterationEngine;
      this.languageModeSelect.value = DEFAULT_SETTINGS.languageCheckMode;
      this.reverseToggle.checked = DEFAULT_SETTINGS.reverseMode;
      this.updateDirectionLabel();

      this.showStatusMessage('Settings reset to default.', 'success');
    } catch (error) {
      console.error('Error resetting settings:', error);
      this.showStatusMessage('Error resetting settings.', 'error');
    }
  }

  /**
   * Displays a status message to the user
   */
  private showStatusMessage(message: string, type: 'success' | 'error'): void {
    this.statusMessage.textContent = message;
    this.statusMessage.style.color = type === 'success' ? '#27ae60' : '#e74c3c';
    this.statusMessage.className = type;

    // Clear message after 3 seconds
    setTimeout(() => {
      this.statusMessage.textContent = '';
      this.statusMessage.className = '';
    }, 3000);
  }

  /**
   * Updates the direction label based on reverse toggle state
   */
  private updateDirectionLabel(): void {
    this.directionLabel.textContent = this.reverseToggle.checked
      ? 'Shaw → EN'
      : 'EN → Shaw';
  }

  /**
   * Saves reverse mode setting
   */
  async saveReverseMode(): Promise<void> {
    try {
      await chrome.storage.sync.set({
        reverseMode: this.reverseToggle.checked,
      });
      this.showStatusMessage('Direction setting saved!', 'success');
    } catch (error) {
      console.error('Error saving reverse mode:', error);
      this.showStatusMessage('Error saving direction setting.', 'error');
    }
  }
}

// Initialize popup manager when script loads
new PopupManager();

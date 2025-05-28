/**
 * Content Script Utilities
 * Helper functions for browser extension content scripts
 */

export interface ExtensionMessage {
  type: string;
  payload?: any;
}

export interface ContentScriptAPI {
  // Storage utilities
  getStorageItem(key: string): Promise<any>;
  setStorageItem(key: string, value: any): Promise<void>;
  
  // DOM utilities
  waitForElement(selector: string, timeout?: number): Promise<Element>;
  observeElementChanges(element: Element, callback: MutationCallback): MutationObserver;
  
  // Communication utilities
  sendMessage(message: ExtensionMessage): Promise<any>;
  onMessage(callback: (message: ExtensionMessage) => void): void;
  
  // Page utilities
  getPageLanguage(): string | null;
  isPageVisible(): boolean;
}

/**
 * Content Script Helper Class
 */
export class ContentScriptHelper implements ContentScriptAPI {
  private messageListeners: Set<(message: ExtensionMessage) => void> = new Set();

  constructor() {
    // Set up message listener
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.messageListeners.forEach(callback => callback(message));
    });
  }

  /**
   * Get item from extension storage
   */
  async getStorageItem(key: string): Promise<any> {
    return new Promise((resolve) => {
      chrome.storage.sync.get([key], (result) => {
        resolve(result[key]);
      });
    });
  }

  /**
   * Set item in extension storage
   */
  async setStorageItem(key: string, value: any): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [key]: value }, () => {
        resolve();
      });
    });
  }

  /**
   * Wait for an element to appear in the DOM
   */
  async waitForElement(selector: string, timeout: number = 10000): Promise<Element> {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver((mutations) => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * Observe changes to an element
   */
  observeElementChanges(element: Element, callback: MutationCallback): MutationObserver {
    const observer = new MutationObserver(callback);
    observer.observe(element, {
      childList: true,
      subtree: true,
      characterData: true
    });
    return observer;
  }

  /**
   * Send message to background script or popup
   */
  async sendMessage(message: ExtensionMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * Register message listener
   */
  onMessage(callback: (message: ExtensionMessage) => void): void {
    this.messageListeners.add(callback);
  }

  /**
   * Remove message listener
   */
  offMessage(callback: (message: ExtensionMessage) => void): void {
    this.messageListeners.delete(callback);
  }

  /**
   * Get the language of the current page
   */
  getPageLanguage(): string | null {
    // Try multiple methods to detect page language
    return (
      document.documentElement.lang ||
      document.querySelector('meta[http-equiv="content-language"]')?.getAttribute('content') ||
      document.querySelector('meta[name="language"]')?.getAttribute('content') ||
      null
    );
  }

  /**
   * Check if the page is currently visible
   */
  isPageVisible(): boolean {
    return !document.hidden;
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad(): Promise<void> {
    return new Promise((resolve) => {
      if (document.readyState === 'complete') {
        resolve();
      } else {
        window.addEventListener('load', () => resolve(), { once: true });
      }
    });
  }

  /**
   * Debounce function calls
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  /**
   * Throttle function calls
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Get selected text on the page
   */
  getSelectedText(): string {
    return window.getSelection()?.toString() || '';
  }

  /**
   * Scroll element into view smoothly
   */
  scrollToElement(element: Element): void {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }

  /**
   * Check if element is in viewport
   */
  isElementInViewport(element: Element): boolean {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /**
   * Create a temporary notification
   */
  showNotification(message: string, duration: number = 3000): void {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #333;
      color: white;
      padding: 12px 16px;
      border-radius: 4px;
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, duration);
  }
}

/**
 * Global content script helper instance
 */
export const contentHelper = new ContentScriptHelper();

/**
 * Utility functions for common content script tasks
 */
export const ContentUtils = {
  /**
   * Safely execute code when DOM is ready
   */
  onReady(callback: () => void): void {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  },

  /**
   * Create a CSS rule
   */
  addCSS(css: string): void {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  },

  /**
   * Remove all instances of a CSS class
   */
  removeClassFromAll(className: string): void {
    document.querySelectorAll(`.${className}`).forEach(el => {
      el.classList.remove(className);
    });
  },

  /**
   * Find text nodes containing specific text
   */
  findTextNodes(searchText: string, container: Element = document.body): Text[] {
    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node;
    while (node = walker.nextNode()) {
      if (node.textContent && node.textContent.includes(searchText)) {
        textNodes.push(node as Text);
      }
    }

    return textNodes;
  },

  /**
   * Highlight text in the page
   */
  highlightText(text: string, className: string = 'highlighted'): number {
    const textNodes = this.findTextNodes(text);
    let count = 0;

    textNodes.forEach(node => {
      if (node.parentElement) {
        const content = node.textContent || '';
        const highlightedContent = content.replace(
          new RegExp(text, 'gi'),
          `<span class="${className}">$&</span>`
        );
        
        if (highlightedContent !== content) {
          const wrapper = document.createElement('span');
          wrapper.innerHTML = highlightedContent;
          node.parentElement.replaceChild(wrapper, node);
          count++;
        }
      }
    });

    return count;
  }
};

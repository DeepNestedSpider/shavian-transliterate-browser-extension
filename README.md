# 𐑖𐑱𐑝𐑾𐑯 𐑑𐑮𐑨𐑯𐑕𐑤𐑦𐑑𐑼𐑱𐑑 - Shavian Transliterate Browser Extension

[![Version](https://img.shields.io/badge/version-0.0.3-blue.svg)](https://github.com/DeepNestedSpider/shavian-transliterate-browser-extension)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.x-black.svg)](https://bun.sh/)
[![GitHub](https://img.shields.io/badge/GitHub-DeepNestedSpider-blue.svg)](https://github.com/DeepNestedSpider/shavian-transliterate-browser-extension)

![Video Showcase on wikipedia](./showcase/wikipedia-video.webm)

A modern browser extension that automatically transliterates English text on web pages into the [Shavian alphabet](https://en.wikipedia.org/wiki/Shavian_alphabet) (𐑖𐑱𐑝𐑾𐑯). Built with TypeScript, Bun, and modern web standards using Manifest V3.

## ✨ Features

### 🔤 Intelligent Transliteration
- **Real-time conversion**: Automatically transliterates English text to Shavian script as pages load
- **Dynamic content support**: Monitors and transliterates content added via JavaScript using MutationObserver
- **Smart text recognition**: Uses `Intl.Segmenter` for accurate word boundary detection
- **Advanced transliteration engine**: Uses the readlexicon-based transliterator for accurate pronunciation-to-script conversion

### 🧠 Smart Content Detection
- **Language detection**: Recognizes English content using HTML `lang` attributes and Chrome's i18n API
- **Content filtering**: Intelligently avoids transliterating:
  - Code blocks (`<code>`, `<pre>`, `<xmp>`)
  - User input fields (`<input>`, `<textarea>`)
  - Embedded content (`<script>`, `<style>`, `<noscript>`, `<iframe>`)
  - Non-English scripts (IPA, Turkish, etc.)

### ⚙️ Flexible Configuration
- **Toggle transliteration**: Easy on/off switch via popup interface
- **Language detection modes**:
  - HTML lang attribute detection
  - Chrome i18n page detection
  - Force transliteration (override detection)

### 🎨 Modern Architecture
- **Manifest V3 compliant**: Built for the latest browser extension standards
- **TypeScript**: Full type safety and modern JavaScript features
- **Modular design**: Clean separation of concerns with dedicated modules for different functionalities
- **Performance optimized**: Minimal impact on page load times and browsing experience

## 🚀 Quick Start

### Installation

#### From Release (Recommended)
1. Download the latest release from the [releases page](https://github.com/DeepNestedSpider/shavian-transliterate-browser-extension/releases)
2. Extract the `.zip` file
3. Open Chrome/Chromium and navigate to `chrome://extensions/`
4. Enable "Developer mode"
5. Click "Load unpacked" and select the extracted folder

#### Build from Source
```bash
# Clone the repository
git clone https://github.com/DeepNestedSpider/shavian-transliterate-browser-extension.git
cd shavian-transliterate-browser-extension

# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install

# Build the extension
bun run build:dist

# The built extension will be in the ./dist/ folder
```

### Usage

1. **Install the extension** following the instructions above
2. **Click the extension icon** in your browser toolbar to open the popup
3. **Configure your preferences**:
   - Toggle transliteration on/off
   - Choose language detection method
   - Set per-site preferences
4. **Browse English websites** - text will be automatically transliterated to Shavian!

## 🛠️ Development

### Prerequisites
- [Bun](https://bun.sh/) - JavaScript runtime and package manager
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- Modern web browser (Chrome, Firefox, Edge)

### Why This Project Exists

This browser extension was created to address several limitations in existing Shavian transliteration tools:

1. **Modernization**: Existing implementations use outdated code and Manifest V2
2. **Learning opportunity**: Explore Bun, TypeScript, and modern browser extension development
3. **Better user experience**: Provide a more reliable and feature-rich transliteration tool
4. **Performance**: Leverage modern web APIs for faster, more efficient transliteration

### Development Setup

```bash
# Install dependencies
bun install

# Build for development
bun run build:dist

# Run tests
bun run test          # Run main test suite
bun run test:all      # Run all available tests

# Development utilities
bun run increment-version    # Bump version numbers
bun run convert-dict        # Convert readlexicon dictionary format
bun run clean              # Remove temporary and build files
```

### Build Commands

```bash
# Development build
bun run build:dist

# Production release (creates .zip and .tar.gz archives)
./build-release.sh        # Linux/macOS
./build-release.bat       # Windows (CMD)
./build-release.ps1       # Windows (PowerShell)
```

### Project Architecture

```
📁 Project Structure
├── 📂 src/                          # TypeScript source code
│   ├── 📂 core/                     # Core transliteration engines
│   │   ├── domTransliterator.ts     # DOM manipulation utilities
│   │   └── transliterationEngine.ts # Main transliteration logic
│   ├── 📂 dictionaries/             # Language dictionaries
│   │   ├── amer.ts                  # American English dictionary
│   │   ├── brit.ts                  # British English dictionary
│   │   ├── vs1.ts                   # Alternative dictionary
│   │   └── index.ts                 # Dictionary exports
│   ├── 📂 types/                    # TypeScript type definitions
│   ├── content.ts                   # Content script entry point
│   ├── popup.ts                     # Extension popup logic
│   ├── popup.html                   # Extension popup UI
│   ├── languageDetector.ts          # Language detection utilities
│   ├── shavianTransliterator.ts     # Main transliterator
│   └── readlexiconTransliterator.ts    # Alternative transliterator
├── 📂 public/                       # Static assets
│   ├── manifest.json               # Extension manifest
│   └── 📂 icons/                   # Extension icons
├── 📂 scripts/                      # Build and utility scripts
├── 📂 tests/                        # Test files
├── 📂 dist/                         # Built extension (generated)
└── 📂 releases/                     # Release archives
```

### How It Works

1. **Initialization**: `manifest.json` loads `content.ts` as a content script
2. **Language Detection**: `languageDetector.ts` analyzes page language using:
   - HTML `lang` attributes
   - Chrome i18n API
   - User configuration
3. **Conditional Loading**: If English is detected and transliteration is enabled:
   - Dynamically imports `shavianTransliterator.ts`
   - Initializes transliteration engine
4. **Text Processing**: `shavianTransliterator.ts` processes text using:
   - Custom readlexicon transliterator for advanced cases
   - DOM manipulation to update page content
5. **Dynamic Updates**: `MutationObserver` monitors for new content and transliterates it automatically

## 🧪 Testing

The project includes comprehensive tests for different transliteration scenarios:

- `test-refactored.ts` - Main test suite
- `test-readlexicon.ts` - Readlexicon transliterator tests
- `test-function-words.ts` - Function word handling tests
- `test-simple-*.ts` - Various simple test cases

```bash
# Run specific test
bun run tests/test-refactored.ts

# Run all tests
bun run test:all
```

## 🗺️ Roadmap

### ✅ Completed Features

- ✅ **Modern Build System**: Bun-based build process with TypeScript
- ✅ **Core Transliteration**: Integration with readlexicon-based transliterator
- ✅ **Smart Content Filtering**: Avoids transliterating inappropriate content:
  - Code blocks (`<code>`, `<pre>`, `<xmp>`)
  - User input fields (`<input>`, `<textarea>`)
  - Embedded content (`<script>`, `<style>`, `<noscript>`, `<iframe>`)
  - Non-English scripts (IPA, Turkish, etc.)
- ✅ **Advanced Text Processing**: Word boundary detection with `Intl.Segmenter`
- ✅ **Language Detection**: HTML lang attributes and Chrome i18n API
- ✅ **User Interface**: Popup with configuration options:
  - Toggle transliteration on/off
  - Language detection method selection
  - Force transliteration option

### 🎯 High Priority (Near Term)

#### Low Complexity
- [ ] **UI/UX Improvements**: Enhanced popup design and user experience
- [ ] **Better Error Handling**: Graceful fallbacks for edge cases
- [ ] **Performance Optimization**: Reduce memory usage and improve speed

#### High Complexity
- ✅ **Modular Transliteration System**: Plugin-based architecture for multiple engines
- ✅ **Readlexicon Integration**: Port Python readlexicon-transliterator to JavaScript
- [ ] **Advanced Language Detection**: Machine learning-based language identification

### 🔮 Future Vision (Long Term)

#### Low Complexity
- [ ] **Custom Font Support**: Allow users to specify preferred Shavian fonts
- [ ] **Keyboard Shortcuts**: Hotkeys for quick transliteration toggle
- [ ] **Export Features**: Save transliterated content as files

#### High Complexity
- [ ] **Custom Transliteration Engine**: Build proprietary transliterator with:
  - English to IPA phonetic conversion
  - IPA to Shavian mapping
  - Advanced pronunciation rules
- [ ] **Multi-language Support**: Extend beyond English to other languages
- [ ] **Real-time Collaboration**: Share transliterated content with others

## 🏗️ Technical Details

### Dependencies

#### Core Runtime
- **Bun**: Modern JavaScript runtime and package manager
- **TypeScript 5.x**: Type-safe JavaScript with latest features
- **compromise**: Natural language processing library for POS tagging

#### Development
- **@types/chrome**: Chrome extension API type definitions
- **@types/node**: Node.js type definitions
- **@types/bun**: Bun runtime type definitions

### Browser Compatibility

- ✅ **Chrome/Chromium**: Full support (primary target)
- ✅ **Edge**: Full support (Chromium-based)
- ⚠️ **Firefox**: Partial support (some Manifest V3 features may differ)
- ❌ **Safari**: Not currently supported (different extension system)

### Performance Characteristics

- **Memory Usage**: ~2-5MB typical, ~10MB with large pages
- **CPU Impact**: Minimal (<1% on modern systems)
- **Load Time**: <100ms initialization on most pages
- **Network**: No external requests (all processing local)

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Getting Started
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit with clear messages: `git commit -m 'Add amazing feature'`
5. Push to your fork: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Style
- Use TypeScript for all new code
- Follow existing naming conventions
- Add tests for new functionality
- Update documentation as needed

### Areas for Contribution
- 🐛 **Bug Fixes**: Check the issues page for known problems
- ✨ **Features**: Implement items from the roadmap
- 📚 **Documentation**: Improve README, add code comments
- ✅ **Testing**: Add more comprehensive test coverage
- 🎨 **UI/UX**: Enhance the popup interface and user experience

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Shaw Alphabet](https://www.shavian.info/)**: For preserving and promoting the Shavian script
- **[Readlexicon Project](https://readlexicon.org/)**: Inspiration for advanced transliteration techniques
- **Community**: Shavian alphabet enthusiasts and contributors

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/DeepNestedSpider/shavian-transliterate-browser-extension/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/DeepNestedSpider/shavian-transliterate-browser-extension/discussions)
- 📧 **Direct Contact**: Create an issue on GitHub
- 💬 **Community**: [GitHub Discussions](https://github.com/DeepNestedSpider/shavian-transliterate-browser-extension/discussions)

---

**Made with ❤️ on Steam Deck running Bazzite/Archlinux using NeoVim + AstronVim**

*This extension is not affiliated with the Shaw Estate or any official Shavian alphabet organization.*

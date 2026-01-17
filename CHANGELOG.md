# SmartWrite Companion Changelog

## [0.8.2] - 2026-01-17

### 📊 Enhanced Readability Analysis

**The plugin now includes Portuguese-optimized readability formulas, as recommended in the blueprint.**

### ✨ New Features

- **Gulpease Index**: Readability metric optimized for Romance languages (Portuguese, Spanish, Italian). Character-based calculation that's more accurate for these languages than traditional syllable-based methods.
- **SMOG Grade**: Superior readability metric for short texts (under 30 sentences). More accurate than Flesch-Kincaid for blog posts, article excerpts, and short stories.
- **Formula Selector**: Users can now choose from 8 different readability formulas via dropdown in the Readability panel.

### 🔧 Technical Changes

- Added `gulpease` and `smog` fields to `ReadabilityScores` interface
- Implemented Gulpease calculation in `ReadabilityEngine`
- Implemented SMOG calculation with polysyllable counting
- Updated `ReadabilityPanel` UI to include new formula options

---

## [0.8.0] - 2026-01-02

### 🌍 Major Feature: Multilingual & Translation Support

**SmartWrite now speaks your language. Seriously.**

### ✨ New Features

- **Language Support**: Configure the AI to respond in specific languages (Portuguese, English, Spanish, French, German) or auto-detect from input.
- **Multilingual Personas**: "Critical Editor", "Devil's Advocate" and others now maintain their personality while responding in the selected language.
- **Translation Module**: New "Translate" mode in the analysis panel.
- **Context-Aware Stitching**: Translates long projects chunk-by-chunk while passing context summaries to keep character names/terms consistent.

### 🔧 Improvements

- **UI Refinement**: Added "Mode" switcher to toggle between Analysis and Translation interfaces.
- **Performance**: Improved prompting strategy for handling non-English texts.

---

## [0.7.0] - 2026-01-01

### 📚 Major Feature: Longform Integration

**Write entire novels? No problem. SmartWrite now integrates with the Longform plugin.**

### ✨ New Features

- **Longform Project Support**: Analyze entire projects as a single draft.
- **Project Auto-Detection**: Automatically finds projects defined by the Longform plugin (notes with `longform` frontmatter).
- **Smart Stitched Analysis**: Compiles all scenes in the correct order into a single analysis context, respecting your manuscript structure.
- **Configurable Integration**: Enable/Disable and select your active project directly in Settings.

---

## [0.6.0] - 2026-01-01

### 🎉 Major Release: Installer & AI Refinements

**This version introduces a smart installer for easy setup and significantly improves the AI analysis experience.**

### ✨ New Features

- **Smart Installer (`install.sh`)**: A stand-alone script that detects Obsidian vaults, installs the plugin, and automatically sets up Ollama + Qwen model.
- **Strict Persona System**: All 8 personas have been re-engineered to be critical, direct, and professional—guaranteed no condescension.
- **Clean Analysis Output**: Generated markdown files now contain _only_ the AI feedback, keeping your vault clutter-free.
- **Button Pulse Animation**: Replaced the verbose stepper UI with a sleek pulsing animation during analysis.

### 🔧 Technical Improvements

- **Text Chunking**: Added logic to split large texts into chunks, preventing token limit errors during analysis.
- **Code Cleanup**: Removed redundant prompt files and unused code.

---

## [0.5.0] - 2026-01-01

### 🎉 Major Milestone: Writing Quality & Readability Complete

**This version marks the completion of the core writing assistance modules, bringing full editor integration, Portuguese support, and a unified professional interface.**

### ✨ New Features

- **Editor Highlighting**: Real-time visual highlights for passive voice, clichés, and long sentences using CodeMirror 6.
- **Interactive Suggestions**: Categorized sidebar view with click-to-focus functionality in the editor.
- **Full Readability Engine**: 6 scientific formulas with real-time interpretation and a premium visual gauge.
- **Advanced Portuguese Support**: Automatic PT-BR detection, custom syllable counting, and Martins adaptation for Flesch scores.

### 🎨 UI & UX Improvements

- **Design Harmony**: Unified the Readability panel with the Session Status module (fonts, bars, and layout).
- **Consolidated Suggestions**: Improved aggregation of individual writing issues for a cleaner sidebar.

### 🔧 Bug Fixes

- **Session Word Counter**: Resolved issues with word tracking when switching between multiple files.
- **Accuracy**: Improved Portuguese stop-word exclusion for repetition detection.

## [0.4.1] - 2025-12-23

### 🧠 Core Engine Enhancements

- **Intelligent Aggregation**: Suggestions are now grouped by category with total counts in badges.
- **Smarter Repetition Detection**: Added Portuguese stop-word exclusion (prepositions, articles) to focus on meaningful repetitions.
- **Generalized Detail Collection**: Logic updated to capture context snippets for grammar and sentence issues.

## [0.4.0] - 2025-12-22

### 🎉 Major Release: Core Analysis Engine Complete

**This version transforms SmartWrite Companion from a basic skeleton into a fully functional text analysis tool with real-time capabilities.**

### ✨ New Features

#### 🔍 **Complete Text Analysis Engine**

- **TextAnalyzer**: Comprehensive text parsing (words, sentences, syllables, frequency analysis)
- **StatsEngine**: 11 detailed text metrics including averages, reading time, and top words
- **SuggestionEngine**: Advanced writing suggestions (repetitions, passive voice, clichés, long sentences)
- **ReadabilityEngine**: 6 scientific readability formulas (Flesch, Gunning Fog, Coleman-Liau, etc.)

#### ⚡ **Real-Time Analysis**

- Live text analysis with 300ms debounce
- Automatic sidebar updates as you type
- Seamless integration with Obsidian editor

#### 🎨 **Enhanced User Interface**

- **SessionStatsPanel**: Current session tracking + daily progress
- **TextMetricsPanel**: 11 comprehensive text metrics
- **SuggestionsPanel**: Categorized suggestions by severity (high/medium/low)
- **ReadabilityPanel**: Readability scores with educational interpretations

#### 📊 **Advanced Metrics**

- Word/character/sentence/paragraph counts
- Syllable analysis and averages
- Reading time estimation
- Word frequency and top words analysis
- 6 readability scores with automatic level classification
- Writing quality suggestions (15+ types)

### 🏗️ **Architecture Improvements**

- Modular engine system (`src/core/`)
- TypeScript interfaces for all data structures
- Optimized build system (101KB production bundle)
- Real-time event handling with proper debouncing

### 🔧 **Technical Enhancements**

- Dependencies: text-readability, write-good, @nlpjs/\* packages
- Session tracking with persistence
- Settings integration with Obsidian
- Error handling and performance optimization

### 📈 **Performance**

- <50ms text analysis target
- <300ms UI update debounce
- Optimized bundle size
- Efficient memory usage

### 🎯 **Use Cases Enabled**

- Real-time writing feedback
- Text quality assessment
- Readability analysis
- Writing habit tracking
- Professional writing assistance

### 🔄 **Migration Notes**

- Settings are backward compatible
- No breaking changes from 0.3.x
- Enhanced functionality is additive

---

## [0.3.13] - Previous Version

- Basic plugin skeleton
- Sidebar placeholder
- Initial project structure

---

**Legend:**

- ✨ New feature
- 🔍 Analysis improvement
- ⚡ Performance enhancement
- 🎨 UI/UX improvement
- 🏗️ Architecture change
- 🔧 Technical improvement

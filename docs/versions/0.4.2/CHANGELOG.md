# SmartWrite Companion Changelog

## [0.4.1] - 2025-12-22

### 🎨 UI & UX Improvements

- **Unified Expandable Suggestions**: All suggestion categories (Long Sentences, Complex Words, Grammar) now support the same expandable detail view as Repetitions.
- **Pixel-Perfect Spacing**: Fine-tuned margins, padding, and alignments in the Suggestions panel for a cleaner look.
- **Smart Collapsing**: Suggestions are now collapsed by default to reduce noise.
- **Simplified Readability**: Temporarily replaced complex charts with a placeholder as requested.

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

# SmartWrite Companion

An intelligent writing assistant plugin for Obsidian that helps you write better, faster, and with more confidence. Features real-time statistics, readability analysis, and AI-powered persona feedback running 100% locally.

[GitHub Repository](https://github.com/zandercpzed/smartwrite-companion)

## Features

- **📊 Real-time Statistics**: Word count, character count, reading time, writing pace.
- **🎯 Session Tracking**: Daily goals, session words, words per minute.
- **📖 Readability Analysis**: 10 formulas (Flesch, Gunning Fog, SMOG, etc.) tailored for English and Portuguese.
- **✍️ Writing Suggestions**: Detects repeated words, long sentences, passive voice, and clichés.
- **🤖 AI Personas**: Get detailed feedback from 8 synthetic readers (Critical Editor, Booktuber, etc.) via local AI.
- **📂 File-Based Analysis**: AI feedback is saved to a new markdown file for easy reference.
- **⚙️ Model Management**: Download and manage AI models (Llama 3, Mistral, etc.) directly from settings.
- **🌍 Multilingual**: Optimized for EN, PT, ES, FR, DE.

## Installation

### Automatic Installation (Recommended)

1. Download the latest release.
2. Unzip and run the installer script in your terminal:
   ```bash
   ./install.sh
   ```
   This script will:
   - 🔍 Detect your Obsidian vaults automatically.
   - 📦 Install the plugin files to the correct folder.
   - 🤖 Check and install **Ollama** (via Homebrew) if missing.
   - 🧠 Download the **Qwen 2.5** AI model automatically.

### Manual Installation

1. Create a `smartwrite-companion` folder in your vault's `.obsidian/plugins/` directory.
2. Copy `main.js`, `manifest.json`, and `styles.css` into that folder.
3. Enable the plugin in Obsidian Settings (`Community Plugins` -> Reload -> Enable).

## Quick Start (AI Features)

This plugin uses **Ollama** to run AI models locally on your machine. No data leaves your computer.

1. **Install Ollama**: Download from [ollama.ai](https://ollama.ai).
2. **Enable in Settings**: Go to SmartWrite Companion settings and toggle "Enable Ollama".
3. **Download Model**: Click "Check Connection" and use the **Ollama Manager** in settings to download a recommended model (e.g., `llama3.2` or `qwen2.5`).
4. **Analyze**: Open the SmartWrite sidebar, select a Persona, and click "Analyze Text".

## Screenshots

[Add screenshots here]

## License

MIT

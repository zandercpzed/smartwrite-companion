# SmartWrite Companion

An intelligent writing assistant plugin for Obsidian.

## Features

- **Real-time Statistics**: Word count, character count, reading time, writing pace
- **Session Tracking**: Daily goals, session words, words per minute
- **Readability Analysis**: 10 formulas (Flesch, Gunning Fog, SMOG, etc.)
- **Writing Suggestions**: Repeated words, long sentences, passive voice, clichés
- **AI Personas**: 8 synthetic readers via local LLM (Ollama)
- **Multilingual**: EN, PT, ES, FR, DE

## Installation

### From Community Plugins (Recommended)
1. Open Obsidian Settings → Community Plugins
2. Disable Safe Mode
3. Click Browse and search "SmartWrite Companion"
4. Install and Enable

### Manual Installation
1. Download `main.js`, `styles.css`, `manifest.json` from latest release
2. Copy to `.obsidian/plugins/smartwrite-companion/`
3. Enable in Settings → Community Plugins

## Ollama Setup (for AI Personas)

1. Install Ollama: https://ollama.ai
2. Pull a model: `ollama pull llama3.2`
3. Configure endpoint in plugin settings (default: localhost:11434)

## Screenshots

[Add screenshots here]

## License

MIT

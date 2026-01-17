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
2. Unzip the folder.
3. Run the installer for your OS:

   **🍎 macOS**:

   ```bash
   ./scripts/installers/install_mac.sh
   ```

   **🐧 Linux**:

   ```bash
   ./scripts/installers/install_linux.sh
   ```

   **🪟 Windows (PowerShell)**:

   ```powershell
   .\scripts\installers\install_windows.ps1
   ```

   The installer will:
   - 🔍 Detect your Obsidian vaults automatically.
   - 📦 Install the plugin files to the correct folder.
   - 🤖 Check and install **Ollama** if missing (macOS/Linux) or verify installation (Windows).
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

## Development

### Automated Release Process

This project includes automated scripts for streamlined development and publishing:

```bash
# Full automated release (GitHub + Obsidian submission)
npm run publish

# Individual steps
npm run release        # GitHub release only
npm run submit-obsidian # Obsidian submission only
```

### Development Scripts

```bash
npm run dev      # Start development build with watch mode
npm run build    # Production build
npm run test     # Run tests
npm run workflow # Backup current version to docs/versions/
```

### Release Automation Features

- ✅ **Automatic Git Operations**: Commit, push, and tag releases
- ✅ **GitHub Release Creation**: With changelog extraction
- ✅ **Obsidian PR Submission**: Automated community plugin updates
- ✅ **Version Synchronization**: Keeps manifest.json and package.json in sync
- ✅ **Changelog Integration**: Extracts release notes from CHANGELOG.md

### For Contributors

The project is configured for automated workflows. Simply:

1. Make your changes
2. Update `CHANGELOG.md` with release notes
3. Update version in `manifest.json` and `package.json`
4. Run `npm run publish` for full automation

All release processes are handled automatically, including submissions to both GitHub and the Obsidian community plugin repository.

## Screenshots

## License

MIT

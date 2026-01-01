# SmartWrite Companion - VSCode Extension

A minimalist writing analytics sidebar for Visual Studio Code, providing real-time statistics, readability analysis, and AI-powered feedback.

## Overview

SmartWrite Companion is a VSCode extension that displays writing analytics in a sidebar panel. It's designed for writers, bloggers, technical writers, and anyone who wants to improve their writing with data-driven insights.

## Features

### 📊 Session Stats
- Real-time word count
- Daily goal tracking with progress bar
- Session time and writing pace (words per minute)

### 📈 Text Metrics
- Character count (with and without spaces)
- Sentence and paragraph counts
- Estimated reading time
- Unique word count

### 📚 Readability Analysis
- Multiple readability formulas:
  - Flesch Reading Ease
  - Flesch-Kincaid Grade Level
  - Gunning Fog Index
- Visual score indicators
- Secondary metrics (grade level, sentence length, etc.)

### ✍️ Writing Suggestions
- Grammar and style issues
- Severity indicators (error, warning, info)
- Click to locate issues in text
- Categorized by issue type

### 🤖 AI Persona Analysis
- Ollama-powered writing analysis
- Multiple persona types:
  - Academic Writer
  - Journalist
  - Creative Writer
  - Technical Writer
  - Business Professional
- Connection status indicator

## Installation

### From Source

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Compile the extension:
   ```bash
   npm run compile
   ```

4. Open the project in VSCode and press `F5` to launch the Extension Development Host

### From VSIX

1. Download the `.vsix` file
2. In VSCode, go to Extensions view
3. Click the `...` menu → "Install from VSIX..."
4. Select the downloaded file

## Project Structure

```
smartwrite-companion/
├── src/
│   ├── extension.ts           # Extension entry point
│   └── webview.tsx            # React webview entry point
├── components/
│   ├── SessionStats.tsx       # Session statistics module
│   ├── TextMetrics.tsx        # Text metrics module
│   ├── Readability.tsx        # Readability analysis module
│   ├── Suggestions.tsx        # Writing suggestions module
│   ├── PersonaAnalysis.tsx    # AI persona analysis module
│   └── index.ts               # Component exports
├── styles/
│   ├── globals.css            # Base styles (Obsidian theme)
│   └── vscode.css             # VSCode-specific styles
├── App.tsx                     # Main React component
├── index.ts                    # Main exports
├── webpack.config.js           # Webpack configuration
├── tsconfig.json              # TypeScript configuration
└── vscode-package.json        # VSCode extension manifest
```

## Development

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development mode with watch:
   ```bash
   npm run watch
   ```

3. Press `F5` in VSCode to launch Extension Development Host

4. Make changes to the code - the extension will automatically recompile

### Building

To create a production build:

```bash
npm run compile
```

### Packaging

To create a `.vsix` package for distribution:

```bash
npm run package
```

## Configuration

The extension can be configured via VSCode settings:

```json
{
  "smartwrite.dailyGoal": 2000,
  "smartwrite.modules.sessionStats": true,
  "smartwrite.modules.textMetrics": true,
  "smartwrite.modules.readability": true,
  "smartwrite.modules.suggestions": true,
  "smartwrite.modules.personaAnalysis": true,
  "smartwrite.readability.formula": "flesch-reading",
  "smartwrite.ollama.url": "http://localhost:11434",
  "smartwrite.ollama.model": "llama2"
}
```

### Settings Description

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `dailyGoal` | number | 2000 | Daily word count goal |
| `modules.sessionStats` | boolean | true | Show Session Stats module |
| `modules.textMetrics` | boolean | true | Show Text Metrics module |
| `modules.readability` | boolean | true | Show Readability module |
| `modules.suggestions` | boolean | true | Show Suggestions module |
| `modules.personaAnalysis` | boolean | true | Show Persona Analysis module |
| `readability.formula` | string | "flesch-reading" | Default readability formula |
| `ollama.url` | string | "http://localhost:11434" | Ollama API URL |
| `ollama.model` | string | "llama2" | Ollama model name |

## Ollama Integration

### Setup Ollama

1. Install Ollama from [ollama.ai](https://ollama.ai)

2. Pull a model:
   ```bash
   ollama pull llama2
   ```

3. Ensure Ollama is running:
   ```bash
   ollama serve
   ```

4. The extension will automatically connect to `http://localhost:11434`

### Using Persona Analysis

1. Open the SmartWrite Companion sidebar
2. Scroll to the "Persona Analysis" module
3. Select a writing persona from the dropdown
4. Click "Analyze" to get AI-powered feedback
5. Review the analysis results

## Commands

The extension provides the following commands:

| Command | Description |
|---------|-------------|
| `SmartWrite: Refresh Statistics` | Manually refresh all statistics |
| `SmartWrite: Analyze Current Document` | Run analysis on the active document |
| `SmartWrite: Toggle Module Visibility` | Open module visibility settings |

## Architecture

### Extension Host

The extension host (`src/extension.ts`) runs in the Node.js environment and:
- Registers the webview view provider
- Listens to document changes
- Calculates text statistics
- Communicates with Ollama API
- Manages VSCode settings

### Webview

The webview (`src/webview.tsx`) runs in a sandboxed browser context and:
- Renders the React UI
- Displays statistics and analysis
- Sends user actions to the extension host
- Receives updates via message passing

### Communication Flow

```
VSCode Editor → Extension Host → Webview → React Components
     ↑                              ↓
     └──────── User Actions ────────┘
```

## Styling

The extension uses CSS variables to automatically adapt to VSCode themes:

- Light themes: Uses light color scheme
- Dark themes: Uses dark color scheme
- High contrast themes: Inherits VSCode contrast colors

Key CSS variables:
- `--vscode-editor-background`
- `--vscode-sideBar-background`
- `--vscode-editor-foreground`
- `--vscode-button-background`
- `--vscode-textLink-foreground`

## Component API

### Individual Module Usage

You can use individual modules in custom layouts:

```typescript
import { SessionStats, TextMetrics } from './components';

function CustomLayout() {
  return (
    <div>
      <SessionStats />
      <TextMetrics />
    </div>
  );
}
```

### Type Exports

```typescript
import type {
  ModuleStates,
  SessionData,
  TextMetricsData,
  Suggestion,
  ReadabilityFormula,
  ReadabilityScore
} from './index';
```

## Customization

### Adding New Modules

1. Create a new component in `/components/`
2. Export it from `/components/index.ts`
3. Import and use in `App.tsx`
4. Add module visibility setting

### Modifying Styles

- Edit `/styles/vscode.css` for VSCode-specific styles
- Edit `/styles/globals.css` for base styles
- Use VSCode CSS variables for theme compatibility

### Custom Analytics

Extend `calculateStats()` in `src/extension.ts`:

```typescript
private calculateStats(text: string) {
  // Add custom metrics
  const customMetric = this.calculateCustomMetric(text);
  
  return {
    ...existingStats,
    customMetric
  };
}
```

## Troubleshooting

### Webview Not Loading

1. Check browser console: Developer Tools → Help → Toggle Developer Tools
2. Verify webpack build completed successfully
3. Check CSP (Content Security Policy) settings

### Ollama Connection Failed

1. Verify Ollama is running: `curl http://localhost:11434`
2. Check firewall settings
3. Verify model is installed: `ollama list`
4. Check extension settings for correct URL

### Stats Not Updating

1. Ensure document is saved and recognized by VSCode
2. Check console for errors
3. Try manually refreshing: `SmartWrite: Refresh Statistics`

## Performance

The extension is optimized for performance:

- Debounced text analysis on document changes
- Efficient text parsing algorithms
- Lazy loading of modules
- Minimal webview repaints
- Async Ollama API calls

## Browser Support

The webview requires a modern browser engine:
- Chromium-based (VSCode default)
- Supports ES2020+ JavaScript
- CSS Grid and Flexbox

## License

See `Attributions.md` for component licenses and credits.

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Roadmap

- [ ] Advanced grammar checking
- [ ] Custom readability formulas
- [ ] Export statistics to CSV/JSON
- [ ] Writing streak tracking
- [ ] Multi-document session tracking
- [ ] Cloud sync for statistics
- [ ] Additional AI models support
- [ ] Collaborative writing features

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review troubleshooting guide

## Version History

### 0.1.0 (Initial Release)
- Basic session statistics
- Text metrics calculation
- Readability analysis
- Writing suggestions framework
- Ollama persona analysis
- Module visibility controls
- VSCode theme integration

---

**Built with React, TypeScript, and ❤️ for writers**

# VSCode Integration Guide

## SmartWrite Companion for VSCode

This guide explains how to integrate the SmartWrite Companion components into a VSCode extension.

## File Structure

```
/
├── App.tsx                    # Main component with module visibility controls
├── index.ts                   # Main entry point with exports
├── components/
│   ├── index.ts              # Component exports
│   ├── SessionStats.tsx      # Session statistics module
│   ├── TextMetrics.tsx       # Text metrics module
│   ├── Readability.tsx       # Readability analysis module
│   ├── Suggestions.tsx       # Writing suggestions module
│   └── PersonaAnalysis.tsx   # AI persona analysis module
└── styles/
    └── globals.css           # All component styles
```

## Usage in VSCode Extension

### 1. Basic Setup

```typescript
// In your VSCode extension webview
import { SmartWriteCompanion } from './index';
import './styles/globals.css';

// Render the complete sidebar
ReactDOM.render(<SmartWriteCompanion />, document.getElementById('root'));
```

### 2. Using Individual Modules

```typescript
// Import specific modules
import { SessionStats, TextMetrics, Readability } from './components';

// Use them individually in your custom layout
function CustomSidebar() {
  return (
    <div>
      <SessionStats />
      <TextMetrics />
      <Readability />
    </div>
  );
}
```

### 3. Webview HTML Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" 
          content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource};">
    <title>SmartWrite Companion</title>
</head>
<body>
    <div id="root"></div>
    <script src="${scriptUri}"></script>
</body>
</html>
```

### 4. Extension Integration Example

```typescript
// extension.ts
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const provider = new SmartWriteViewProvider(context.extensionUri);
  
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'smartwrite-companion',
      provider
    )
  );
}

class SmartWriteViewProvider implements vscode.WebviewViewProvider {
  constructor(private readonly _extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview.js')
    );
    
    const stylesUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'dist', 'styles.css')
    );

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="${stylesUri}" rel="stylesheet">
      </head>
      <body>
        <div id="root"></div>
        <script src="${scriptUri}"></script>
      </body>
      </html>`;
  }
}
```

### 5. package.json Configuration

```json
{
  "contributes": {
    "views": {
      "explorer": [
        {
          "type": "webview",
          "id": "smartwrite-companion",
          "name": "SmartWrite Companion"
        }
      ]
    }
  }
}
```

## Styling for VSCode

The components use CSS variables that automatically adapt to VSCode's theme:

```css
/* These map to VSCode theme colors */
--background-primary: var(--vscode-editor-background);
--background-secondary: var(--vscode-sideBar-background);
--background-modifier-border: var(--vscode-panel-border);
--text-normal: var(--vscode-editor-foreground);
--text-muted: var(--vscode-descriptionForeground);
--interactive-accent: var(--vscode-button-background);
```

### Adapting Styles for VSCode

Update `/styles/globals.css` to use VSCode CSS variables:

```css
:root {
  /* VSCode theme variables */
  --background-primary: var(--vscode-editor-background, #ffffff);
  --background-secondary: var(--vscode-sideBar-background, #f5f5f5);
  --background-modifier-border: var(--vscode-panel-border, #e0e0e0);
  --text-normal: var(--vscode-editor-foreground, #1e1e1e);
  --text-muted: var(--vscode-descriptionForeground, #666666);
  --interactive-accent: var(--vscode-button-background, #7c3aed);
}
```

## Communication Between Extension and Webview

### Sending Data to Webview

```typescript
// In extension
webviewView.webview.postMessage({
  type: 'updateStats',
  data: {
    wordCount: 1247,
    sessionTime: 45,
    writingPace: 28
  }
});
```

### Receiving Data in Webview

```typescript
// In React component
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    const message = event.data;
    
    switch (message.type) {
      case 'updateStats':
        setStats(message.data);
        break;
    }
  };
  
  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);
```

### Sending Data from Webview

```typescript
// In React component
const handleAnalyze = () => {
  // VSCode API is injected into webview
  if (typeof vscode !== 'undefined') {
    vscode.postMessage({
      type: 'analyze',
      persona: selectedPersona
    });
  }
};
```

## Building for VSCode

### 1. Install Dependencies

```bash
npm install --save-dev @types/vscode webpack webpack-cli ts-loader
```

### 2. Webpack Configuration

```javascript
// webpack.config.js
const path = require('path');

module.exports = {
  entry: './src/webview.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'webview.js'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  }
};
```

## TypeScript Types

All TypeScript types are exported from `/index.ts`:

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

## Features

### Module Visibility Toggle
- Settings gear in header allows toggling module visibility
- State persists in component (can be synced to VSCode settings)

### Collapsible Modules
- Each module can be expanded/collapsed
- Arrow indicators show state

### Theme Support
- Automatically adapts to light/dark themes
- Uses CSS variables for full customization

### Ollama Integration
- Persona Analysis module supports Ollama connection status
- Can be wired to actual Ollama API in extension backend

## Next Steps

1. Build the React app with webpack
2. Copy built files to VSCode extension
3. Configure webview in package.json
4. Wire up message passing between extension and webview
5. Connect to actual text analysis logic in extension

## License

See Attributions.md for component licenses and credits.

// VSCode Extension Entry Point
// This file demonstrates how to integrate SmartWrite Companion into a VSCode extension

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('SmartWrite Companion is now active');

  // Register the webview view provider
  const provider = new SmartWriteViewProvider(context.extensionUri);
  
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      SmartWriteViewProvider.viewType,
      provider
    )
  );

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('smartwrite.refreshStats', () => {
      provider.refresh();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('smartwrite.analyzeText', () => {
      provider.analyzeCurrentDocument();
    })
  );

  // Listen to text document changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      if (event.document === vscode.window.activeTextEditor?.document) {
        provider.updateStats(event.document);
      }
    })
  );

  // Listen to active editor changes
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        provider.updateStats(editor.document);
      }
    })
  );
}

export function deactivate() {}

class SmartWriteViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'smartwrite-companion';
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'analyze':
          await this.handleAnalyzeRequest(data.persona);
          break;
        case 'locateIssue':
          await this.locateIssue(data.issue);
          break;
        case 'updateSettings':
          await this.updateSettings(data.settings);
          break;
      }
    });

    // Initialize with current document
    if (vscode.window.activeTextEditor) {
      this.updateStats(vscode.window.activeTextEditor.document);
    }
  }

  public refresh() {
    if (vscode.window.activeTextEditor) {
      this.updateStats(vscode.window.activeTextEditor.document);
    }
  }

  public analyzeCurrentDocument() {
    if (!vscode.window.activeTextEditor) {
      vscode.window.showInformationMessage('No active document to analyze');
      return;
    }

    const document = vscode.window.activeTextEditor.document;
    this.updateStats(document);
    
    // Trigger analysis in webview
    this._view?.webview.postMessage({
      type: 'triggerAnalysis'
    });
  }

  public updateStats(document: vscode.TextDocument) {
    const text = document.getText();
    const stats = this.calculateStats(text);
    
    this._view?.webview.postMessage({
      type: 'updateStats',
      data: stats
    });
  }

  private calculateStats(text: string) {
    // Basic text analysis
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0).length;
    const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed

    // Calculate writing pace (simplified - would need session tracking)
    const writingPace = 28; // Mock value

    // Get daily goal from settings
    const config = vscode.workspace.getConfiguration('smartwrite');
    const goalCount = config.get<number>('dailyGoal', 2000);

    return {
      wordCount,
      goalCount,
      sessionTime: 0, // Would need session tracking
      writingPace,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
      readingTime,
      uniqueWords
    };
  }

  private async handleAnalyzeRequest(persona: string) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const text = editor.document.getText();
    const config = vscode.workspace.getConfiguration('smartwrite');
    const ollamaUrl = config.get<string>('ollama.url', 'http://localhost:11434');
    const ollamaModel = config.get<string>('ollama.model', 'llama2');

    try {
      // Mock Ollama API call - replace with actual implementation
      const analysisResult = await this.callOllamaAPI(ollamaUrl, ollamaModel, persona, text);
      
      this._view?.webview.postMessage({
        type: 'analysisComplete',
        result: analysisResult
      });
    } catch (error) {
      this._view?.webview.postMessage({
        type: 'analysisError',
        error: 'Failed to connect to Ollama. Please check your settings.'
      });
    }
  }

  private async callOllamaAPI(url: string, model: string, persona: string, text: string): Promise<string> {
    // Mock implementation - replace with actual Ollama API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Your writing aligns well with the ${persona} style. The tone is appropriate with clear argumentation.`);
      }, 1500);
    });
  }

  private async locateIssue(issue: any) {
    // Navigate to the issue location in the document
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    // Mock implementation - would need actual position data
    vscode.window.showInformationMessage(`Located issue: ${issue.type}`);
  }

  private async updateSettings(settings: any) {
    const config = vscode.workspace.getConfiguration('smartwrite');
    
    for (const [key, value] of Object.entries(settings)) {
      await config.update(key, value, vscode.ConfigurationTarget.Global);
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview.js')
    );

    const nonce = getNonce();

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
        <title>SmartWrite Companion</title>
      </head>
      <body>
        <div id="root"></div>
        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>`;
  }
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

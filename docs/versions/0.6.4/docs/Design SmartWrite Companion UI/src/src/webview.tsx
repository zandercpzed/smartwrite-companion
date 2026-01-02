// Webview Entry Point for VSCode
// This file renders the React components inside the VSCode webview

import React from 'react';
import ReactDOM from 'react-dom/client';
import SmartWriteCompanion from '../App';
import '../styles/vscode.css';

// VSCode API type declaration
declare global {
  interface Window {
    acquireVsCodeApi: () => any;
  }
}

// Acquire VSCode API
const vscode = window.acquireVsCodeApi();

// Create root and render
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <SmartWriteCompanion />
  </React.StrictMode>
);

// Listen for messages from the extension
window.addEventListener('message', (event) => {
  const message = event.data;
  
  // Dispatch custom events that React components can listen to
  window.dispatchEvent(new CustomEvent('vscode-message', { detail: message }));
});

// Export vscode API for use in components
export { vscode };

import { BasePanel } from './BasePanel';

import SmartWriteCompanionPlugin from '../../main';

export class PersonaPanel extends BasePanel {
    private plugin: SmartWriteCompanionPlugin;

    constructor(containerEl: HTMLElement, plugin: SmartWriteCompanionPlugin) {
        super(containerEl, 'Persona Analysis');
        this.plugin = plugin;
    }

    protected async renderContent(): Promise<void> {
        if (!this.plugin) return;
        this.contentEl.empty();

        const container = this.contentEl.createDiv({ cls: 'smartwrite-persona-container' });

        // Check if Ollama is enabled
        if (!this.plugin.settings.ollamaEnabled) {
            const hint = container.createDiv({ cls: 'smartwrite-suggestion-description', attr: { style: 'margin-top: 12px; font-style: italic; opacity: 0.7;' } });
            hint.setText('Enable Ollama in settings to use AI-powered features.');
            return;
        }

        // Check connection status
        const status = this.plugin.ollamaService.getStatus();

        // If not connected, show setup guide
        if (!status.connected) {
            this.renderSetupGuide(container);
            return;
        }

        // Ollama is connected - show normal status
        const header = container.createDiv({ cls: 'smartwrite-stat-row', attr: { style: 'margin-bottom: 12px; align-items: center;' } });
        header.createSpan({ text: 'Ollama Status:', attr: { style: 'font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;' } });
        
        const statusIcon = header.createSpan({ cls: 'smartwrite-status-dot' });
        const statusText = header.createSpan({ cls: 'smartwrite-stat-mono', attr: { style: 'margin-left: 6px;' } });
        
        statusIcon.setAttr('style', 'background-color: #4caf50; width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-left: 8px;');
        statusText.setText('Connected');

        // Selected Model
        const modelInfo = container.createDiv({ cls: 'smartwrite-stat-item', attr: { style: 'margin-top: 8px;' } });
        modelInfo.createDiv({ cls: 'smartwrite-stat-label' }).setText('active model');
        modelInfo.createDiv({ cls: 'smartwrite-stat-value', attr: { style: 'font-size: 14px;' } }).setText(this.plugin.settings.ollamaModel);

        const info = container.createDiv({ cls: 'smartwrite-suggestion-description', attr: { style: 'margin-top: 12px; opacity: 0.8;' } });
        info.setText('✓ Ready to analyze with AI.');
    }

    private renderSetupGuide(container: HTMLElement): void {
        // Title
        const title = container.createEl('h3', { 
            text: '🚀 Setup Ollama', 
            attr: { style: 'margin-bottom: 16px; color: var(--text-accent);' } 
        });

        // Option selector
        const optionHeader = container.createDiv({ cls: 'smartwrite-stat-label', attr: { style: 'margin-bottom: 12px;' } });
        optionHeader.setText('Choose Installation Method:');

        // Option 1: GUI App
        const option1 = container.createDiv({ cls: 'smartwrite-stat-item', attr: { style: 'margin-bottom: 16px; padding: 12px; background: var(--background-secondary); border-radius: 6px;' } });
        option1.createEl('strong', { text: '📱 Option 1: Ollama App (Menu Bar Icon)' });
        option1.createEl('br');
        
        const step1a = option1.createDiv({ attr: { style: 'margin-top: 8px; margin-left: 12px;' } });
        step1a.createSpan({ text: '1. ', attr: { style: 'font-weight: bold;' } });
        const downloadLink = step1a.createEl('a', {
            text: 'Download Ollama',
            href: 'https://ollama.ai/download',
            attr: { style: 'color: var(--interactive-accent); text-decoration: underline;' }
        });
        downloadLink.setAttr('target', '_blank');
        
        const step2a = option1.createDiv({ attr: { style: 'margin-left: 12px;' } });
        step2a.createSpan({ text: '2. ', attr: { style: 'font-weight: bold;' } });
        step2a.appendText('Drag to Applications folder');
        
        const step3a = option1.createDiv({ attr: { style: 'margin-left: 12px;' } });
        step3a.createSpan({ text: '3. ', attr: { style: 'font-weight: bold;' } });
        step3a.appendText('Launch Ollama.app');

        // Option 2: Daemon (Recommended)
        const option2 = container.createDiv({ cls: 'smartwrite-stat-item', attr: { style: 'margin-bottom: 16px; padding: 12px; background: var(--background-secondary); border-radius: 6px; border: 2px solid var(--interactive-accent);' } });
        option2.createEl('strong', { text: '👻 Option 2: Background Service (Recommended)' });
        option2.createEl('br');
        option2.createSpan({ text: 'Completely invisible, no menu bar icon', attr: { style: 'font-size: 11px; color: var(--text-muted);' } });
        
        const brewNote = option2.createDiv({ attr: { style: 'margin-top: 8px; font-size: 12px; font-style: italic;' } });
        brewNote.setText('Requirements: Homebrew installed');
        
        const brewLink = option2.createEl('a', {
            text: 'Install Homebrew',
            href: 'https://brew.sh',
            attr: { style: 'color: var(--interactive-accent); text-decoration: underline; font-size: 11px; margin-left: 4px;' }
        });
        brewLink.setAttr('target', '_blank');

        const codeBlock = option2.createEl('pre', { 
            attr: { style: 'margin-top: 8px; padding: 8px; background: var(--background-primary); border-radius: 4px; font-size: 11px; overflow-x: auto;' }
        });
        codeBlock.createEl('code', { text: 'brew install ollama\nbrew services start ollama' });

        // Info box
        const infoBox = container.createDiv({ 
            cls: 'smartwrite-suggestion-description', 
            attr: { style: 'margin-top: 16px; padding: 12px; background: var(--background-secondary); border-radius: 6px; border-left: 3px solid var(--text-accent);' } 
        });
        infoBox.createEl('strong', { text: '💡 100% Local & Free' });
        infoBox.createEl('br');
        infoBox.appendText('No internet required after setup. No subscriptions. Complete privacy.');
        infoBox.createEl('br');
        infoBox.appendText('Once running, this plugin auto-downloads the AI model.');

        // Retry button
        const retryButton = container.createEl('button', {
            text: 'Check Connection',
            cls: 'mod-cta',
            attr: { style: 'margin-top: 16px; width: 100%;' }
        });
        
        retryButton.addEventListener('click', async () => {
            retryButton.setText('Checking...');
            retryButton.disabled = true;
            
            const connected = await this.plugin.ollamaService.checkConnection();
            
            if (connected) {
                await this.renderContent();
            } else {
                retryButton.setText('Check Connection');
                retryButton.disabled = false;
            }
        });
    }

    public update(data: any): void {
        this.renderContent();
    }

    public updateInstallProgress(progress: { status: string; percent?: number }): void {
        // Clear and show progress
        this.contentEl.empty();
        const container = this.contentEl.createDiv({ cls: 'smartwrite-persona-container' });
        
        const title = container.createEl('h3', { text: 'Installing Model', attr: { style: 'margin-bottom: 12px;' } });
        
        const statusText = container.createDiv({ 
            cls: 'smartwrite-stat-label', 
            text: progress.status || 'Downloading...',
            attr: { style: 'margin-bottom: 8px;' }
        });
        
        if (progress.percent !== undefined) {
            const progressBar = container.createDiv({ cls: 'smartwrite-progress-bar' });
            const progressFill = progressBar.createDiv({ cls: 'smartwrite-progress-fill' });
            progressFill.style.width = `${progress.percent}%`;
            
            const percentText = container.createDiv({ 
                cls: 'smartwrite-stat-mono', 
                text: `${progress.percent}%`,
                attr: { style: 'margin-top: 4px; text-align: center;' }
            });
        }
    }
}
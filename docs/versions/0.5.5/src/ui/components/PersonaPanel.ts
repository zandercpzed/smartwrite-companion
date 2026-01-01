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

        // Visual step-by-step guide
        const step1 = container.createDiv({ cls: 'smartwrite-stat-item', attr: { style: 'margin-bottom: 12px;' } });
        step1.createDiv({ cls: 'smartwrite-stat-label' }).setText('Step 1: Download');
        const downloadLink = step1.createEl('a', {
            text: 'Download Ollama for Mac',
            href: 'https://ollama.ai/download',
            attr: { style: 'color: var(--interactive-accent); text-decoration: underline;' }
        });
        downloadLink.setAttr('target', '_blank');

        const step2 = container.createDiv({ cls: 'smartwrite-stat-item', attr: { style: 'margin-bottom: 12px;' } });
        step2.createDiv({ cls: 'smartwrite-stat-label' }).setText('Step 2: Install');
        step2.createDiv({ cls: 'smartwrite-suggestion-description', attr: { style: 'font-size: 12px;' } })
            .setText('Open the downloaded file and drag Ollama to Applications');

        const step3 = container.createDiv({ cls: 'smartwrite-stat-item', attr: { style: 'margin-bottom: 12px;' } });
        step3.createDiv({ cls: 'smartwrite-stat-label' }).setText('Step 3: Launch');
        step3.createDiv({ cls: 'smartwrite-suggestion-description', attr: { style: 'font-size: 12px;' } })
            .setText('Open Ollama.app from Applications folder');

        // Info box
        const infoBox = container.createDiv({ 
            cls: 'smartwrite-suggestion-description', 
            attr: { style: 'margin-top: 16px; padding: 12px; background: var(--background-secondary); border-radius: 6px; border-left: 3px solid var(--interactive-accent);' } 
        });
        infoBox.createEl('strong', { text: '💡 No Terminal Required!' });
        infoBox.createEl('br');
        infoBox.appendText('Once Ollama is running, this plugin will automatically download and configure the AI model.');

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
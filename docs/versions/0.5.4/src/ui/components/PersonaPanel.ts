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

        // Ollama Status Header
        const header = container.createDiv({ cls: 'smartwrite-stat-row', attr: { style: 'margin-bottom: 12px; align-items: center;' } });
        header.createSpan({ text: 'Ollama Status:', attr: { style: 'font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;' } });
        
        const statusIcon = header.createSpan({ cls: 'smartwrite-status-dot' });
        const statusText = header.createSpan({ cls: 'smartwrite-stat-mono', attr: { style: 'margin-left: 6px;' } });

        if (!this.plugin.settings.ollamaEnabled) {
            statusIcon.setAttr('style', 'background-color: var(--text-muted); width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-left: 8px;');
            statusText.setText('Disabled');
        } else {
            const status = this.plugin.ollamaService.getStatus();
            statusIcon.setAttr('style', `background-color: ${status.connected ? '#4caf50' : '#f44336'}; width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-left: 8px;`);
            statusText.setText(status.connected ? 'Connected' : 'Disconnected');
        }

        // Selected Model
        if (this.plugin.settings.ollamaEnabled) {
            const modelInfo = container.createDiv({ cls: 'smartwrite-stat-item', attr: { style: 'margin-top: 8px;' } });
            modelInfo.createDiv({ cls: 'smartwrite-stat-label' }).setText('active model');
            modelInfo.createDiv({ cls: 'smartwrite-stat-value', attr: { style: 'font-size: 14px;' } }).setText(this.plugin.settings.ollamaModel);
        }

        // Status messages and retry button
        if (!this.plugin.settings.ollamaEnabled) {
             const hint = container.createDiv({ cls: 'smartwrite-suggestion-description', attr: { style: 'margin-top: 12px; font-style: italic; opacity: 0.7;' } });
             hint.setText('Enable Ollama in settings to use Synthetic Readers.');
        } else {
            const status = this.plugin.ollamaService.getStatus();
            
            if (!status.connected) {
                const warning = container.createDiv({ cls: 'smartwrite-suggestion-description', attr: { style: 'margin-top: 12px; opacity: 0.8; color: var(--text-error);' } });
                warning.setText('⚠️ Ollama is not running. Start Ollama and click "Retry Connection".');
                
                // Retry button
                const retryButton = container.createEl('button', {
                    text: 'Retry Connection',
                    cls: 'mod-cta',
                    attr: { style: 'margin-top: 8px;' }
                });
                
                retryButton.addEventListener('click', async () => {
                    retryButton.setText('Connecting...');
                    retryButton.disabled = true;
                    
                    const connected = await this.plugin.ollamaService.checkConnection();
                    
                    if (connected) {
                        await this.renderContent();
                    } else {
                        retryButton.setText('Retry Connection');
                        retryButton.disabled = false;
                    }
                });
            } else {
                const info = container.createDiv({ cls: 'smartwrite-suggestion-description', attr: { style: 'margin-top: 12px; opacity: 0.8;' } });
                info.setText('✓ Ready to analyze with Synthetic Readers.');
            }
        }
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
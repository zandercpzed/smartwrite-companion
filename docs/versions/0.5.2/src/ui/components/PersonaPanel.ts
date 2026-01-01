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
            const isConnected = await this.plugin.ollamaService.checkConnection();
            statusIcon.setAttr('style', `background-color: ${isConnected ? '#4caf50' : '#f44336'}; width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-left: 8px;`);
            statusText.setText(isConnected ? 'Connected' : 'Disconnected');
        }

        // Selected Model
        if (this.plugin.settings.ollamaEnabled) {
            const modelInfo = container.createDiv({ cls: 'smartwrite-stat-item', attr: { style: 'margin-top: 8px;' } });
            modelInfo.createDiv({ cls: 'smartwrite-stat-label' }).setText('active model');
            modelInfo.createDiv({ cls: 'smartwrite-stat-value', attr: { style: 'font-size: 14px;' } }).setText(this.plugin.settings.ollamaModel);
        }

        if (!this.plugin.settings.ollamaEnabled) {
             const hint = container.createDiv({ cls: 'smartwrite-suggestion-description', attr: { style: 'margin-top: 12px; font-style: italic; opacity: 0.7;' } });
             hint.setText('Enable Ollama in settings to use Synthetic Readers.');
        } else {
             const info = container.createDiv({ cls: 'smartwrite-suggestion-description', attr: { style: 'margin-top: 12px; opacity: 0.8;' } });
             info.setText('Synthetic Readers will provide feedback based on your active persona.');
        }
    }

    public update(data: any): void {
        this.renderContent();
    }
}
import { BasePanel } from './BasePanel';

import SmartWriteCompanionPlugin from '../../main';

export class PersonaPanel extends BasePanel {
    private plugin: SmartWriteCompanionPlugin;

    constructor(containerEl: HTMLElement, plugin: SmartWriteCompanionPlugin) {
        super(containerEl, 'Persona Analysis');
        this.plugin = plugin;
    }

    protected renderContent(): void {
        if (!this.plugin) return;
        this.contentEl.empty();
        this.contentEl.setText('Persona analysis coming soon...');
    }

    public update(data: any): void {
        this.renderContent();
    }
}
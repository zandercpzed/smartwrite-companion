import { App, Modal, Setting } from 'obsidian';

export class QueueAnalysisModal extends Modal {
    private onConfirm: () => void;
    private personaName: string;

    constructor(app: App, personaName: string, onConfirm: () => void) {
        super(app);
        this.personaName = personaName;
        this.onConfirm = onConfirm;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        contentEl.createEl('h3', { text: 'Analysis in Progress' });
        contentEl.createEl('p', { 
            text: `An analysis is already running. Would you like to queue the analysis for "${this.personaName}"? It will start automatically once the current process finishes.` 
        });

        new Setting(contentEl)
            .addButton(btn => btn
                .setButtonText('Queue Analysis')
                .setCta()
                .onClick(() => {
                    this.onConfirm();
                    this.close();
                }))
            .addButton(btn => btn
                .setButtonText('Cancel')
                .onClick(() => this.close()));
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

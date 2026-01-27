import { App, Modal } from 'obsidian';

export class HelpModal extends Modal {
    private title: string;
    private content: string | HTMLElement;

    constructor(app: App, title: string, content: string | HTMLElement) {
        super(app);
        this.title = title;
        this.content = content;
    }

    onOpen() {
        const { contentEl, titleEl } = this;
        titleEl.setText(this.title);
        contentEl.empty();
        
        const container = contentEl.createDiv({ cls: 'smartwrite-help-modal-content' });
        
        if (typeof this.content === 'string') {
            container.createEl('p', { text: this.content });
        } else {
            container.appendChild(this.content);
        }

        const buttonContainer = contentEl.createDiv({ cls: 'smartwrite-modal-buttons smartwrite-mt-20' });
        const closeBtn = buttonContainer.createEl('button', { text: 'Close', cls: 'mod-cta' });
        closeBtn.addEventListener('click', () => this.close());
    }

    onClose() {
        this.contentEl.empty();
    }
}

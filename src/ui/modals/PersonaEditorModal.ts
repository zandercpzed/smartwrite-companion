import { App, Modal, Setting, Notice } from 'obsidian';
import { Persona } from '../../types';

export class PersonaEditorModal extends Modal {
    private persona: Persona;
    private onSubmit: (persona: Persona) => void;
    private isNew: boolean;

    constructor(app: App, persona: Persona | null, onSubmit: (persona: Persona) => void) {
        super(app);
        this.onSubmit = onSubmit;
        this.isNew = !persona;
        
        this.persona = persona || {
            id: `custom-${Date.now()}`,
            name: '',
            description: '',
            systemPrompt: '',
            icon: '👤'
        };
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        
        contentEl.createEl('h2', { text: this.isNew ? 'Create new persona' : 'Edit persona' });

        new Setting(contentEl)
            .setName('Name')
            .setDesc('A friendly name for this persona')
            .addText(text => text
                .setPlaceholder('e.g. Pirate Editor')
                .setValue(this.persona.name)
                .onChange(value => this.persona.name = value));

        new Setting(contentEl)
            .setName('Icon')
            .setDesc('Emoji or single character icon')
            .addText(text => text
                .setPlaceholder('🏴‍☠️')
                .setValue(this.persona.icon)
                .onChange(value => this.persona.icon = value));

        new Setting(contentEl)
            .setName('Description')
            .setDesc('Briefly explains what this persona does')
            .addText(text => text
                .setPlaceholder('Analyzes text as if it were a pirate...')
                .setValue(this.persona.description)
                .onChange(value => this.persona.description = value));

        new Setting(contentEl)
            .setName('System prompt')
            .setDesc('The core instructions for the AI behavior')
            .addTextArea(text => text
                .setPlaceholder('You are a professional editor but you speak exclusively in pirate slang...')
                .setValue(this.persona.systemPrompt)
                .onChange(value => this.persona.systemPrompt = value)
                .inputEl.rows = 6);

        new Setting(contentEl)
            .addButton(btn => btn
                .setButtonText('Save')
                .setCta()
                .onClick(() => {
                    if (!this.persona.name || !this.persona.systemPrompt) {
                        new Notice('Name and system prompt are required.');
                        return;
                    }
                    this.onSubmit(this.persona);
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

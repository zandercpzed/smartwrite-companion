/* eslint-disable @typescript-eslint/no-misused-promises */
import { App, PluginSettingTab, Setting, Modal, Notice, setIcon } from 'obsidian';
import SmartWriteCompanionPlugin from './main';

import { Persona } from './types';
import { PersonaEditorModal } from './ui/modals/PersonaEditorModal';

export interface SmartWriteSettings {
    dailyGoal: number;
    readingSpeed: number;
    showSessionStats: boolean;
    showTextMetrics: boolean;
    showSuggestions: boolean;
    showReadability: boolean;
    showPersona: boolean;
    preferredReadabilityFormula: string;
    // Ollama Settings
    ollamaEndpoint: string;
    ollamaModel: string;
    ollamaEnabled: boolean;
    selectedPersona: string;
    customPersonas: Persona[];
    // Longform Settings (Phase 3+)
    longformEnabled: boolean;
    longformProjectPath: string;
    outputLanguage: string;
    enabledPersonas: string[];
    // Background Analysis
    backgroundAnalysisEnabled: boolean;
    backgroundAnalysisThreshold: number;
}

export const DEFAULT_SETTINGS: SmartWriteSettings = {
    dailyGoal: 1000,
    readingSpeed: 200,
    showSessionStats: true,
    showTextMetrics: true,
    showSuggestions: true,
    showReadability: true,
    showPersona: true,
    preferredReadabilityFormula: 'fleschReadingEase',
    // Ollama Defaults
    ollamaEndpoint: 'http://localhost:11434',
    ollamaModel: 'qwen2.5:0.5b',
    ollamaEnabled: false,
    selectedPersona: 'critical-editor',
    customPersonas: [],
    longformEnabled: false,
    longformProjectPath: '',
    outputLanguage: 'auto',
    enabledPersonas: [
        'critical-editor', 'common-reader', 'technical-reviewer', 
        'devils-advocate', 'booktuber', 'fandom', 'avid-reader',
        'seo-specialist', 'copywriter', 'social-media', 'peer-reviewer',
        'grant-reviewer', 'docs-engineer', 'screenwriter', 'sensitivity-reader',
        'world-builder', 'childrens-editor', 'translator', 'speechwriter', 'ghostwriter'
    ],
    backgroundAnalysisEnabled: false, // Disabled by default for performance
    backgroundAnalysisThreshold: 100 // Words
};

export class SmartWriteSettingTab extends PluginSettingTab {
    plugin: SmartWriteCompanionPlugin;

    constructor(app: App, plugin: SmartWriteCompanionPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        // General settings


        new Setting(containerEl)
            .setName('Daily word goal')
            .setDesc('Set your daily writing goal in words.')
            .addText(text => text
                .setPlaceholder('1000')
                .setValue(this.plugin.settings.dailyGoal.toString())
                .onChange(async (value) => {
                    const numValue = parseInt(value);
                    if (!isNaN(numValue) && numValue > 0) {
                        this.plugin.settings.dailyGoal = numValue;
                        await this.plugin.saveSettings();
                    }
                }));

        new Setting(containerEl)
            .setName('Reading speed')
            .setDesc('Words per minute for reading time calculations.')
            .addText(text => text
                .setPlaceholder('200')
                .setValue(this.plugin.settings.readingSpeed.toString())
                .onChange(async (value) => {
                    const numValue = parseInt(value);
                    if (!isNaN(numValue) && numValue > 0) {
                        this.plugin.settings.readingSpeed = numValue;
                        await this.plugin.saveSettings();
                    }
                }));

        new Setting(containerEl).setName('LLM integration').setHeading();

        new Setting(containerEl)
            .setName('Enable LLM integration')
            .setDesc('Enable local LLM integration for personas and smart suggestions.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.ollamaEnabled)
                .onChange(async (value) => {
                    this.plugin.settings.ollamaEnabled = value;
                    await this.plugin.saveSettings();
                    this.display(); // Reload to show/hide options
                }));

        if (this.plugin.settings.ollamaEnabled) {
            new Setting(containerEl)
                .setName('LLM endpoint')
                .setDesc('The URL of your local LLM server.')
                .addText(text => text
                    .setPlaceholder('http://localhost:11434')
                    .setValue(this.plugin.settings.ollamaEndpoint)
                    .onChange(async (value) => {
                        this.plugin.settings.ollamaEndpoint = value;
                        await this.plugin.saveSettings();
                    }));

            // Model Management Section
            new Setting(containerEl).setName('Manage models').setHeading();
            
            const modelsContainer = containerEl.createDiv({ cls: 'smartwrite-models-container' });
            void this.renderModelsSection(modelsContainer);
        }


        new Setting(containerEl)
            .setName('Output language')
            .setDesc('Default language for AI responses. "Auto" matches the input text language.')
            .addDropdown(dropdown => dropdown
                .addOption('auto', 'Auto (match input)')
                .addOption('pt-br', 'Portuguese (BR)')
                .addOption('en-us', 'English (US)')
                .addOption('es', 'Spanish')
                .addOption('fr', 'French')
                .addOption('de', 'German')
                .setValue(this.plugin.settings.outputLanguage)
                .onChange(async (value) => {
                    this.plugin.settings.outputLanguage = value;
                    await this.plugin.saveSettings();
                }));

        // --- Background Analysis ---
        new Setting(containerEl).setName('Automatic analysis').setHeading();

        new Setting(containerEl)
            .setName('Enable background analysis')
            .setDesc('Analyze your text automatically while you write (requires Ollama).')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.backgroundAnalysisEnabled)
                .onChange(async (value) => {
                    this.plugin.settings.backgroundAnalysisEnabled = value;
                    await this.plugin.saveSettings();
                    this.display();
                }));

        if (this.plugin.settings.backgroundAnalysisEnabled) {
            new Setting(containerEl)
                .setName('Analysis interval (words)')
                .setDesc('Trigger analysis after writing this many words.')
                .addSlider(slider => slider
                    .setLimits(50, 500, 50)
                    .setValue(this.plugin.settings.backgroundAnalysisThreshold)
                    .setDynamicTooltip()
                    .onChange(async (value) => {
                        this.plugin.settings.backgroundAnalysisThreshold = value;
                        await this.plugin.saveSettings();
                    }));
        }

        // Longform Integration Section
        new Setting(containerEl).setName('Longform integration').setHeading();

        new Setting(containerEl)
            .setName('Enable longform integration')
            .setDesc('Allow analysis of full longform projects.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.longformEnabled)
                .onChange(async (value) => {
                    this.plugin.settings.longformEnabled = value;
                    await this.plugin.saveSettings();
                    this.display(); // Reload to show/hide options
                }));

        if (this.plugin.settings.longformEnabled) {
             const projects = this.plugin.longformService.getProjects();
             
             new Setting(containerEl)
                .setName('Active longform project')
                .setDesc('Select the project for analysis when "Longform project" is chosen in the panel.')
                .addDropdown(dropdown => {
                    // Default / None option
                    dropdown.addOption('', 'Select a project...');
                    
                    projects.forEach(p => {
                        dropdown.addOption(p.path, p.name);
                    });

                    dropdown.setValue(this.plugin.settings.longformProjectPath);
                    dropdown.onChange(async (value) => {
                        this.plugin.settings.longformProjectPath = value;
                        await this.plugin.saveSettings();
                    });
                });
        }

        // Custom Personas Section
        new Setting(containerEl).setName('User personas').setHeading();
        const personasContainer = containerEl.createDiv({ cls: 'smartwrite-custom-personas-container' });
        this.renderCustomPersonasSection(personasContainer);

        // Enabled Personas Section
        new Setting(containerEl).setName('Available personas (Sidebar)').setHeading();
        const enabledPersonasContainer = containerEl.createDiv({ cls: 'smartwrite-enabled-personas-container' });
        this.renderEnabledPersonasSection(enabledPersonasContainer);
    }

    renderEnabledPersonasSection(container: HTMLElement): void {
        container.empty();
        
        container.createDiv({ 
            cls: 'smartwrite-suggestion-description smartwrite-mb-12',
            text: 'Choose which personas appear in the sidebar dropdown. Enabled personas will also be used in the "Analyze with ALL" feature.'
        });

        const personas = this.plugin.personaManager.listAllPersonas();
        const listContainer = container.createDiv({ cls: 'smartwrite-persona-selection-list' });

        personas.forEach(persona => {
            const row = listContainer.createDiv({ cls: 'smartwrite-persona-selection-row-full' });
            
            const left = row.createDiv({ cls: 'smartwrite-persona-selection-left' });
            const checkbox = left.createEl('input', { type: 'checkbox' });
            checkbox.checked = this.plugin.settings.enabledPersonas.includes(persona.id);
            
            checkbox.addEventListener('change', async () => {
                if (checkbox.checked) {
                    if (!this.plugin.settings.enabledPersonas.includes(persona.id)) {
                        this.plugin.settings.enabledPersonas.push(persona.id);
                    }
                } else {
                    this.plugin.settings.enabledPersonas = this.plugin.settings.enabledPersonas.filter(id => id !== persona.id);
                }
                await this.plugin.saveSettings();
            });

            const right = row.createDiv({ cls: 'smartwrite-persona-selection-info' });
            const titleRow = right.createDiv({ cls: 'smartwrite-persona-selection-title' });
            titleRow.createSpan({ text: `${persona.icon} ${persona.name}`, cls: 'smartwrite-fw-bold' });
            
            right.createDiv({ text: persona.description, cls: 'smartwrite-persona-selection-desc' });
        });
    }

    renderCustomPersonasSection(container: HTMLElement): void {
        container.empty();

        const addSetting = new Setting(container)
            .setName('Create new persona')
            .setDesc('Define a custom persona for your writing analysis.')
            .addButton(btn => btn
                .setButtonText('Add persona')
                .setCta()
                .onClick(() => {
                    new PersonaEditorModal(this.app, null, async (persona) => {
                        this.plugin.settings.customPersonas.push(persona);
                        await this.plugin.saveSettings();
                        this.plugin.personaManager.reloadPersonas();
                        this.renderCustomPersonasSection(container);
                    }).open();
                }));

        if (this.plugin.settings.customPersonas.length === 0) {
            container.createDiv({ 
                cls: 'smartwrite-suggestion-description smartwrite-mt-12-italic-o7',
                text: 'You haven\'t created any custom personas yet.'
            });
            return;
        }

        const listDiv = container.createDiv({ cls: 'smartwrite-custom-personas-list' });

        this.plugin.settings.customPersonas.forEach((persona, index) => {
            const personaRow = listDiv.createDiv({ cls: 'smartwrite-model-row' });
            
            const info = personaRow.createDiv({ cls: 'model-info smartwrite-flex-1' });
            info.createDiv({ cls: 'model-name smartwrite-fw-bold' }).setText(`${persona.icon} ${persona.name}`);
            info.createDiv({ cls: 'model-meta' }).setText(persona.description);

            const actions = personaRow.createDiv({ cls: 'model-actions' });
            
            // Edit
            const editBtn = actions.createEl('button', { cls: 'clickable-icon' });
            setIcon(editBtn, 'pencil');
            editBtn.addEventListener('click', () => {
                new PersonaEditorModal(this.app, persona, async (updatedPersona) => {
                    this.plugin.settings.customPersonas[index] = updatedPersona;
                    await this.plugin.saveSettings();
                    this.plugin.personaManager.reloadPersonas();
                    this.renderCustomPersonasSection(container);
                }).open();
            });

            // Delete
            const deleteBtn = actions.createEl('button', { cls: 'clickable-icon destructive' });
            setIcon(deleteBtn, 'trash');
            deleteBtn.addEventListener('click', () => {
                new ConfirmationModal(this.app, `Remove persona "${persona.name}"?`, async () => {
                    this.plugin.settings.customPersonas.splice(index, 1);
                    await this.plugin.saveSettings();
                    this.plugin.personaManager.reloadPersonas();
                    this.renderCustomPersonasSection(container);
                }).open();
            });
        });
    }

    async renderModelsSection(container: HTMLElement): Promise<void> {
        container.empty();
        
        // Recommended Models List
        const RECOMMENDED_MODELS = [
            { id: 'qwen2.5:0.5b', name: 'Qwen 2.5 (0.5B)', size: '~380MB', desc: 'Ultra-lightweight, fast. Good for basic tasks.' },
            { id: 'qwen2.5:1.5b', name: 'Qwen 2.5 (1.5B)', size: '~900MB', desc: 'Balanced performance and speed.' },
            { id: 'llama3.2:1b', name: 'Llama 3.2 (1B)', size: '~1.3GB', desc: "Meta's lightweight model. Reliable." },
            { id: 'llama3.2:3b', name: 'Llama 3.2 (3B)', size: '~2.0GB', desc: 'Higher quality reasoning. Requires more RAM.' },
            { id: 'gemma2:2b', name: 'Gemma 2 (2B)', size: '~1.6GB', desc: "Google's lightweight open model." }
        ];

        // Check connection and installed models
        const isConnected = await this.plugin.ollamaService.checkConnection();
        
        if (!isConnected) {
            const errorDiv = container.createDiv({ cls: 'smartwrite-setting-error smartwrite-error-box' });
            errorDiv.setText('⚠️ Ollama is not connected. Please start Ollama to manage your models.');
            return;
        }

        const installedModels = await this.plugin.ollamaService.listModels();
        const installedNames = new Set(installedModels.map(m => m.name));

        // Render each recommended model
        for (const model of RECOMMENDED_MODELS) {
            const isInstalled = installedNames.has(model.id) || installedNames.has(`${model.id}:latest`);
            const isSelected = this.plugin.settings.ollamaModel === model.id;

            const modelRow = container.createDiv({ cls: 'smartwrite-model-row smartwrite-model-item' });
            // Classes added to styles.css for this row

            // Model Info
            const infoDiv = modelRow.createDiv({ cls: 'model-info smartwrite-flex-1' });
            const nameEl = infoDiv.createDiv({ cls: 'model-name smartwrite-fw-bold smartwrite-f13' });
            nameEl.setText(model.name);
            if (isSelected) {
                nameEl.createSpan({ text: ' (active)', cls: 'smartwrite-model-active-badge' });
            }
            
            infoDiv.createDiv({ cls: 'model-meta smartwrite-model-info-meta' })
                .setText(`${model.id} • ${model.size} • ${model.desc}`);

            // Actions
            const actionsDiv = modelRow.createDiv({ cls: 'model-actions smartwrite-model-row-actions' });

            if (isInstalled) {
                // Select Button (if not already selected)
                if (!isSelected) {
                    const selectBtn = actionsDiv.createEl('button', { text: 'Select' });
                    selectBtn.addEventListener('click', () => {
                        this.plugin.settings.ollamaModel = model.id;
                        void this.plugin.saveSettings();
                        new Notice(`Selected model: ${model.name}`);
                        void this.renderModelsSection(container); // Refresh
                    });
                }

                // Delete Button (Trash Icon)
                const deleteBtn = actionsDiv.createEl('button', { cls: 'clickable-icon destructive smartwrite-model-delete-btn' });
                setIcon(deleteBtn, 'trash');
                deleteBtn.setAttribute('aria-label', 'Uninstall model');
                
                deleteBtn.addEventListener('click', () => {
                    new ConfirmationModal(this.app, `Are you sure you want to uninstall ${model.name}?`, async () => {
                        new Notice(`Uninstalling ${model.name}...`);
                        const success = await this.plugin.ollamaService.deleteModel(model.id);
                        if (success) {
                            new Notice(`${model.name} uninstalled.`);
                            // If deleted model was active, reset to default or empty
                            if (isSelected) {
                                this.plugin.settings.ollamaModel = '';
                                await this.plugin.saveSettings();
                            }
                            await this.renderModelsSection(container); // Refresh
                        } else {
                            new Notice('Failed to uninstall model.');
                        }
                    }).open();
                });

            } else {
                // Install Button
                const installBtn = actionsDiv.createEl('button', { text: 'Install', cls: 'mod-cta' });
                installBtn.addEventListener('click', async () => {
                    installBtn.setText('Installing...');
                    installBtn.disabled = true;
                    new Notice(`Installing ${model.name}. This may take a while...`);

                    const success = await this.plugin.ollamaService.pullModel(model.id, (progress) => {
                        if (progress.status === 'downloading' && progress.percent) {
                            installBtn.setText(`${progress.percent}%`);
                        } else {
                            installBtn.setText(progress.status);
                        }
                    });

                    if (success) {
                        new Notice(`${model.name} installed successfully!`);
                        // Auto-select if no model selected
                        if (!this.plugin.settings.ollamaModel) {
                            this.plugin.settings.ollamaModel = model.id;
                            await this.plugin.saveSettings();
                        }
                        this.renderModelsSection(container); // Refresh
                    } else {
                        new Notice('Installation failed. Check console for details.');
                        installBtn.setText('Install');
                        installBtn.disabled = false;
                    }
                });
            }
        }
    }
}

class ConfirmationModal extends Modal {
    private onConfirm: () => void;
    private message: string;

    constructor(app: App, message: string, onConfirm: () => void) {
        super(app);
        this.message = message;
        this.onConfirm = onConfirm;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.createEl('div', { text: 'Confirm action', cls: 'modal-title' });
        contentEl.createEl('p', { text: this.message });

        const buttonContainer = contentEl.createDiv({ cls: 'smartwrite-modal-buttons smartwrite-mt-20' });
        
        const confirmBtn = buttonContainer.createEl('button', { text: 'Confirm', cls: 'mod-cta' });
        confirmBtn.addEventListener('click', () => {
            this.onConfirm();
            this.close();
        });

        const cancelBtn = buttonContainer.createEl('button', { text: 'Cancel' });
        cancelBtn.addEventListener('click', () => {
            this.close();
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
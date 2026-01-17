import { App, PluginSettingTab, Setting, Modal, Notice, setIcon } from 'obsidian';
import SmartWriteCompanionPlugin from './main';

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
    // Longform Settings (Phase 3+)
    longformEnabled: boolean;
    longformProjectPath: string;
    outputLanguage: string;
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
    longformEnabled: false,
    longformProjectPath: '',
    outputLanguage: 'auto'
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

        new Setting(containerEl).setName('General').setHeading();

        new Setting(containerEl)
            .setName('Daily word goal')
            .setDesc('Set your daily writing goal in words')
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
            .setDesc('Words per minute for reading time calculations')
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
            .setName('Enable LLM')
            .setDesc('Enable local LLM integration for personas and smart suggestions')
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
                .setDesc('The URL of your local LLM server')
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
            .setDesc('Default language for AI responses (auto matches input text)')
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

        // Longform Integration Section
        new Setting(containerEl).setName('Longform integration').setHeading();

        new Setting(containerEl)
            .setName('Enable longform integration')
            .setDesc('Allow analysis of full longform projects')
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
                .setDesc('Select the project to be analyzed when "Longform project" is selected in the panel.')
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
            errorDiv.setText('⚠️ Ollama is not connected. Please start Ollama to manage models.');
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
                    selectBtn.addEventListener('click', async () => {
                        this.plugin.settings.ollamaModel = model.id;
                        await this.plugin.saveSettings();
                        new Notice(`Selected model: ${model.name}`);
                        this.renderModelsSection(container); // Refresh
                    });
                }

                // Delete Button (Trash Icon)
                const deleteBtn = actionsDiv.createEl('button', { cls: 'clickable-icon destructive smartwrite-model-delete-btn' });
                setIcon(deleteBtn, 'trash');
                deleteBtn.setAttribute('aria-label', 'Uninstall Model');
                
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
        contentEl.createEl('h2', { text: 'Confirm action' });
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
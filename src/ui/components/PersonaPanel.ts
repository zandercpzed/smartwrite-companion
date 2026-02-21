/* eslint-disable @typescript-eslint/no-misused-promises */
import { BasePanel } from './BasePanel';
import { MarkdownView, Notice } from 'obsidian';

import SmartWriteCompanionPlugin from '../../main';
import { PersonaAnalysisResult, Persona } from '../../types';
import { HelpModal } from '../modals/HelpModal';
import { QueueAnalysisModal } from '../modals/QueueAnalysisModal';
import { FolderSelectionModal } from '../modals/FolderSelectionModal';
import { setIcon, TFolder } from 'obsidian';

export class PersonaPanel extends BasePanel {
    private plugin: SmartWriteCompanionPlugin;

    constructor(containerEl: HTMLElement, plugin: SmartWriteCompanionPlugin) {
        super(containerEl, 'Persona analysis');
        this.plugin = plugin;
        
        // Add help icon next to panel title (header)
        const header = containerEl.querySelector('.smartwrite-panel-header');
        if (header) {
            this.addHelpIconToHeader(header as HTMLElement);
        }
    }

    private addHelpIconToHeader(header: HTMLElement): void {
        const helpIcon = header.createSpan({ cls: 'smartwrite-help-icon-inline' });
        setIcon(helpIcon, 'help-circle');
        helpIcon.addEventListener('click', (e) => {
            e.stopPropagation(); // Don't collapse panel
            this.showMainHelp();
        });
    }

    private addHelpIconToLabel(labelContainer: HTMLElement, onClick: () => void): void {
        const helpIcon = labelContainer.createSpan({ cls: 'smartwrite-help-icon-small' });
        setIcon(helpIcon, 'help-circle');
        helpIcon.addEventListener('click', (e) => {
            e.preventDefault();
            onClick();
        });
    }

    private showMainHelp(): void {
        const content = document.createElement('div');
        content.createEl('p', { text: 'In this section, you can configure how the AI analyzes your text:' });
        const list = content.createEl('ul');
        list.createEl('li', { text: 'Mode: Choose between critical analysis (Personas) or Translation.' });
        list.createEl('li', { text: 'Analysis Target: Analyze the current file or a complete Longform project.' });
        list.createEl('li', { text: 'Select Persona: Choose the "personality" of the reviewer.' });
        list.createEl('li', { text: 'Response Language: The language the AI will use for its feedback.' });
        
        new HelpModal(this.plugin.app, 'Persona Analysis - Help', content).open();
    }

    protected renderContent(): void {
        if (!this.plugin) return;
        this.contentEl.empty();

        const container = this.contentEl.createDiv({ cls: 'smartwrite-persona-container' });

        // Check if Ollama is enabled
        if (!this.plugin.settings.ollamaEnabled) {
            const hint = container.createDiv({ cls: 'smartwrite-suggestion-description smartwrite-mt-12-italic-o7' });
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

        // Ollama is connected - show analysis interface
        this.renderAnalysisInterface(container);
    }

    private renderAnalysisInterface(container: HTMLElement): void {
        // Mode Selector (Analyze vs Translate)
        const modeContainer = container.createDiv({ cls: 'smartwrite-control-group smartwrite-mb-15' });
        const modeLabel = modeContainer.createEl('label', { text: 'Mode ' });
        this.addHelpIconToLabel(modeLabel, () => {
            new HelpModal(this.plugin.app, 'Mode', 'Choose "Analyze" to receive critical feedback from specific personas, or "Translate" to convert your text to another language while preserving its original meaning.').open();
        });
        
        const modeSelect = modeContainer.createEl('select', { cls: 'dropdown smartwrite-w100' });
        modeSelect.createEl('option', { value: 'analyze', text: '🧐 Analyze (personas)' });
        modeSelect.createEl('option', { value: 'translate', text: '🌍 Translate' });

        // 1. Target Selector (Current File vs Configured Longform Project)
        const targetSection = container.createDiv({ cls: 'smartwrite-stat-item smartwrite-mb-12' });
        const targetLabel = targetSection.createDiv({ cls: 'smartwrite-stat-label' });
        targetLabel.createSpan({ text: 'Analysis target ' });
        this.addHelpIconToLabel(targetLabel, () => {
            new HelpModal(this.plugin.app, 'Analysis Target', 'Defines which text is sent for analysis. "Current file" analyzes the open document (or selection). If the "Longform" plugin is active and configured, you can analyze the entire project at once.').open();
        });
        
        const targetSelect = targetSection.createEl('select', { cls: 'dropdown smartwrite-w100' });
        
        // Default Option
        // Default Option
        const defaultOption = targetSelect.createEl('option', { value: 'current' });
        defaultOption.setText('📄 Current file');
        
        // Longform Project Option (Only if enabled and configured)
        if (this.plugin.settings.longformEnabled && this.plugin.settings.longformProjectPath) {
            const projects = this.plugin.longformService.getProjects();
            // Try to find the configured project by path
            const configuredProject = projects.find(p => p.path === this.plugin.settings.longformProjectPath);
            
            if (configuredProject) {
                const option = targetSelect.createEl('option', { value: `project:${configuredProject.path}` });
                option.setText(`📚 Longform: ${configuredProject.name}`);
            }
        }

        // 2. Persona Selector
        const selectorSection = container.createDiv({ cls: 'smartwrite-stat-item smartwrite-mb-16' });
        const personaLabel = selectorSection.createDiv({ cls: 'smartwrite-stat-label' });
        personaLabel.createSpan({ text: 'Select persona ' });
        this.addHelpIconToLabel(personaLabel, () => {
            const content = document.createElement('div');
            content.createEl('p', { text: 'Select the desired analysis profile. Each persona focuses on different aspects of your writing:', cls: 'smartwrite-mb-12' });
            
            const table = content.createEl('table', { cls: 'smartwrite-persona-help-table' });
            this.plugin.personaManager.listPersonas().forEach(p => {
                const row = table.createEl('tr');
                row.createEl('td', { text: `${p.icon} ${p.name}`, cls: 'smartwrite-fw-bold' });
                row.createEl('td', { text: p.description });
            });
            
            new HelpModal(this.plugin.app, 'Available Personas', content).open();
        });

        const personas = this.plugin.personaManager.listPersonas();
        const select = selectorSection.createEl('select', { cls: 'dropdown' });
        
        // Add "All" option
        const allOption = select.createEl('option', { value: 'all-enabled', text: '🚀 Analyze with ALL enabled personas' });
        if (this.plugin.settings.selectedPersona === 'all-enabled') allOption.selected = true;

        personas.forEach(persona => {
            const option = select.createEl('option', { value: persona.id });
            option.setText(`${persona.icon} ${persona.name}`);
            if (persona.id === this.plugin.settings.selectedPersona) {
                option.selected = true;
            }
        });

        select.addEventListener('change', (e) => {
            const target = e.target as HTMLSelectElement;
            this.plugin.settings.selectedPersona = target.value;
            void this.plugin.saveSettings();
        });

        // Persona description
        const selectedPersona = personas.find(p => p.id === this.plugin.settings.selectedPersona);
        if (selectedPersona) {
            const description = container.createDiv({ 
                cls: 'smartwrite-suggestion-description smartwrite-mb-12-italic-f11'
            });
            description.setText(selectedPersona.description);
        }

        // Output Language Dropdown
        const langContainer = container.createEl('div', { cls: 'smartwrite-control-group' });
        const langLabel = langContainer.createEl('label', { text: 'Response language ' });
        this.addHelpIconToLabel(langLabel, () => {
            new HelpModal(this.plugin.app, 'Response Language', 'Defines the language the AI should use for its feedback. "Auto" will attempt to detect the language of your original text.').open();
        });
        
        const langSelect = langContainer.createEl('select', { cls: 'smartwrite-w100 smartwrite-mb-15' });

        const languages = [
            { value: 'auto', label: 'Auto (Match Input)' },
            { value: 'pt-br', label: 'Portuguese (BR)' },
            { value: 'en-us', label: 'English (US)' },
            { value: 'es', label: 'Spanish' },
            { value: 'fr', label: 'French' },
            { value: 'de', label: 'German' }
        ];

        languages.forEach(lang => {
            const option = langSelect.createEl('option', { value: lang.value });
            option.setText(lang.label);
        });

        // Set default from settings
        langSelect.value = this.plugin.settings.outputLanguage || 'auto';

        langSelect.addEventListener('change', (e) => {
            const target = e.target as HTMLSelectElement;
            this.plugin.settings.outputLanguage = target.value;
            void this.plugin.saveSettings();
        });

        // Analyze/Translate button
        const actionButtonContainer = container.createDiv({ cls: 'smartwrite-analyze-btn-container' });
        const actionButton = actionButtonContainer.createEl('button', {
            text: modeSelect.value === 'translate' ? 'Translate text' : 'Analyze text',
            cls: 'smartwrite-analyze-btn mod-cta smartwrite-w100'
        });
        
        // Progress Meter
        const progressMeter = actionButton.createDiv({ cls: 'smartwrite-progress-meter' });

        // Stop button (hidden by default)
        const stopButton = actionButtonContainer.createEl('button', {
            text: 'Stop Analysis',
            cls: 'smartwrite-stop-btn is-hidden'
        });

        stopButton.addEventListener('click', () => {
            this.plugin.personaManager.cancelAnalysis();
            new Notice('Analysis stopped.');
            this.resetAnalysisUI(actionButton, stopButton, progressMeter);
        });

        // Mode Change Handler
        modeSelect.addEventListener('change', () => {
            if (modeSelect.value === 'translate') {
                selectorSection.addClass('is-hidden'); // Hide personas
                actionButton.setText('Translate text');
                actionButton.classList.remove('mod-cta');
                actionButton.classList.add('mod-warning'); // Different color
            } else {
                selectorSection.removeClass('is-hidden'); // Show personas
                actionButton.setText('Analyze text');
                actionButton.classList.add('mod-cta');
                actionButton.classList.remove('mod-warning');
            }
        });

        actionButton.addEventListener('click', () => {
            if (modeSelect.value === 'translate') {
                void this.performTranslation(container, actionButton, targetSelect.value, langSelect.value);
            } else {
                void this.performAnalysis(container, actionButton, targetSelect.value);
            }
        });

        // Results area (will be populated after analysis)
        container.createDiv({ 
            cls: 'smartwrite-persona-results',
            attr: { id: 'persona-results' }
        });

        // Background Feedback area
        const bgArea = container.createDiv({ 
            cls: 'smartwrite-background-feedback is-hidden',
            attr: { id: 'background-feedback' }
        });
        
        const lastResult = this.plugin.getLastBackgroundResult();
        if (lastResult) {
            this.showBackgroundAnalysis(lastResult);
        }
    }

    public showBackgroundAnalysis(result: string): void {
        const bgContainer = this.contentEl.querySelector('#background-feedback') as HTMLElement;
        if (!bgContainer) return;

        bgContainer.empty();
        bgContainer.removeClass('is-hidden');
        
        bgContainer.createDiv({ cls: 'smartwrite-section-heading', text: '💡 Live Feedback' });
        
        const content = bgContainer.createDiv({ cls: 'smartwrite-suggestion-description smartwrite-mb-12' });
        content.setText(result);
        
        const syncBtn = bgContainer.createEl('button', {
            text: 'Save as note',
            cls: 'smartwrite-w100 mod-cta'
        });
        
        syncBtn.addEventListener('click', () => {
            void this.saveBackgroundAnalysisAsFile(result);
        });
    }

    private async saveBackgroundAnalysisAsFile(analysis: string): Promise<void> {
        const persona = this.plugin.personaManager.getPersona(this.plugin.settings.selectedPersona);
        const name = persona ? persona.name : 'Assistant';
        
        const timestamp = new Date().toLocaleString();
        const fileContent = `# Live Feedback: ${name}\n\n` +
            `**Date:** ${timestamp}\n\n` +
            `## AI feedback\n\n${analysis}`;

        const now = new Date();
        const timeString = `${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;
        const filename = `Live Feedback - ${name} - ${timeString}.md`;
        
        try {
            const newFile = await this.plugin.app.vault.create(filename, fileContent);
            await this.plugin.app.workspace.getLeaf('tab').openFile(newFile);
            new Notice(`Feedback saved to: ${filename}`);
        } catch (e) {
            new Notice('Failed to save file.');
        }
    }

    private renderSetupGuide(container: HTMLElement): void {
        // ... (existing implementation unchanged) ...
        container.createEl('div', { 
            text: '🚀 Setup Ollama', 
            cls: 'smartwrite-section-heading smartwrite-mb-16-accent' 
        });

        // Option selector
        const optionHeader = container.createDiv({ cls: 'smartwrite-stat-label smartwrite-mb-12' });
        optionHeader.setText('Choose your installation method:');

        // Option 1: GUI App
        const option1 = container.createDiv({ cls: 'smartwrite-stat-item smartwrite-mb-16 smartwrite-p12-bg2-r6' });
        option1.createEl('strong', { text: '📱 Option 1: Ollama app (with menu bar icon)' });
        option1.createEl('br');
        
        const step1a = option1.createDiv({ cls: 'smartwrite-mt-8-ml-12' });
        step1a.createSpan({ text: '1. ', cls: 'smartwrite-fw-bold' });
        const downloadLink = step1a.createEl('a', {
            text: 'Download Ollama',
            href: 'https://ollama.ai/download',
            cls: 'smartwrite-link-accent'
        });
        downloadLink.setAttr('target', '_blank');
        
        const step2a = option1.createDiv({ cls: 'smartwrite-ml-12' });
        step2a.createSpan({ text: '2. ', cls: 'smartwrite-fw-bold' });
        step2a.appendText('Drag to your Applications folder');
        
        const step3a = option1.createDiv({ cls: 'smartwrite-ml-12' });
        step3a.createSpan({ text: '3. ', cls: 'smartwrite-fw-bold' });
        step3a.appendText('Launch Ollama.app');

        // Option 2: Daemon (Recommended)
        const option2 = container.createDiv({ cls: 'smartwrite-stat-item smartwrite-mb-16 smartwrite-p12-bg2-r6-accent-border' });
        option2.createEl('strong', { text: '👻 Option 2: Background service (Recommended)' });
        option2.createEl('br');
        option2.createSpan({ text: 'This is completely invisible, with no menu bar icon.', cls: 'smartwrite-mb-12-italic-f11' });
        
        const brewNote = option2.createDiv({ cls: 'smartwrite-mt-8-f12-italic' });
        brewNote.setText('Requires Homebrew to be installed.');
        
        const brewLink = option2.createEl('a', {
            text: 'Install Homebrew',
            href: 'https://brew.sh',
            cls: 'smartwrite-link-accent smartwrite-f11-ml-4'
        });
        brewLink.setAttr('target', '_blank');

        const codeBlock = option2.createEl('pre', { 
            cls: 'smartwrite-mt-8-p8-bg1-r4-f11'
        });
        codeBlock.createEl('code', { text: 'brew install ollama\nbrew services start ollama' });

        // Info box
        const infoBox = container.createDiv({ 
            cls: 'smartwrite-suggestion-description smartwrite-mt-16-p12-bg2-r6-accent-left'
        });
        infoBox.createEl('strong', { text: '💡 100% local and free' });
        infoBox.createEl('br');
        infoBox.appendText('No internet is required after setup. There are no subscriptions, and you have complete privacy.');
        infoBox.createEl('br');
        infoBox.appendText('Once running, this plugin will automatically download the required AI model.');

        // Retry button
        const retryButton = container.createEl('button', {
            text: 'Check connection',
            cls: 'mod-cta smartwrite-mt-16 smartwrite-w100'
        });
        
        retryButton.addEventListener('click', () => {
            retryButton.setText('Checking...');
            retryButton.disabled = true;
            
            this.plugin.ollamaService.checkConnection().then(connected => {
                if (connected) {
                    this.renderContent();
                } else {
                    retryButton.setText('Check Connection');
                    retryButton.disabled = false;
                }
            }).catch(() => {
                retryButton.setText('Check Connection');
                retryButton.disabled = false;
            });
        });
    }

    public update(_data: unknown): void {
        this.renderContent();
    }

    public updateInstallProgress(progress: { status: string; percent?: number }): void {
        // Clear and show progress
        this.contentEl.empty();
        const container = this.contentEl.createDiv({ cls: 'smartwrite-persona-container' });
        
        container.createEl('div', { text: 'Installing model', cls: 'smartwrite-section-heading smartwrite-mb-12' });
        
        container.createDiv({ 
            cls: 'smartwrite-stat-label smartwrite-mb-12', 
            text: progress.status || 'Downloading...'
        });
        
        if (progress.percent !== undefined) {
            const progressBar = container.createDiv({ cls: 'smartwrite-progress-bar' });
            const progressFill = progressBar.createDiv({ cls: 'smartwrite-progress-fill' });
            progressFill.setCssProps({ '--progress-width': `${progress.percent}%` });
            progressFill.setCssStyles({ width: 'var(--progress-width)' });
            
            container.createDiv({ 
                cls: 'smartwrite-stat-mono smartwrite-mt-4-text-center', 
                text: `${progress.percent}%`
            });
        }
    }

    private async performAnalysis(container: HTMLElement, button: HTMLButtonElement, targetValue: string): Promise<void> {
        const { text, title } = await this.getTargetContent(targetValue);
        if (!text) return;

        button.setText('Analyzing...');
        button.addClass('smartwrite-btn-processing');
        button.disabled = true;

        const progressMeter = button.querySelector('.smartwrite-progress-meter') as HTMLElement;
        const stopButton = button.parentElement?.querySelector('.smartwrite-stop-btn') as HTMLButtonElement;
        
        if (progressMeter) progressMeter.setCssStyles({ height: '0%' });
        if (stopButton) stopButton.removeClass('is-hidden');

        // 1. Ask for Folder FIRST
        new FolderSelectionModal(this.plugin.app, 
            async (selectedFolder: TFolder) => {
                await this.executeAnalysisWorkflow(container, button, stopButton, text, title, selectedFolder, progressMeter);
            },
            () => {
                // CANCELLED - Reset UI
                this.resetAnalysisUI(button, stopButton, progressMeter);
            }
        ).open();
    }

    private resetAnalysisUI(button: HTMLButtonElement, stopButton: HTMLButtonElement | null, progressMeter: HTMLElement | null) {
        button.setText('Analyze text');
        button.removeClass('smartwrite-btn-processing');
        button.disabled = false;
        if (stopButton) stopButton.addClass('is-hidden');
        if (progressMeter) progressMeter.setCssStyles({ height: '0%' });
    }

    private async executeAnalysisWorkflow(
        container: HTMLElement, 
        button: HTMLButtonElement, 
        stopButton: HTMLButtonElement | null,
        text: string, 
        title: string, 
        destFolder: TFolder,
        progressMeter: HTMLElement | null
    ): Promise<void> {
        const selectedId = this.plugin.settings.selectedPersona;
        
        try {
            const run = async (forceQueue: boolean = false) => {
                let results: PersonaAnalysisResult[] = [];
                
                if (selectedId === 'all-enabled') {
                    const enabledPersonas = this.plugin.personaManager.listPersonas();
                    for (let i = 0; i < enabledPersonas.length; i++) {
                        const p = enabledPersonas[i];
                        button.setText(`Analyzing (${i + 1}/${enabledPersonas.length}): ${p.name}...`);
                        if (progressMeter) progressMeter.setCssStyles({ height: `${(i / enabledPersonas.length) * 100}%` });

                        const res = await this.plugin.personaManager.analyzeText(
                            p.id, text, this.plugin.settings.outputLanguage, undefined, forceQueue
                        );
                        // If it returns a busy object or error "cancelled"
                        if ('isBusy' in res) continue; 
                        if (res.error === 'Analysis cancelled by user') {
                            this.resetAnalysisUI(button, stopButton, progressMeter);
                            return;
                        }
                        results.push(res);
                    }
                    if (progressMeter) progressMeter.setCssStyles({ height: '100%' });
                } else {
                    const res = await this.plugin.personaManager.analyzeText(
                        selectedId, text, this.plugin.settings.outputLanguage, 
                        (s, p) => { if (progressMeter) progressMeter.setCssStyles({ height: `${p}%` }); },
                        forceQueue
                    );
                    
                    if ('isBusy' in res) {
                        new QueueAnalysisModal(this.plugin.app, res.personaName, () => {
                            void run(true); // Retry with forceQueue
                        }).open();
                        // Reset but only if not truly queued? Actually button says "Analysis Queued"
                        return;
                    }

                    if (res.error === 'Analysis cancelled by user') {
                        this.resetAnalysisUI(button, stopButton, progressMeter);
                        return;
                    }
                    results.push(res as PersonaAnalysisResult);
                }

                await this.finalizeAnalysisResults(container, results, title, destFolder);
                this.resetAnalysisUI(button, stopButton, progressMeter);
            };

            await run(false);

        } catch (error) {
            console.error('Analysis workflow failed:', error);
            button.setText('Analyze text');
            button.removeClass('smartwrite-btn-processing');
            button.disabled = false;
        }
    }

    private async finalizeAnalysisResults(
        container: HTMLElement, 
        results: PersonaAnalysisResult[], 
        title: string, 
        destFolder: TFolder
    ): Promise<void> {
        const anyError = results.find(r => r.error);
        const resultsContainer = container.querySelector('#persona-results') as HTMLElement;

        if (anyError && results.length === 1) {
            if (resultsContainer) {
                resultsContainer.empty();
                resultsContainer.createDiv({ cls: 'smartwrite-suggestion-description smartwrite-error-box' }).setText(`Error: ${anyError.error}`);
            }
            new Notice('Analysis failed.');
            return;
        }

        if (resultsContainer) {
            resultsContainer.empty();
            resultsContainer.createDiv({ cls: 'smartwrite-suggestion-description smartwrite-success-box' })
                .setText(`✅ ${results.length > 1 ? 'Full analysis' : 'Analysis'} document created!`);
        }

        const timestamp = new Date().toLocaleString();
        let fileContent = `# Analysis: ${title}\n\n**Date:** ${timestamp}\n\n`;

        if (results.length > 1) {
            fileContent += `**Multi-Persona Analysis (${results.length} personas)**\n\n---\n\n`;
            results.forEach(res => {
                fileContent += `## ${res.personaName} feedback\n\n${res.analysis || res.error || 'No feedback generated.'}\n\n---\n\n`;
            });
        } else {
            const result = results[0];
            fileContent += `**Persona:** ${result.personaName}\n\n## AI feedback\n\n${result.analysis}`;
        }

        const now = new Date();
        const timeString = `${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;
        const baseName = results.length > 1 ? 'Full analysis' : `Analysis - ${results[0].personaName}`;
        const filename = `${baseName} - ${timeString}.md`;
        const fullPath = destFolder.path === '/' ? filename : `${destFolder.path}/${filename}`;
        
        try {
            const newFile = await this.plugin.app.vault.create(fullPath, fileContent);
            await this.plugin.app.workspace.getLeaf('tab').openFile(newFile);
            new Notice(`Analysis saved to: ${fullPath}`);
        } catch (e) {
            new Notice('Failed to create analysis file.');
        }
    }


    private async performTranslation(_container: HTMLElement, button: HTMLButtonElement, targetValue: string, targetLang: string) {
        if (targetLang === 'auto') {
            new Notice('Please select a specific target language for translation.');
            return;
        }

        const { text, title } = await this.getTargetContent(targetValue);
        if (!text) return;

        button.setText('Translating...');
        button.disabled = true;
        button.addClass('smartwrite-btn-processing');

        const progressMeter = button.querySelector('.smartwrite-progress-meter') as HTMLElement;
        if (progressMeter) progressMeter.setCssStyles({ height: '0%' });

        try {
            const result = await this.plugin.translationService.translateProject(
                text, 
                'Auto', 
                targetLang, 
                (status, percent) => {
                    button.setText(`${status} (${percent}%)`);
                    if (progressMeter) progressMeter.setCssStyles({ height: `${percent}%` });
                }
            );

            if (result.error) {
                new Notice(`Translation failed: ${result.error}`);
            } else {
                // Save File
                const timestamp = new Date().toLocaleString();
                const fileContent = `# Translation: ${title}\n\n` +
                    `**Target Language:** ${targetLang}\n` +
                    `**Date:** ${timestamp}\n\n` +
                    result.translatedText;

                const now = new Date();
                const timeString = `${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;
                const filename = `Translation - ${title} - ${targetLang} - ${timeString}.md`;
                
                const newFile = await this.plugin.app.vault.create(filename, fileContent);
                await this.plugin.app.workspace.getLeaf('tab').openFile(newFile);
                
                new Notice(`Translation saved to: ${filename}`);
            }

        } catch (e) {
            new Notice('Translation error.');
            console.error(e);
        } finally {
            button.setText('Translate text');
            button.disabled = false;
            button.removeClass('smartwrite-btn-processing');
        }
    }

    private async getTargetContent(targetValue: string): Promise<{ text: string | null, title: string }> {
        let text = '';
        let title = 'Untitled';

        // Detect Target
        if (targetValue === 'current') {
            let activeView = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
            // Fallback check
            if (!activeView) {
                 const leaf = this.plugin.app.workspace.getMostRecentLeaf();
                 if (leaf && leaf.view instanceof MarkdownView) activeView = leaf.view as MarkdownView;
            }

            if (!activeView || !activeView.editor) {
                new Notice('Please open a markdown file.');
                return { text: null, title: '' };
            }
            text = activeView.editor.getSelection() || activeView.editor.getValue();
            title = activeView.file ? activeView.file.basename : 'Untitled';

        } else if (targetValue.startsWith('project:')) {
            const projectPath = targetValue.replace('project:', '');
            const projects = this.plugin.longformService.getProjects();
            const project = projects.find(p => p.path === projectPath);

            if (project) {
                new Notice(`📚 Compiling project: ${project.name}...`);
                try {
                    text = await this.plugin.longformService.getProjectContent(project);
                    title = `Project - ${project.name}`;
                } catch (err) {
                    console.error('Failed to compile project:', err);
                    new Notice('Failed to compile the project.');
                    return { text: null, title: '' };
                }
            }
        }
        
        if (!text || text.trim().length === 0) {
            new Notice('No text found to analyze.');
            return { text: null, title: '' };
        }

        return { text, title };
    }
}
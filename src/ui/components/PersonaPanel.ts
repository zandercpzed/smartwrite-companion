import { BasePanel } from './BasePanel';
import { MarkdownView, Notice } from 'obsidian';

import SmartWriteCompanionPlugin from '../../main';

export class PersonaPanel extends BasePanel {
    private plugin: SmartWriteCompanionPlugin;

    constructor(containerEl: HTMLElement, plugin: SmartWriteCompanionPlugin) {
        super(containerEl, 'Persona analysis');
        this.plugin = plugin;
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
        modeContainer.createEl('label', { text: 'Mode' });
        
        const modeSelect = modeContainer.createEl('select', { cls: 'dropdown smartwrite-w100' });
        modeSelect.createEl('option', { value: 'analyze', text: '🧐 Analyze (personas)' });
        modeSelect.createEl('option', { value: 'translate', text: '🌍 Translate' });

        // 1. Target Selector (Current File vs Configured Longform Project)
        const targetSection = container.createDiv({ cls: 'smartwrite-stat-item smartwrite-mb-12' });
        targetSection.createDiv({ cls: 'smartwrite-stat-label' }).setText('Analysis target');
        
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
        selectorSection.createDiv({ cls: 'smartwrite-stat-label' }).setText('Select persona');

        const personas = this.plugin.personaManager.listPersonas();
        const select = selectorSection.createEl('select', { cls: 'dropdown' });
        
        personas.forEach(persona => {
            const option = select.createEl('option', { value: persona.id });
            option.setText(`${persona.icon} ${persona.name}`);
            if (persona.id === this.plugin.settings.selectedPersona) {
                option.selected = true;
            }
        });

        select.addEventListener('change', async (e) => {
            const target = e.target as HTMLSelectElement;
            this.plugin.settings.selectedPersona = target.value;
            await this.plugin.saveSettings();
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
        langContainer.createEl('label', { text: 'Response language' });
        
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

        langSelect.addEventListener('change', async (e) => {
            const target = e.target as HTMLSelectElement;
            this.plugin.settings.outputLanguage = target.value;
            await this.plugin.saveSettings();
        });

        // Analyze/Translate button
        const actionButton = container.createEl('button', {
            text: modeSelect.value === 'translate' ? 'Translate text' : 'Analyze text',
            cls: 'mod-cta smartwrite-w100 smartwrite-mb-16'
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

        actionButton.addEventListener('click', async () => {
            if (modeSelect.value === 'translate') {
                await this.performTranslation(container, actionButton, targetSelect.value, langSelect.value);
            } else {
                await this.performAnalysis(container, actionButton, targetSelect.value);
            }
        });

        // Results area (will be populated after analysis)
        container.createDiv({ 
            cls: 'smartwrite-persona-results',
            attr: { id: 'persona-results' }
        });
    }

    private renderSetupGuide(container: HTMLElement): void {
        // ... (existing implementation unchanged) ...
        container.createEl('h3', { 
            text: '🚀 Setup Ollama', 
            cls: 'smartwrite-mb-16-accent' 
        });

        // Option selector
        const optionHeader = container.createDiv({ cls: 'smartwrite-stat-label smartwrite-mb-12' });
        optionHeader.setText('Choose installation method:');

        // Option 1: GUI App
        const option1 = container.createDiv({ cls: 'smartwrite-stat-item smartwrite-mb-16 smartwrite-p12-bg2-r6' });
        option1.createEl('strong', { text: '📱 Option 1: Ollama app (menu bar icon)' });
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
        step2a.appendText('Drag to Applications folder');
        
        const step3a = option1.createDiv({ cls: 'smartwrite-ml-12' });
        step3a.createSpan({ text: '3. ', cls: 'smartwrite-fw-bold' });
        step3a.appendText('Launch Ollama.app');

        // Option 2: Daemon (Recommended)
        const option2 = container.createDiv({ cls: 'smartwrite-stat-item smartwrite-mb-16 smartwrite-p12-bg2-r6-accent-border' });
        option2.createEl('strong', { text: '👻 Option 2: Background service (recommended)' });
        option2.createEl('br');
        option2.createSpan({ text: 'Completely invisible, no menu bar icon', cls: 'smartwrite-mb-12-italic-f11' });
        
        const brewNote = option2.createDiv({ cls: 'smartwrite-mt-8-f12-italic' });
        brewNote.setText('Requirements: Homebrew installed');
        
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
        infoBox.createEl('strong', { text: '💡 100% local & free' });
        infoBox.createEl('br');
        infoBox.appendText('No internet required after setup. No subscriptions. Complete privacy.');
        infoBox.createEl('br');
        infoBox.appendText('Once running, this plugin auto-downloads the AI model.');

        // Retry button
        const retryButton = container.createEl('button', {
            text: 'Check connection',
            cls: 'mod-cta smartwrite-mt-16 smartwrite-w100'
        });
        
        retryButton.addEventListener('click', async () => {
            retryButton.setText('Checking...');
            retryButton.disabled = true;
            
            const connected = await this.plugin.ollamaService.checkConnection();
            
            if (connected) {
                this.renderContent();
            } else {
                retryButton.setText('Check Connection');
                retryButton.disabled = false;
            }
        });
    }

    public update(_data: unknown): void {
        this.renderContent();
    }

    public updateInstallProgress(progress: { status: string; percent?: number }): void {
        // Clear and show progress
        this.contentEl.empty();
        const container = this.contentEl.createDiv({ cls: 'smartwrite-persona-container' });
        
        container.createEl('h3', { text: 'Installing model', cls: 'smartwrite-mb-12' });
        
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

        // Update UI state - Start Animation
        button.setText('Analyzing...');
        button.addClass('smartwrite-btn-processing');
        button.disabled = true;

        try {
            // execute analysis
            const result = await this.plugin.personaManager.analyzeText(
                this.plugin.settings.selectedPersona,
                text,
                this.plugin.settings.outputLanguage
            );

            if (result.error) {
                // Show error
                const resultsContainer = container.querySelector('#persona-results') as HTMLElement;
                if (resultsContainer) {
                    resultsContainer.empty();
                    const errorDiv = resultsContainer.createDiv({ 
                        cls: 'smartwrite-suggestion-description smartwrite-error-box'
                    });
                    errorDiv.setText(`Error: ${result.error}`);
                }
                new Notice('Analysis failed.');
            } else {
                // Success - Create new file
                const resultsContainer = container.querySelector('#persona-results') as HTMLElement;
                if (resultsContainer) {
                    resultsContainer.empty();
                    const successDiv = resultsContainer.createDiv({ 
                        cls: 'smartwrite-suggestion-description smartwrite-success-box'
                    });
                    successDiv.setText('✅ Analysis document created!');
                }

                // Format content - NO ORIGINAL TEXT as requested
                const timestamp = new Date().toLocaleString();
                const fileContent = `# Analysis: ${title}\n\n` +
                    `**Persona:** ${result.personaName} ${result.personaId === 'fandom' ? '💫' : '📝'}\n` +
                    `**Date:** ${timestamp}\n\n` +
                    `## AI feedback\n\n${result.analysis}`;

                // Create filename
                const now = new Date();
                const timeString = `${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;
                const filename = `Analysis - ${result.personaName} - ${timeString}.md`;
                
                // Create and open file
                const newFile = await this.plugin.app.vault.create(filename, fileContent);
                await this.plugin.app.workspace.getLeaf('tab').openFile(newFile);
                
                new Notice(`Analysis saved to ${filename}`);
            }
        } catch (error) {
            console.error('Analysis failed:', error);
            new Notice('An error occurred during analysis.');
        } finally {
            // Reset UI state - Stop Animation in all cases
            button.setText('Analyze Text');
            button.removeClass('smartwrite-btn-processing');
            button.disabled = false;
        }
    }


    private async performTranslation(_container: HTMLElement, button: HTMLButtonElement, targetValue: string, targetLang: string) {
        if (targetLang === 'auto') {
            new Notice('Please select a specific Target Language for translation.');
            return;
        }

        const { text, title } = await this.getTargetContent(targetValue);
        if (!text) return;

        button.setText('Translating...');
        button.disabled = true;
        button.addClass('smartwrite-btn-processing');

        try {
            const result = await this.plugin.translationService.translateProject(
                text, 
                'Auto', 
                targetLang, 
                (status, percent) => {
                    button.setText(`${status} (${percent}%)`);
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
                
                new Notice(`Translation saved: ${filename}`);
            }

        } catch (e) {
            new Notice('Translation error.');
            console.error(e);
        } finally {
            button.setText('Translate Text');
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
                    new Notice('Failed to compile project');
                    return { text: null, title: '' };
                }
            }
        }
        
        if (!text || text.trim().length === 0) {
            new Notice('No text found.');
            return { text: null, title: '' };
        }

        return { text, title };
    }
}
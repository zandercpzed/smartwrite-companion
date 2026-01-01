import { BasePanel } from './BasePanel';
import { MarkdownView, Notice } from 'obsidian';

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

        // Check if Ollama is enabled
        if (!this.plugin.settings.ollamaEnabled) {
            const hint = container.createDiv({ cls: 'smartwrite-suggestion-description', attr: { style: 'margin-top: 12px; font-style: italic; opacity: 0.7;' } });
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
        // Persona selector
        const selectorSection = container.createDiv({ cls: 'smartwrite-stat-item', attr: { style: 'margin-bottom: 16px;' } });
        selectorSection.createDiv({ cls: 'smartwrite-stat-label' }).setText('Select Persona');

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
                cls: 'smartwrite-suggestion-description', 
                attr: { style: 'margin-bottom: 12px; font-style: italic; font-size: 11px;' } 
            });
            description.setText(selectedPersona.description);
        }

        // Analyze button
        const analyzeButton = container.createEl('button', {
            text: 'Analyze Text',
            cls: 'mod-cta',
            attr: { style: 'width: 100%; margin-bottom: 16px;' }
        });

        analyzeButton.addEventListener('click', async () => {
            await this.performAnalysis(container, analyzeButton);
        });

        // Results area (will be populated after analysis)
        const resultsContainer = container.createDiv({ 
            cls: 'smartwrite-persona-results',
            attr: { id: 'persona-results' }
        });
    }

    private renderSetupGuide(container: HTMLElement): void {
        // Title
        const title = container.createEl('h3', { 
            text: '🚀 Setup Ollama', 
            attr: { style: 'margin-bottom: 16px; color: var(--text-accent);' } 
        });

        // Option selector
        const optionHeader = container.createDiv({ cls: 'smartwrite-stat-label', attr: { style: 'margin-bottom: 12px;' } });
        optionHeader.setText('Choose Installation Method:');

        // Option 1: GUI App
        const option1 = container.createDiv({ cls: 'smartwrite-stat-item', attr: { style: 'margin-bottom: 16px; padding: 12px; background: var(--background-secondary); border-radius: 6px;' } });
        option1.createEl('strong', { text: '📱 Option 1: Ollama App (Menu Bar Icon)' });
        option1.createEl('br');
        
        const step1a = option1.createDiv({ attr: { style: 'margin-top: 8px; margin-left: 12px;' } });
        step1a.createSpan({ text: '1. ', attr: { style: 'font-weight: bold;' } });
        const downloadLink = step1a.createEl('a', {
            text: 'Download Ollama',
            href: 'https://ollama.ai/download',
            attr: { style: 'color: var(--interactive-accent); text-decoration: underline;' }
        });
        downloadLink.setAttr('target', '_blank');
        
        const step2a = option1.createDiv({ attr: { style: 'margin-left: 12px;' } });
        step2a.createSpan({ text: '2. ', attr: { style: 'font-weight: bold;' } });
        step2a.appendText('Drag to Applications folder');
        
        const step3a = option1.createDiv({ attr: { style: 'margin-left: 12px;' } });
        step3a.createSpan({ text: '3. ', attr: { style: 'font-weight: bold;' } });
        step3a.appendText('Launch Ollama.app');

        // Option 2: Daemon (Recommended)
        const option2 = container.createDiv({ cls: 'smartwrite-stat-item', attr: { style: 'margin-bottom: 16px; padding: 12px; background: var(--background-secondary); border-radius: 6px; border: 2px solid var(--interactive-accent);' } });
        option2.createEl('strong', { text: '👻 Option 2: Background Service (Recommended)' });
        option2.createEl('br');
        option2.createSpan({ text: 'Completely invisible, no menu bar icon', attr: { style: 'font-size: 11px; color: var(--text-muted);' } });
        
        const brewNote = option2.createDiv({ attr: { style: 'margin-top: 8px; font-size: 12px; font-style: italic;' } });
        brewNote.setText('Requirements: Homebrew installed');
        
        const brewLink = option2.createEl('a', {
            text: 'Install Homebrew',
            href: 'https://brew.sh',
            attr: { style: 'color: var(--interactive-accent); text-decoration: underline; font-size: 11px; margin-left: 4px;' }
        });
        brewLink.setAttr('target', '_blank');

        const codeBlock = option2.createEl('pre', { 
            attr: { style: 'margin-top: 8px; padding: 8px; background: var(--background-primary); border-radius: 4px; font-size: 11px; overflow-x: auto;' }
        });
        codeBlock.createEl('code', { text: 'brew install ollama\nbrew services start ollama' });

        // Info box
        const infoBox = container.createDiv({ 
            cls: 'smartwrite-suggestion-description', 
            attr: { style: 'margin-top: 16px; padding: 12px; background: var(--background-secondary); border-radius: 6px; border-left: 3px solid var(--text-accent);' } 
        });
        infoBox.createEl('strong', { text: '💡 100% Local & Free' });
        infoBox.createEl('br');
        infoBox.appendText('No internet required after setup. No subscriptions. Complete privacy.');
        infoBox.createEl('br');
        infoBox.appendText('Once running, this plugin auto-downloads the AI model.');

        // Retry button
        const retryButton = container.createEl('button', {
            text: 'Check Connection',
            cls: 'mod-cta',
            attr: { style: 'margin-top: 16px; width: 100%;' }
        });
        
        retryButton.addEventListener('click', async () => {
            retryButton.setText('Checking...');
            retryButton.disabled = true;
            
            const connected = await this.plugin.ollamaService.checkConnection();
            
            if (connected) {
                await this.renderContent();
            } else {
                retryButton.setText('Check Connection');
                retryButton.disabled = false;
            }
        });
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

    private async performAnalysis(container: HTMLElement, button: HTMLButtonElement): Promise<void> {
        let activeView = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
        
        // Fallback: If focus is on the sidebar (button click), get the most recent markdown leaf
        if (!activeView) {
            const leaf = this.plugin.app.workspace.getMostRecentLeaf();
            if (leaf && leaf.view instanceof MarkdownView) {
                activeView = leaf.view;
            }
        }

        if (!activeView || !activeView.editor) {
            new Notice('Please open a markdown file to analyze.');
            return;
        }

        const editor = activeView.editor;
        const text = editor.getSelection() || editor.getValue();

        if (!text || text.trim().length === 0) {
            new Notice('No text to analyze.');
            return;
        }

        const originalFile = activeView.file;
        const originalTitle = originalFile ? originalFile.basename : 'Untitled';

        // Update UI state - Start Animation
        button.setText('Analyzing...');
        button.addClass('smartwrite-btn-processing');
        button.disabled = true;

        try {
            // execute analysis (no progress callback needed for button animation)
            const result = await this.plugin.personaManager.analyzeText(
                this.plugin.settings.selectedPersona,
                text
            );

            if (result.error) {
                // Show error
                const resultsContainer = container.querySelector('#persona-results') as HTMLElement;
                if (resultsContainer) {
                    resultsContainer.empty();
                    const errorDiv = resultsContainer.createDiv({ 
                        cls: 'smartwrite-suggestion-description',
                        attr: { style: 'color: var(--text-error); padding: 12px; background: var(--background-secondary); border-radius: 6px;' }
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
                        cls: 'smartwrite-suggestion-description',
                        attr: { style: 'color: var(--text-success); padding: 12px; background: var(--background-secondary); border-radius: 6px;' }
                    });
                    successDiv.setText('✅ Analysis Document Created!');
                }

                // Format content - NO ORIGINAL TEXT as requested
                const timestamp = new Date().toLocaleString();
                const fileContent = `# Analysis: ${originalTitle}\n\n` +
                    `**Persona:** ${result.personaName} ${result.personaId === 'fandom' ? '💫' : '📝'}\n` +
                    `**Date:** ${timestamp}\n\n` +
                    `## AI Feedback\n\n${result.analysis}`;

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
}
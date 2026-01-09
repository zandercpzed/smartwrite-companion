import { ItemView, WorkspaceLeaf } from 'obsidian';
import SmartWriteCompanionPlugin from './main';
import { TextStats, SuggestionsResult, ReadabilityScores } from './types';
import { SessionStatsPanel } from './ui/components/SessionStatsPanel';
import { TextMetricsPanel } from './ui/components/TextMetricsPanel';
import { SuggestionsPanel } from './ui/components/SuggestionsPanel';
import { ReadabilityPanel } from './ui/components/ReadabilityPanel';
import { PersonaPanel } from './ui/components/PersonaPanel';

export class SidebarView extends ItemView {
    private plugin: SmartWriteCompanionPlugin;
    private sessionStatsPanel: SessionStatsPanel;
    private textMetricsPanel: TextMetricsPanel;
    private suggestionsPanel: SuggestionsPanel;
    private readabilityPanel: ReadabilityPanel;
    private personaPanel: PersonaPanel;

    constructor(leaf: WorkspaceLeaf, plugin: SmartWriteCompanionPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType(): string {
        return 'smartwrite-sidebar';
    }

    getDisplayText(): string {
        return 'SmartWrite Companion';
    }

    getIcon(): string {
        return 'pencil';
    }

    async onOpen(): Promise<void> {
        const container = this.containerEl.children[1];
        container.empty();
        container.addClass('smartwrite-container');

        // Create header
        this.createHeader(container);
        
        // Create inline settings panel (hidden by default)
        this.createSettingsPanel(container as HTMLElement);

        // Create panels container
        const panelsContainer = container.createDiv({ cls: 'smartwrite-panels-container' });

        // Initialize panels
        // Initialize panels
        try {
            this.sessionStatsPanel = new SessionStatsPanel(panelsContainer, this.plugin);
        } catch (e) { console.error('Failed to load SessionStatsPanel', e); panelsContainer.createDiv().setText('Error loading SessionStatsPanel'); }

        try {
            this.textMetricsPanel = new TextMetricsPanel(panelsContainer, this.plugin);
        } catch (e) { console.error('Failed to load TextMetricsPanel', e); panelsContainer.createDiv().setText('Error loading TextMetricsPanel'); }

        try {
            this.suggestionsPanel = new SuggestionsPanel(panelsContainer, this.plugin);
        } catch (e) { console.error('Failed to load SuggestionsPanel', e); panelsContainer.createDiv().setText('Error loading SuggestionsPanel'); }

        try {
            this.readabilityPanel = new ReadabilityPanel(panelsContainer, this.plugin);
        } catch (e) { console.error('Failed to load ReadabilityPanel', e); panelsContainer.createDiv().setText('Error loading ReadabilityPanel'); }

        try {
            this.personaPanel = new PersonaPanel(panelsContainer, this.plugin);
        } catch (e) { console.error('Failed to load PersonaPanel', e); panelsContainer.createDiv().setText('Error loading PersonaPanel'); }

        // Initial render
        this.updateContent(null, null, null);
        
        // Fix settings visibility state
        this.refreshPanels();
    }

    private settingsPanel: HTMLElement;
    private isSettingsOpen: boolean = false;

    private createHeader(container: Element): void {
        const header = container.createDiv({ cls: 'smartwrite-header' });

        // Title container
        const titleContainer = header.createDiv({ cls: 'smartwrite-title-container' });
        const title = titleContainer.createDiv({ cls: 'smartwrite-title' });
        title.setText('SmartWrite Companion');
        const version = titleContainer.createDiv({ cls: 'smartwrite-version' });
        version.setText(`versão: ${this.plugin.manifest.version}`);

        // Settings button
        const settingsBtn = header.createDiv({ cls: 'smartwrite-settings-btn' });
        settingsBtn.setText('⚙');
        
        import('obsidian').then(({ setIcon }) => {
            settingsBtn.empty(); // Clear text before adding icon
            setIcon(settingsBtn, 'settings');
        });

        settingsBtn.addEventListener('click', () => this.toggleSettingsPanel());
    }

    private createSettingsPanel(container: HTMLElement): void {
        this.settingsPanel = container.createDiv({ cls: 'smartwrite-settings-panel is-hidden' });

        // Title removed as per user request

        this.createSettingToggle(this.settingsPanel, 'Session Stats', 'showSessionStats');
        this.createSettingToggle(this.settingsPanel, 'Text Metrics', 'showTextMetrics');
        this.createSettingToggle(this.settingsPanel, 'Readability', 'showReadability');
        this.createSettingToggle(this.settingsPanel, 'Suggestions', 'showSuggestions');
        this.createSettingToggle(this.settingsPanel, 'Persona Analysis', 'showPersona');
    }

    private createSettingToggle(container: HTMLElement, label: string, settingKey: keyof typeof this.plugin.settings): void {
        const row = container.createDiv({ cls: 'smartwrite-setting-row' });
        const labelEl = row.createEl('label', { cls: 'smartwrite-module-toggle' });
        
        const input = labelEl.createEl('input', { type: 'checkbox', cls: 'smartwrite-module-checkbox' });
        input.checked = !!this.plugin.settings[settingKey]; // Force boolean
        
        input.addEventListener('change', async () => {
            (this.plugin.settings as any)[settingKey] = input.checked;
            await this.plugin.saveSettings();
            this.refreshPanels();
        });

        labelEl.createSpan({ cls: 'smartwrite-module-label' }).setText(label);
    }

    private toggleSettingsPanel(): void {
        this.isSettingsOpen = !this.isSettingsOpen;
        if (this.settingsPanel) {
            this.settingsPanel.toggleClass('is-hidden', !this.isSettingsOpen);
        }
    }

    private refreshPanels(): void {
        const settings = this.plugin.settings;
        if (this.sessionStatsPanel) settings.showSessionStats ? this.sessionStatsPanel.show() : this.sessionStatsPanel.hide();
        if (this.textMetricsPanel) settings.showTextMetrics ? this.textMetricsPanel.show() : this.textMetricsPanel.hide();
        if (this.suggestionsPanel) settings.showSuggestions ? this.suggestionsPanel.show() : this.suggestionsPanel.hide();
        if (this.readabilityPanel) settings.showReadability ? this.readabilityPanel.show() : this.readabilityPanel.hide();
        if (this.personaPanel) settings.showPersona ? this.personaPanel.show() : this.personaPanel.hide();
    }


    updateContent(stats: TextStats | null, suggestions: SuggestionsResult | null, readability: ReadabilityScores | null): void {
        if (this.sessionStatsPanel) {
            try { this.sessionStatsPanel.update(stats); } catch(e) { console.error('Error updating SessionStats', e); }
        }
        if (this.textMetricsPanel) {
            try { this.textMetricsPanel.update(stats); } catch(e) { console.error('Error updating TextMetrics', e); }
        }
        if (this.suggestionsPanel) {
            try { this.suggestionsPanel.update(suggestions); } catch(e) { console.error('Error updating Suggestions', e); }
        }
        if (this.readabilityPanel) {
            try { this.readabilityPanel.update(readability); } catch(e) { console.error('Error updating Readability', e); }
        }
        if (this.personaPanel) {
            try { this.personaPanel.update(null); } catch(e) { console.error('Error updating Persona', e); }
        }
    }

    updateInstallProgress(progress: { status: string; percent?: number }): void {
        if (this.personaPanel) {
            try { this.personaPanel.updateInstallProgress(progress); } catch(e) { console.error('Error updating install progress', e); }
        }
    }
}
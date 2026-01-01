import { Plugin, TFile, WorkspaceLeaf, debounce, MarkdownView } from 'obsidian';
import { SmartWriteSettings, DEFAULT_SETTINGS } from './settings';
import { SmartWriteSettingTab } from './settings';
import { SidebarView } from './SidebarView';
import { SessionTracker } from './core/SessionTracker';
import { TextAnalyzer } from './core/TextAnalyzer';
import { StatsEngine } from './core/StatsEngine';
import { SuggestionEngine } from './core/SuggestionEngine';
import { ReadabilityEngine } from './core/ReadabilityEngine';
import { Language } from './types';

export default class SmartWriteCompanionPlugin extends Plugin {
    settings: SmartWriteSettings;
    sessionTracker: SessionTracker;
    textAnalyzer: TextAnalyzer;
    statsEngine: StatsEngine;
    suggestionEngine: SuggestionEngine;
    readabilityEngine: ReadabilityEngine;

    async onload() {
        await this.loadSettings();

        // Initialize engines
        this.textAnalyzer = new TextAnalyzer();
        this.statsEngine = new StatsEngine();
        this.suggestionEngine = new SuggestionEngine();
        this.readabilityEngine = new ReadabilityEngine();

        // Initialize session tracker
        this.sessionTracker = new SessionTracker(this);

        // Register sidebar view
        this.registerView(
            'smartwrite-sidebar',
            (leaf) => new SidebarView(leaf, this)
        );

        // Add settings tab
        this.addSettingTab(new SmartWriteSettingTab(this.app, this));

        // Add ribbon icon
        this.addRibbonIcon('lightbulb', 'SmartWrite Companion', () => {
            this.toggleSidebar();
        });

        // Add command to toggle sidebar
        this.addCommand({
            id: 'toggle-smartwrite-sidebar',
            name: 'Toggle SmartWrite Sidebar',
            callback: () => {
                this.toggleSidebar();
            }
        });

        // Register editor change event with debounce
        this.registerEvent(
            this.app.workspace.on('editor-change', debounce((editor: any, view: MarkdownView) => {
                this.onEditorChange(editor, view);
            }, 300))
        );

        // Register active leaf change for instant updates
        this.registerEvent(
            this.app.workspace.on('active-leaf-change', (leaf) => {
                if (leaf && leaf.view instanceof MarkdownView) {
                    this.analyzeAndUpdate(leaf.view.editor.getValue());
                }
            })
        );
        
        // Also register file-open to be safe
        this.registerEvent(
            this.app.workspace.on('file-open', (file) => {
                const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
                if (activeView) {
                    this.analyzeAndUpdate(activeView.editor.getValue());
                }
            })
        );
    }

    onunload() {
        this.sessionTracker.endSession();
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async activateView() {
        const { workspace } = this.app;

        let leaf: WorkspaceLeaf | null = null;
        const leaves = workspace.getLeavesOfType('smartwrite-sidebar');

        if (leaves.length > 0) {
            leaf = leaves[0];
        } else {
            leaf = workspace.getRightLeaf(false);
            if (leaf) {
                await leaf.setViewState({
                    type: 'smartwrite-sidebar',
                    active: true,
                });
            }
        }

        if (leaf) {
            workspace.revealLeaf(leaf);
            
            // Trigger initial analysis if there's an active editor
            const activeView = workspace.getActiveViewOfType(MarkdownView);
            if (activeView) {
                this.analyzeAndUpdate(activeView.editor.getValue());
            }
        }
    }

    private onEditorChange(editor: any, view: MarkdownView): void {
        const text = editor.getValue();
        this.analyzeAndUpdate(text);
    }

    private analyzeAndUpdate(text: string): void {
        try {
            // Analyze text
            const metrics = this.textAnalyzer.analyze(text, 'en'); // TODO: detect language
            const stats = this.statsEngine.calculateTextStats(metrics, this.settings.readingSpeed);
            const suggestions = this.suggestionEngine.analyze(text, metrics);
            const readability = this.readabilityEngine.calculateScores(metrics, 'en');

            // Update session tracker
            this.sessionTracker.updateWords(stats.wordCount);

            // Update sidebar if open
            this.updateSidebar(stats, suggestions, readability);
        } catch (error) {
            console.error('Error analyzing text:', error);
        }
    }

    private updateSidebar(stats: any, suggestions: any, readability: any): void {
        // Find sidebar view and update it
        const leaves = this.app.workspace.getLeavesOfType('smartwrite-sidebar');
        if (leaves.length > 0) {
            const sidebarView = leaves[0].view as SidebarView;
            if (sidebarView && typeof sidebarView.updateContent === 'function') {
                sidebarView.updateContent(stats, suggestions, readability);
            }
        }
    }

    private toggleSidebar(): void {
        const leaves = this.app.workspace.getLeavesOfType('smartwrite-sidebar');
        if (leaves.length > 0) {
            this.app.workspace.detachLeavesOfType('smartwrite-sidebar');
        } else {
            this.activateView();
        }
    }

}
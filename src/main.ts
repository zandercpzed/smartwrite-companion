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
import { Highlighter } from './services/Highlighter';
import { OllamaService } from './services/OllamaService';
import { PersonaManager } from './services/PersonaManager';
import { LongformService } from './services/LongformService';
import { TranslationService } from './services/TranslationService';

export default class SmartWriteCompanionPlugin extends Plugin {
    settings: SmartWriteSettings;
    sessionTracker: SessionTracker;
    textAnalyzer: TextAnalyzer;
    statsEngine: StatsEngine;
    suggestionEngine: SuggestionEngine;
    readabilityEngine: ReadabilityEngine;
    ollamaService: OllamaService;
    personaManager: PersonaManager;
    longformService: LongformService;
    translationService: TranslationService;

    async onload() {
        await this.loadSettings();

        // Initialize engines
        this.textAnalyzer = new TextAnalyzer();
        this.statsEngine = new StatsEngine();
        this.suggestionEngine = new SuggestionEngine();
        this.readabilityEngine = new ReadabilityEngine();
        this.ollamaService = new OllamaService(this);
        this.personaManager = new PersonaManager(this);
        this.longformService = new LongformService(this.app); // Correction: It takes App
        this.translationService = new TranslationService(this);

        // Initialize Ollama service
        this.ollamaService.initializeService().then(async (result) => {
            if (result.success) {
                console.debug('SmartWrite: Ollama initialized -', result.message);
                
                // Auto-install model if needed
                if (result.needsInstall) {
                    console.debug(`SmartWrite: Installing default model ${this.settings.ollamaModel}...`);
                    
                    const success = await this.ollamaService.pullModel(
                        this.settings.ollamaModel,
                        (progress) => {
                            // Update sidebar with progress
                            this.updateModelInstallProgress(progress);
                        }
                    );
                    
                    if (success) {
                        console.debug('SmartWrite: Model installed successfully');
                    } else {
                        console.error('SmartWrite: Model installation failed');
                    }
                }
            } else {
                console.warn('SmartWrite: Ollama initialization failed -', result.message);
            }
        });

        // Initialize session tracker
        this.sessionTracker = new SessionTracker(this);

        // Register sidebar view
        this.registerView(
            'smartwrite-sidebar',
            (leaf) => new SidebarView(leaf, this)
        );

        // Add settings tab
        this.addSettingTab(new SmartWriteSettingTab(this.app, this));

        // Register editor highlighter
        this.registerEditorExtension(Highlighter.getExtension());

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
                    this.sessionTracker.resetFileBaseline();
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
            // Basic language detection (very simple for now: check for common PT words)
            const ptWords = ['que', 'para', 'com', 'uma', 'este'];
            const lang: Language = ptWords.some(w => text.toLowerCase().includes(w)) ? 'pt' : 'en';

            // Re-initialize engine if language changed (or pass it)
            // For SuggestionEngine, we need to pass it to constructor or update patterns.
            // Let's re-init for simplicity if needed, or better, pass language to analyze.
            // Actually, SuggestionEngine constructor takes language.
            this.suggestionEngine = new SuggestionEngine({ language: lang });

            // Analyze text
            const metrics = this.textAnalyzer.analyze(text, lang);
            const stats = this.statsEngine.calculateTextStats(metrics, this.settings.readingSpeed);
            const suggestions = this.suggestionEngine.analyze(text, metrics);
            const readability = this.readabilityEngine.calculateScores(metrics, lang);

            // Update session tracker
            this.sessionTracker.updateWords(stats.wordCount);

            // Update editor highlights if sidebar is open or always? 
            // Usually we want highlights if the plugin is active.
            const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
            if (activeView && (activeView.editor as any).cm) {
                Highlighter.updateHighlights((activeView.editor as any).cm, suggestions.suggestions);
            }

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

    private updateModelInstallProgress(progress: { status: string; percent?: number }): void {
        const leaves = this.app.workspace.getLeavesOfType('smartwrite-sidebar');
        if (leaves.length > 0) {
            const sidebarView = leaves[0].view as SidebarView;
            if (sidebarView && typeof sidebarView.updateInstallProgress === 'function') {
                sidebarView.updateInstallProgress(progress);
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
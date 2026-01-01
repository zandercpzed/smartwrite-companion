import { App, PluginSettingTab, Setting } from 'obsidian';
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

        containerEl.createEl('h2', { text: 'SmartWrite Companion Settings' });

        new Setting(containerEl)
            .setName('Daily Word Goal')
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
            .setName('Reading Speed')
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

        containerEl.createEl('h3', { text: 'Ollama Integration (Phase 3)' });

        new Setting(containerEl)
            .setName('Enable Ollama')
            .setDesc('Enable local LLM integration for personas and smart suggestions')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.ollamaEnabled)
                .onChange(async (value) => {
                    this.plugin.settings.ollamaEnabled = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Ollama Endpoint')
            .setDesc('The URL of your local Ollama server')
            .addText(text => text
                .setPlaceholder('http://localhost:11434')
                .setValue(this.plugin.settings.ollamaEndpoint)
                .onChange(async (value) => {
                    this.plugin.settings.ollamaEndpoint = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Ollama Model')
            .setDesc('The model to use for analysis (e.g., qwen2.5:0.5b, phi3, llama3.2)')
            .addText(text => text
                .setPlaceholder('qwen2.5:0.5b')
                .setValue(this.plugin.settings.ollamaModel)
                .onChange(async (value) => {
                    this.plugin.settings.ollamaModel = value;
                    await this.plugin.saveSettings();
                }));
    }
}
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
    }
}
import { BasePanel } from './BasePanel';
import { ReadabilityScores } from '../../types';
import SmartWriteCompanionPlugin from "../../main";

export class ReadabilityPanel extends BasePanel {
    private plugin: SmartWriteCompanionPlugin;
    private scores: ReadabilityScores | null = null;

    constructor(containerEl: HTMLElement, plugin: SmartWriteCompanionPlugin) {
        super(containerEl, 'Readability');
        this.plugin = plugin;
    }

    protected renderContent(): void {
        if (!this.plugin) return;
        this.contentEl.empty();

        if (!this.scores) {
            this.contentEl.createDiv({ cls: 'smartwrite-no-suggestions' }).setText('No text to analyze');
            return;
        }

        const preferred = this.plugin.settings.preferredReadabilityFormula || 'fleschReadingEase';
        const score = (this.scores as any)[preferred] || 0;

        // Gauge/Indicator Area
        const primaryArea = this.contentEl.createDiv({ cls: 'smartwrite-readability-primary' });
        
        const scoreHeader = primaryArea.createDiv({ cls: 'smartwrite-readability-score-row' });
        scoreHeader.createDiv({ cls: 'smartwrite-stat-value' }).setText(score.toFixed(1));
        
        const labelContainer = scoreHeader.createDiv({ cls: 'smartwrite-suggestion-content' });
        labelContainer.createDiv({ cls: 'smartwrite-suggestion-type' }).setText('Overall Level');
        labelContainer.createDiv({ cls: 'smartwrite-suggestion-description' }).setText(
            this.scores.overallLevel.replace('-', ' ').toUpperCase()
        );

        // Progress Bar Indicator
        const barContainer = primaryArea.createDiv({ cls: 'smartwrite-readability-bar-container' });
        const indicator = barContainer.createDiv({ cls: 'smartwrite-readability-indicator' });
        
        // Map score to percentage (assuming Flesch 0-100 as base, others might need normalization)
        let percent = 50;
        if (preferred === 'fleschReadingEase') {
            percent = Math.max(0, Math.min(100, score));
        } else {
            // For grade levels (FK, Gunning, ARI, etc.), usually 0-20. 
            // Let's do a simple mapping for MVP: 0 -> 100%, 20 -> 0% (lower is better/easier)
            percent = Math.max(0, Math.min(100, 100 - (score * 5)));
        }
        indicator.style.left = `${percent}%`;

        // Interpretation
        this.contentEl.createDiv({ cls: 'smartwrite-suggestion-description' }).setText(this.scores.interpretation);

        // Formula Selector
        const footer = this.contentEl.createDiv({ cls: 'smartwrite-readability-footer', attr: { style: 'margin-top: 16px;' } });
        const select = footer.createEl('select', { cls: 'smartwrite-formula-dropdown' });
        
        const formulas = [
            { id: 'fleschReadingEase', name: 'Flesch Reading Ease' },
            { id: 'fleschKincaidGrade', name: 'Flesch-Kincaid Grade' },
            { id: 'gunningFog', name: 'Gunning Fog Index' },
            { id: 'colemanLiau', name: 'Coleman-Liau Index' },
            { id: 'automatedReadability', name: 'Automated Readability' },
            { id: 'daleChall', name: 'Dale-Chall Score' }
        ];

        formulas.forEach(f => {
            const opt = select.createEl('option', { value: f.id, text: f.name });
            if (f.id === preferred) opt.selected = true;
        });

        select.addEventListener('change', async () => {
            this.plugin.settings.preferredReadabilityFormula = select.value;
            await this.plugin.saveSettings();
            this.renderContent();
        });
    }

    public update(scores: ReadabilityScores | null): void {
        this.scores = scores;
        this.renderContent();
    }
}
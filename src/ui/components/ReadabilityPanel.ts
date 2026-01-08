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

        // Large Score (Matches Session Stats big number)
        const largeStat = this.contentEl.createDiv({ cls: 'smartwrite-stat-large' });
        largeStat.createDiv({ cls: 'smartwrite-stat-value' }).setText(score.toFixed(1));
        const formulaName = preferred.replace(/([A-Z])/g, ' $1').toLowerCase();
        largeStat.createDiv({ cls: 'smartwrite-stat-label' }).setText(formulaName.charAt(0).toUpperCase() + formulaName.slice(1));

        // Level & Progress Bar (Matches Session Stats goal bar)
        const progressContainer = this.contentEl.createDiv({ cls: 'smartwrite-stat-item' });
        const levelRow = progressContainer.createDiv({ cls: 'smartwrite-stat-row' });
        levelRow.createSpan({ cls: 'smartwrite-stat-label' }).setText("Overall Level");
        levelRow.createSpan({ cls: 'smartwrite-stat-mono' }).setText(this.scores.overallLevel.replace('-', ' ').toUpperCase());

        const progressBar = progressContainer.createDiv({ cls: 'smartwrite-progress-bar' });
        const progressFill = progressBar.createDiv({ cls: 'smartwrite-progress-fill' });
        
        // Map score to percentage
        let percent = 50;
        if (preferred === 'fleschReadingEase') {
            percent = Math.max(0, Math.min(100, score));
        } else {
            percent = Math.max(0, Math.min(100, 100 - (score * 5)));
        }
        progressFill.addClass('smartwrite-progress-fill');
        progressFill.setCssProps({ '--progress-width': `${percent}%` });
        progressFill.style.width = 'var(--progress-width)';

        // Interpretation
        const interpretation = this.contentEl.createDiv({ cls: 'smartwrite-suggestion-description smartwrite-italic-o8' });
        interpretation.setText(this.scores.interpretation);

        // Formula Selector (Footer)
        const footer = this.contentEl.createDiv({ cls: 'smartwrite-readability-footer smartwrite-mt-16' });
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
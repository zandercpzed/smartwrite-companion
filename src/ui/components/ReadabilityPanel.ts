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
        
        // Placeholder message as requested
        this.contentEl.createDiv({ cls: 'smartwrite-no-suggestions' }).setText('Readability coming soon...');
    }

    private addScoreRow(container: HTMLElement, label: string, value: string): void {
        const row = container.createDiv({ cls: 'score-row' });
        row.createSpan({ cls: 'score-label' }).setText(label);
        row.createSpan({ cls: 'score-value' }).setText(value);
    }

    public update(scores: ReadabilityScores | null): void {
        this.scores = scores;
        this.renderContent();
    }
}
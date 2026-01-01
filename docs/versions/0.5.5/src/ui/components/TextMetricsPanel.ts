import { BasePanel } from './BasePanel';
import { TextStats } from '../../types';
import SmartWriteCompanionPlugin from "../../main";

export class TextMetricsPanel extends BasePanel {
    private plugin: SmartWriteCompanionPlugin;
    private stats: TextStats | null = null;

    constructor(containerEl: HTMLElement, plugin: SmartWriteCompanionPlugin) {
        super(containerEl, 'Text Metrics');
        this.plugin = plugin;
    }

    protected renderContent(): void {
        if (!this.plugin) return;
        this.contentEl.empty();

        if (!this.stats) {
            this.contentEl.createDiv({ cls: 'smartwrite-no-suggestions' }).setText('Open a Markdown file to start analyzing.');
            return;
        }

        const metricsDiv = this.contentEl.createDiv({ cls: 'smartwrite-metrics-list' });

        this.createMetricRow(metricsDiv, 'Characters', `${this.stats.characterCount.toLocaleString()}`);
        this.createMetricRow(metricsDiv, 'No spaces', `${this.stats.characterCountNoSpaces.toLocaleString()}`, true);
        this.createMetricRow(metricsDiv, 'Sentences', `${this.stats.sentenceCount.toLocaleString()}`);
        this.createMetricRow(metricsDiv, 'Paragraphs', `${this.stats.paragraphCount.toLocaleString()}`);
        this.createMetricRow(metricsDiv, 'Reading time', this.plugin.statsEngine.formatTime(this.stats.readingTimeMinutes));
        this.createMetricRow(metricsDiv, 'Unique words', `${this.stats.wordFrequency.size.toLocaleString()}`);
    }

    private createMetricRow(container: HTMLElement, label: string, value: string, indent: boolean = false): void {
        const row = container.createDiv({ cls: 'smartwrite-metric-row' });
        if (indent) row.addClass('smartwrite-metric-indent');
        
        row.createSpan({ cls: 'smartwrite-stat-label' }).setText(label);
        row.createSpan({ cls: 'smartwrite-stat-mono' }).setText(value);
    }

    public update(stats: TextStats | null): void {
        this.stats = stats;
        this.renderContent();
    }
}
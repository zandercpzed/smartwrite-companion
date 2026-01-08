import { BasePanel } from './BasePanel';
import { TextStats } from '../../types';
import SmartWriteCompanionPlugin from "../../main";

export class SessionStatsPanel extends BasePanel {
    private plugin: SmartWriteCompanionPlugin;
    private textStats: TextStats | null = null;

    constructor(containerEl: HTMLElement, plugin: SmartWriteCompanionPlugin) {
        super(containerEl, 'Session Stats');
        this.plugin = plugin;
    }

    protected renderContent(): void {
        if (!this.plugin) return;
        
        try {
            this.contentEl.empty();

            const sessionStats = this.plugin.sessionTracker.getCurrentSession();
            const todayProgress = this.plugin.sessionTracker?.getTodayProgress();

            if (!todayProgress) {
                this.contentEl.setText("Loading...");
                return;
            }

            const sessionWords = sessionStats ? sessionStats.wordsWritten : 0;
            const current = (todayProgress.wordsWritten || 0) + sessionWords;
            const goal = todayProgress.goal || 1000;
            const percent = this.calculateProgress(current, goal);
            
            // Large Word Count (Session)
            const largeStat = this.contentEl.createDiv({ cls: 'smartwrite-stat-large' });
            largeStat.createDiv({ cls: 'smartwrite-stat-value' }).setText(`${this.formatNumber(sessionWords)}`);
            largeStat.createDiv({ cls: 'smartwrite-stat-label' }).setText('Words');

            // Today's Goal Progress
            const goalContainer = this.contentEl.createDiv({ cls: 'smartwrite-stat-item' });
            const goalRow = goalContainer.createDiv({ cls: 'smartwrite-stat-row' });
            goalRow.createSpan({ cls: 'smartwrite-stat-label' }).setText("Today's goal");
            goalRow.createSpan({ cls: 'smartwrite-stat-mono' }).setText(`${this.formatNumber(current)} / ${this.formatNumber(goal)}`);
            
            const progressBar = goalContainer.createDiv({ cls: 'smartwrite-progress-bar' });
            const progressFill = progressBar.createDiv({ cls: 'smartwrite-progress-fill' });
            progressFill.setCssProps({ '--progress-width': `${percent}%` });
            progressFill.style.width = 'var(--progress-width)';

            // Stats Grid (Time & Pace)
            const statsGrid = this.contentEl.createDiv({ cls: 'smartwrite-stats-grid' });
            
            const timeItem = statsGrid.createDiv({ cls: 'smartwrite-stat-item' });
            timeItem.createDiv({ cls: 'smartwrite-stat-label' }).setText('Session Time');
            timeItem.createDiv({ cls: 'smartwrite-stat-mono' }).setText(this.formatTime(sessionStats ? sessionStats.timeSpent : 0));

            const paceItem = statsGrid.createDiv({ cls: 'smartwrite-stat-item' });
            paceItem.createDiv({ cls: 'smartwrite-stat-label' }).setText('Writing Pace');
            paceItem.createDiv({ cls: 'smartwrite-stat-mono' }).setText(`${sessionStats ? Math.round(sessionStats.wpm) : 0} wpm`);

        } catch (error) {
            console.error('CRITICAL ERROR in SessionStatsPanel:', error);
            this.contentEl.createDiv().setText(`Render Error: ${error.message}`);
        }
    }

    private formatNumber(num: number): string {
        return num.toLocaleString();
    }

    private formatTime(minutes: number): string {
        if (minutes < 1) {
            return '< 1 min';
        }
        const hrs = Math.floor(minutes / 60);
        const mins = Math.floor(minutes % 60);
        return hrs > 0 ? `${hrs}h ${mins}m` : `${mins} min`;
    }

    private calculateProgress(current: number, goal: number): number {
        return goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
    }

    public update(stats: TextStats | null): void {
        this.textStats = stats;
        this.renderContent();
    }
}
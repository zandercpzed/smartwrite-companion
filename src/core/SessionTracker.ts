import { Plugin } from 'obsidian';
import { SessionStats, DailyProgress } from '../types';
import SmartWriteCompanionPlugin from '../main';

export class SessionTracker {
    private plugin: SmartWriteCompanionPlugin;
    private currentSession: SessionStats | null = null;
    private dailyProgress: Map<string, DailyProgress> = new Map();
    private lastKnownTotalInFile: number | null = null;

    constructor(plugin: SmartWriteCompanionPlugin) {
        this.plugin = plugin;
        this.loadDailyProgress();
    }

    startSession(currentWordCount: number): void {
        this.lastKnownTotalInFile = currentWordCount;
        if (!this.currentSession) {
            this.currentSession = {
                startTime: new Date(),
                wordsWritten: 0,
                timeSpent: 0,
                wpm: 0,
                progress: 0,
            };
        }
    }

    endSession(): void {
        if (this.currentSession) {
            this.currentSession.endTime = new Date();
            this.updateTimeSpent();
            this.saveSession();
            this.currentSession = null;
        }
    }

    resetSession(currentWordCount: number): void {
        this.endSession();
        this.startSession(currentWordCount);
    }

    resetFileBaseline(): void {
        this.lastKnownTotalInFile = null;
    }

    updateWords(currentTotalWords: number): void {
        if (!this.currentSession) {
            this.startSession(currentTotalWords);
            return;
        }

        if (this.lastKnownTotalInFile === null) {
            this.lastKnownTotalInFile = currentTotalWords;
        }

        const delta = currentTotalWords - this.lastKnownTotalInFile;
        // Only count additions to session words
        if (delta > 0) {
            this.currentSession.wordsWritten += delta;
        }
        
        this.lastKnownTotalInFile = currentTotalWords;
        
        this.updateTimeSpent();

        this.currentSession.wpm = this.currentSession.timeSpent > 0.5 
            ? Math.round(this.currentSession.wordsWritten / this.currentSession.timeSpent) 
            : 0;

        const settings = this.plugin.settings;
        if (settings && settings.dailyGoal) {
            const todayProgress = this.getTodayProgress();
            const totalDailyWords = todayProgress.wordsWritten + this.currentSession.wordsWritten;
            this.currentSession.progress = this.calculateProgress(totalDailyWords, settings.dailyGoal);
        }
    }

    private updateTimeSpent(): void {
        if(this.currentSession) {
            const now = new Date();
            const diffMs = now.getTime() - this.currentSession.startTime.getTime();
            this.currentSession.timeSpent = diffMs / (1000 * 60); // minutes
        }
    }

    getCurrentSession(): SessionStats | null {
        return this.currentSession;
    }

    getDailyProgress(date: string): DailyProgress | undefined {
        return this.dailyProgress.get(date);
    }

    getTodayProgress(): DailyProgress {
        const today = new Date().toDateString();
        let progress = this.dailyProgress.get(today);

        if (!progress) {
            const settings = this.plugin.settings;
            progress = {
                date: today,
                wordsWritten: 0,
                goal: settings ? settings.dailyGoal : 1000,
                sessions: [],
            };
            this.dailyProgress.set(today, progress);
        }

        return progress;
    }

    private calculateProgress(current: number, goal: number): number {
        return goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
    }

    private saveSession(): void {
        if (!this.currentSession) return;

        const progress = this.getTodayProgress();
        // Add session words to daily total ONLY at end of session to avoid double counting? 
        // Or we should track daily total dynamically. 
        // Simpler: Commit session words to daily total on save.
        progress.wordsWritten += this.currentSession.wordsWritten;
        progress.sessions.push(this.currentSession);

        this.saveDailyProgress();
    }

    private async loadDailyProgress(): Promise<void> {
        const data = await this.plugin.loadData() as { dailyProgress?: Record<string, DailyProgress> } | null;
        if (data && data.dailyProgress) {
            const dailyProgressData = data.dailyProgress;
            this.dailyProgress = new Map(
                Object.entries(dailyProgressData).map(([date, progress]) => [
                    date,
                    {
                        ...progress,
                        sessions: progress.sessions ? progress.sessions.map((session: SessionStats) => ({
                            ...session,
                            startTime: new Date(session.startTime),
                            endTime: session.endTime ? new Date(session.endTime) : undefined,
                        })) : [],
                    },
                ])
            );
        }
    }

    private async saveDailyProgress(): Promise<void> {
        const data = await this.plugin.loadData() || {};
        data.dailyProgress = Object.fromEntries(this.dailyProgress);
        await this.plugin.saveData(data);
    }
}
import { Plugin } from 'obsidian';
import { SessionStats, DailyProgress } from '../types';

export class SessionTracker {
    private plugin: Plugin;
    private currentSession: SessionStats | null = null;
    private dailyProgress: Map<string, DailyProgress> = new Map();
    private wordsAtStart: number = 0;

    constructor(plugin: Plugin) {
        this.plugin = plugin;
        this.loadDailyProgress();
    }

    startSession(currentWordCount: number): void {
        this.wordsAtStart = currentWordCount;
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

    updateWords(currentTotalWords: number): void {
        if (!this.currentSession) {
            this.startSession(currentTotalWords);
        }

        if (this.currentSession) {
            // Words written in *this* session
            const wordsDiff = currentTotalWords - this.wordsAtStart;
            // Avoid negative counts if user deletes text
            this.currentSession.wordsWritten = wordsDiff > 0 ? wordsDiff : 0;
            
            this.updateTimeSpent();

            this.currentSession.wpm = this.currentSession.timeSpent > 0.5 
                ? Math.round(this.currentSession.wordsWritten / this.currentSession.timeSpent) 
                : 0;

            const settings = (this.plugin as any).settings;
            if (settings && settings.dailyGoal) {
                // Progress is based on daily total, not just session
                const todayProgress = this.getTodayProgress();
                const totalDailyWords = todayProgress.wordsWritten + this.currentSession.wordsWritten;
                this.currentSession.progress = this.calculateProgress(totalDailyWords, settings.dailyGoal);
            }
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
            const settings = (this.plugin as any).settings;
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
        const data = await this.plugin.loadData();
        if (data && (data as any).dailyProgress) {
            const dailyProgressData = (data as any).dailyProgress;
            this.dailyProgress = new Map(
                Object.entries(dailyProgressData).map(([date, progress]: [string, any]) => [
                    date,
                    {
                        ...progress,
                        sessions: progress.sessions ? progress.sessions.map((session: any) => ({
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
import { TextMetrics, TextStats } from '../types';

export class StatsEngine {
    public calculateTextStats(metrics: TextMetrics, readingSpeed: number = 200): TextStats {
        const wordCount = metrics.words.length;
        const sentenceCount = metrics.sentences.length;
        const paragraphCount = metrics.paragraphs.length;
        const characterCount = metrics.characters;
        const characterCountNoSpaces = metrics.charactersNoSpaces;
        const syllableCount = metrics.syllables;

        const averageWordLength = wordCount > 0 ? characterCountNoSpaces / wordCount : 0;
        const averageSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0;
        const averageSyllablesPerWord = wordCount > 0 ? syllableCount / wordCount : 0;

        const readingTimeMinutes = wordCount > 0 ? wordCount / readingSpeed : 0;

        const topWords = Array.from(metrics.wordFrequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        return {
            wordCount,
            sentenceCount,
            paragraphCount,
            characterCount,
            characterCountNoSpaces,
            syllableCount,
            averageWordLength,
            averageSentenceLength,
            averageSyllablesPerWord,
            readingTimeMinutes,
            wordFrequency: metrics.wordFrequency,
            topWords
        };
    }

    // Helpers used in UI formatting
    public formatTime(minutes: number): string {
        if (minutes < 1) {
            const seconds = Math.round(minutes * 60);
            return `${seconds} sec`;
        }
        const wholeMinutes = Math.ceil(minutes);
        return `${wholeMinutes} min`;
    }
}
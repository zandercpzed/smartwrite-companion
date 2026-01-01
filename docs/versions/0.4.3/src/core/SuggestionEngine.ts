import { TextMetrics, Suggestion, SuggestionsResult } from '../types';

export class SuggestionEngine {
    private passiveVoicePatterns: RegExp[];
    private cliches: Set<string>;
    private longSentenceThreshold: number;
    private repetitionThreshold: number;

    constructor(options: {
        longSentenceThreshold?: number;
        repetitionThreshold?: number;
    } = {}) {
        this.longSentenceThreshold = options.longSentenceThreshold || 25;
        this.repetitionThreshold = options.repetitionThreshold || 3;

        // Passive voice patterns (basic detection)
        this.passiveVoicePatterns = [
            /\b(is|are|was|were|be|been|being)\s+(\w+ed|\w+en)\b/gi,
            /\b(has|have|had)\s+been\s+(\w+ed|\w+en)\b/gi,
        ];

        // Common clichés (expandable)
        this.cliches = new Set([
            'at the end of the day',
            'in this day and age',
            'time will tell',
            'easier said than done',
            'last but not least',
            'the bottom line',
            'make no mistake',
            'it goes without saying',
        ]);
    }

    analyze(text: string, metrics: TextMetrics): SuggestionsResult {
        const suggestions: Suggestion[] = [];

        // Detect repetitions
        suggestions.push(...this.detectRepetitions(metrics));

        // Detect passive voice
        suggestions.push(...this.detectPassiveVoice(text));

        // Detect clichés
        suggestions.push(...this.detectCliches(text));

        // Detect long sentences
        suggestions.push(...this.detectLongSentences(metrics.sentences));

        // Detect complex words (basic heuristic)
        suggestions.push(...this.detectComplexWords(metrics.words));

        // Use write-good for additional suggestions
        suggestions.push(...this.useWriteGood(text));

        const summary = this.createSummary(suggestions);

        return {
            suggestions,
            summary,
        };
    }

    private detectRepetitions(metrics: TextMetrics): Suggestion[] {
        if (metrics.repetitions.length === 0) return [];

        const totalRepetitions = metrics.repetitions.length;
        // Group all repetitions into one suggestion
        return [{
            id: 'repetitions-group',
            type: 'repetition',
            severity: totalRepetitions > 5 ? 'high' : 'medium',
            message: `${totalRepetitions} words frequently repeated`,
            position: { start: 0, end: 0 },
            explanation: 'Varying vocabulary keeps the reader engaged.',
            details: metrics.repetitions // Store the list here
        }];
    }

    private detectPassiveVoice(text: string): Suggestion[] {
        let count = 0;
        for (const pattern of this.passiveVoicePatterns) {
            const matches = text.match(pattern);
            if (matches) count += matches.length;
        }

        if (count === 0) return [];

        return [{
            id: 'passive-group',
            type: 'passive',
            severity: count > 3 ? 'medium' : 'low',
            message: `${count} sentences use passive voice`,
            position: { start: 0, end: 0 },
            explanation: 'Active voice is usually stronger and more direct.',
        }];
    }

    private detectCliches(text: string): Suggestion[] {
        let count = 0;
        const lowerText = text.toLowerCase();
        for (const cliche of this.cliches) {
            // Count occurrences naive way (overlapping not handled, but sufficient for estimates)
            let pos = lowerText.indexOf(cliche);
            while (pos !== -1) {
                count++;
                pos = lowerText.indexOf(cliche, pos + 1);
            }
        }

        if (count === 0) return [];

        return [{
            id: 'cliche-group',
            type: 'cliche',
            severity: 'low',
            message: `${count} clichés detected`,
            position: { start: 0, end: 0 },
            explanation: 'Clichés can make writing feel stale.',
        }];
    }

    private detectLongSentences(sentences: string[]): Suggestion[] {
        const details: any[] = [];
        for (const sentence of sentences) {
            const wordCount = sentence.split(/\s+/).length;
            if (wordCount > this.longSentenceThreshold) {
                details.push({
                    text: `...${sentence.substring(0, 40)}...`, // Truncated preview
                    fullText: sentence,
                    count: wordCount
                });
            }
        }

        if (details.length === 0) return [];

        return [{
            id: 'long-sentence-group',
            type: 'long-sentence',
            severity: details.length > 3 ? 'high' : 'medium',
            message: `${details.length} long sentences`,
            position: { start: 0, end: 0 },
            explanation: 'Long sentences can be hard to follow.',
            details: details
        }];
    }

    private detectComplexWords(words: string[]): Suggestion[] {
        const details: any[] = [];
        const uniqueComplex = new Set<string>();
        
        for (const word of words) {
            if (word.length > 12) {
                if (!uniqueComplex.has(word)) {
                    uniqueComplex.add(word);
                    details.push({ text: word });
                }
            }
        }
        
        if (details.length === 0) return [];

        return [{
            id: 'complex-word-group',
            type: 'complex-word',
            severity: 'low',
            message: `${details.length} complex words detected`,
            position: { start: 0, end: 0 },
            explanation: 'Simpler words are often easier to understand.',
            details: details
        }];
    }

    private useWriteGood(text: string): Suggestion[] {
        const details: any[] = [];
        try {
            // Import write-good dynamically to avoid issues
            const writeGood = require('write-good');

            const suggestions_raw = writeGood(text, {
                passive: false, // Handled separately
                illusion: true,
                so: true,
                thereIs: true,
                weasel: true,
                adverb: true,
                tooWordy: true,
                cliches: false, // Handled separately
            });
            
            suggestions_raw.forEach((s: any) => {
                 details.push({
                     text: s.reason,
                     context: `...${text.substring(Math.max(0, s.index - 10), Math.min(text.length, s.index + s.offset + 10))}...`
                 });
            });

        } catch (error) {
            console.warn('Write-good analysis failed:', error);
        }

        if (details.length === 0) return [];

        return [{
            id: 'grammar-group',
            type: 'grammar',
            severity: 'medium',
            message: `${details.length} grammar/style issues`,
            position: { start: 0, end: 0 },
            explanation: 'Review grammar and style suggestions.',
            details: details
        }];
    }

    private mapWriteGoodType(reason: string): Suggestion['type'] {
        // Not needed for aggregation
        return 'grammar';
    }

    private createSummary(suggestions: Suggestion[]) {
        const byType: Record<string, number> = {};
        const bySeverity: Record<string, number> = {};

        // In aggregated mode, total suggestions might be misleading if we just count items (e.g. 5 items = 5 categories)
        // User probably wants total ISSUES. But 'summary' logic depends on what we render. 
        // Let's count items for now, but maybe panel needs update.
        for (const suggestion of suggestions) {
            byType[suggestion.type] = (byType[suggestion.type] || 0) + 1;
            bySeverity[suggestion.severity] = (bySeverity[suggestion.severity] || 0) + 1;
        }

        return {
            total: suggestions.length,
            byType,
            bySeverity,
        };
    }
}
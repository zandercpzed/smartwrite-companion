import { TextMetrics, Suggestion, SuggestionsResult } from '../types';

export class SuggestionEngine {
    private passiveVoicePatterns: RegExp[];
    private cliches: Set<string>;
    private longSentenceThreshold: number;

    constructor(options: {
        longSentenceThreshold?: number;
        language?: string;
    } = {}) {
        this.longSentenceThreshold = options.longSentenceThreshold || 25;


        // Passive voice patterns
        if (options.language === 'pt') {
            this.passiveVoicePatterns = [
                /\b(fui|foi|fomos|foram|era|eram|será|serão|seria|seriam|tenho\s+sido|tem\s+sido|tinha\s+sido|terá\s+sido)\s+\w+([ai]do|to|so|cho)\b/gi,
            ];
            this.cliches = new Set([
                'no final das contas',
                'hoje em dia',
                'ao longo do tempo',
                'falar é fácil',
                'por último, mas não menos importante',
                'a verdade é que',
                'fazer a diferença',
                'nos dias de hoje',
                'em última análise',
            ]);
        } else {
            this.passiveVoicePatterns = [
                /\b(is|are|was|were|be|been|being)\s+(\w+ed|\w+en)\b/gi,
                /\b(has|have|had)\s+been\s+(\w+ed|\w+en)\b/gi,
            ];
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
    }

    async analyze(text: string, metrics: TextMetrics): Promise<SuggestionsResult> {
        const suggestions: Suggestion[] = [];

        // Detect repetitions
        suggestions.push(...this.detectRepetitions(metrics));

        // Detect passive voice
        suggestions.push(...this.detectPassiveVoice(text));

        // Detect clichés
        suggestions.push(...this.detectCliches(text));

        // Detect long sentences
        suggestions.push(...this.detectLongSentences(text, metrics.sentences));

        // Detect complex words
        suggestions.push(...this.detectComplexWords(text, metrics.words));

        // Use write-good for additional suggestions
        suggestions.push(...(await this.useWriteGood(text)));

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
        const results: Suggestion[] = [];
        for (const pattern of this.passiveVoicePatterns) {
            let match;
            pattern.lastIndex = 0; // Reset regex
            while ((match = pattern.exec(text)) !== null) {
                results.push({
                    id: `passive-${match.index}`,
                    type: 'passive',
                    severity: 'low',
                    message: `Passive voice: "${match[0]}"`,
                    position: { start: match.index, end: match.index + match[0].length },
                    explanation: 'Active voice is usually stronger and more direct.',
                });
            }
        }
        return results;
    }

    private detectCliches(text: string): Suggestion[] {
        const results: Suggestion[] = [];
        const lowerText = text.toLowerCase();
        for (const cliche of this.cliches) {
            let pos = lowerText.indexOf(cliche);
            while (pos !== -1) {
                results.push({
                    id: `cliche-${pos}`,
                    type: 'cliche',
                    severity: 'low',
                    message: `Cliché: "${cliche}"`,
                    position: { start: pos, end: pos + cliche.length },
                    explanation: 'Clichés can make writing feel stale.',
                });
                pos = lowerText.indexOf(cliche, pos + 1);
            }
        }
        return results;
    }

    private detectLongSentences(text: string, sentences: string[]): Suggestion[] {
        const results: Suggestion[] = [];
        let searchIndex = 0;

        for (const sentence of sentences) {
            const wordCount = sentence.split(/\s+/).length;
            if (wordCount > this.longSentenceThreshold) {
                const index = text.indexOf(sentence, searchIndex);
                if (index !== -1) {
                    results.push({
                        id: `long-sentence-${index}`,
                        type: 'long-sentence',
                        severity: wordCount > 40 ? 'high' : 'medium',
                        message: `Long sentence (${wordCount} words)`,
                        position: { start: index, end: index + sentence.length },
                        explanation: 'Long sentences can be hard to follow.',
                    });
                    searchIndex = index + sentence.length;
                }
            }
        }
        return results;
    }

    private detectComplexWords(text: string, words: string[]): Suggestion[] {
        const results: Suggestion[] = [];
        const complexSet = new Set<string>();
        
        words.forEach(word => {
            if (word.length > 15) complexSet.add(word); 
        });

        if (complexSet.size === 0) return [];

        let searchIndex = 0;
        for (const word of complexSet) {
             let pos = text.indexOf(word, searchIndex);
             while (pos !== -1) {
                 results.push({
                     id: `complex-${pos}`,
                     type: 'complex-word',
                     severity: 'low',
                     message: `Complex word: "${word}"`,
                     position: { start: pos, end: pos + word.length },
                     explanation: 'Simpler words are often easier to understand.',
                 });
                 pos = text.indexOf(word, pos + 1);
             }
        }

        return results;
    }

    private async useWriteGood(text: string): Promise<Suggestion[]> {
        const results: Suggestion[] = [];
        try {
            const writeGood = (await import('write-good')).default;
            const suggestions_raw = (writeGood as any)(text, {
                passive: false, // Handled separately
                illusion: true,
                so: true,
                thereIs: true,
                weasel: true,
                adverb: true,
                tooWordy: true,
                cliches: false, // Handled separately
            });
            
            interface WriteGoodSuggestion {
                index: number;
                offset: number;
                reason: string;
            }

            suggestions_raw.forEach((s: WriteGoodSuggestion) => {
                 results.push({
                     id: `grammar-${s.index}`,
                     type: 'grammar',
                     severity: 'medium',
                     message: s.reason,
                     position: { start: s.index, end: s.index + s.offset },
                     explanation: 'Review grammar and style suggestions.',
                 });
            });

        } catch (error) {
            console.warn('Write-good analysis failed:', error);
        }
        return results;
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
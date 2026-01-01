import { TextMetrics, ReadabilityScores } from '../types';

export class ReadabilityEngine {
    calculateScores(metrics: TextMetrics, language: string = 'en'): ReadabilityScores {
        const wordCount = metrics.words.length;
        const sentenceCount = metrics.sentences.length;
        const syllableCount = metrics.syllables;

        if (wordCount === 0 || sentenceCount === 0) {
            return this.getEmptyScores();
        }

        const avgWordsPerSentence = wordCount / sentenceCount;
        const avgSyllablesPerWord = syllableCount / wordCount;

        // Flesch Reading Ease
        const fleschReadingEase = this.calculateFleschReadingEase(avgSyllablesPerWord, avgWordsPerSentence, language);

        // Flesch-Kincaid Grade Level
        const fleschKincaidGrade = this.calculateFleschKincaidGrade(avgSyllablesPerWord, avgWordsPerSentence);

        // Gunning Fog Index
        const gunningFog = this.calculateGunningFog(avgWordsPerSentence, this.countComplexWords(metrics.words));

        // Coleman-Liau Index
        const colemanLiau = this.calculateColemanLiau(metrics.characters, wordCount, sentenceCount);

        // Automated Readability Index
        const automatedReadability = this.calculateAutomatedReadability(metrics.characters, wordCount, sentenceCount);

        // Dale-Chall Readability Score (simplified)
        const daleChall = this.calculateDaleChall(avgWordsPerSentence, this.countDifficultWords(metrics.words));

        const overallLevel = this.determineOverallLevel(fleschReadingEase);
        const interpretation = this.getInterpretation(overallLevel);

        return {
            fleschReadingEase,
            fleschKincaidGrade,
            gunningFog,
            colemanLiau,
            automatedReadability,
            daleChall,
            overallLevel,
            interpretation,
        };
    }

    private calculateFleschReadingEase(avgSyllablesPerWord: number, avgWordsPerSentence: number, language: string = 'en'): number {
        // Flesch Reading Ease (Standard EN): 206.835 - 1.015 × (words/sentences) - 84.6 × (syllables/words)
        // Flesch Reading Ease (Martins adaptation for PT): 248.835 - 1.015 × (words/sentences) - 84.6 × (syllables/words)
        const constant = (language === 'pt') ? 248.835 : 206.835;
        return constant - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
    }

    private calculateFleschKincaidGrade(avgSyllablesPerWord: number, avgWordsPerSentence: number): number {
        // Flesch-Kincaid Grade Level: 0.39 × (words/sentences) + 11.8 × (syllables/words) - 15.59
        return (0.39 * avgWordsPerSentence) + (11.8 * avgSyllablesPerWord) - 15.59;
    }

    private calculateGunningFog(avgWordsPerSentence: number, complexWordCount: number): number {
        // Gunning Fog Index: 0.4 × [(words/sentences) + 100 × (complex words/words)]
        const complexWordPercentage = complexWordCount / 100;
        return 0.4 * (avgWordsPerSentence + complexWordPercentage);
    }

    private calculateColemanLiau(characterCount: number, wordCount: number, sentenceCount: number): number {
        // Coleman-Liau Index: 0.0588 × L - 0.296 × S - 15.8
        // L = average number of letters per 100 words
        // S = average number of sentences per 100 words
        const L = (characterCount / wordCount) * 100;
        const S = (sentenceCount / wordCount) * 100;
        return (0.0588 * L) - (0.296 * S) - 15.8;
    }

    private calculateAutomatedReadability(characterCount: number, wordCount: number, sentenceCount: number): number {
        // Automated Readability Index: 4.71 × (characters/words) + 0.5 × (words/sentences) - 21.43
        const avgCharsPerWord = characterCount / wordCount;
        const avgWordsPerSentence = wordCount / sentenceCount;
        return (4.71 * avgCharsPerWord) + (0.5 * avgWordsPerSentence) - 21.43;
    }

    private calculateDaleChall(avgWordsPerSentence: number, difficultWordCount: number): number {
        // Simplified Dale-Chall: 0.1579 × (difficult words/words × 100) + 0.0496 × (words/sentences)
        const difficultWordPercentage = (difficultWordCount / 100) * 100;
        return (0.1579 * difficultWordPercentage) + (0.0496 * avgWordsPerSentence);
    }

    private countComplexWords(words: string[]): number {
        // Words with 3+ syllables are considered complex
        return words.filter(word => this.countSyllablesInWord(word) >= 3).length;
    }

    private countDifficultWords(words: string[]): number {
        // Simplified: words longer than 6 characters or with many syllables
        return words.filter(word =>
            word.length > 6 || this.countSyllablesInWord(word) >= 3
        ).length;
    }

    private countSyllablesInWord(word: string): number {
        // Simple syllable counting (not perfect, but good enough)
        word = word.toLowerCase();
        if (word.length <= 3) return 1;

        word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
        word = word.replace(/^y/, '');

        const syllables = word.match(/[aeiouy]{1,2}/g);
        return syllables ? syllables.length : 1;
    }

    private determineOverallLevel(fleschScore: number): ReadabilityScores['overallLevel'] {
        if (fleschScore >= 90) return 'very-easy';
        if (fleschScore >= 80) return 'easy';
        if (fleschScore >= 70) return 'fairly-easy';
        if (fleschScore >= 60) return 'standard';
        if (fleschScore >= 50) return 'fairly-difficult';
        if (fleschScore >= 30) return 'difficult';
        return 'very-difficult';
    }

    private getInterpretation(level: ReadabilityScores['overallLevel']): string {
        const interpretations = {
            'very-easy': 'Very easy to read. Easily understood by an average 11-year-old student.',
            'easy': 'Easy to read. Conversational English for consumers.',
            'fairly-easy': 'Fairly easy to read.',
            'standard': 'Standard readability. Understood by 13- to 15-year-old students.',
            'fairly-difficult': 'Fairly difficult to read.',
            'difficult': 'Difficult to read. Best understood by college graduates.',
            'very-difficult': 'Very difficult to read. Best understood by university graduates.',
        };
        return interpretations[level];
    }

    private getEmptyScores(): ReadabilityScores {
        return {
            fleschReadingEase: 0,
            fleschKincaidGrade: 0,
            gunningFog: 0,
            colemanLiau: 0,
            automatedReadability: 0,
            daleChall: 0,
            overallLevel: 'standard',
            interpretation: 'No text to analyze.',
        };
    }
}
export interface TextMetrics {
    words: string[];
    sentences: string[];
    paragraphs: string[];
    characters: number;
    charactersNoSpaces: number;
    syllables: number;
    wordFrequency: Map<string, number>;
    repetitions: Array<{ word: string; count: number }>;
}

export type Language = 'en' | 'pt' | 'es' | 'fr' | 'de';

export interface TextStats {
    wordCount: number;
    sentenceCount: number;
    paragraphCount: number;
    characterCount: number;
    characterCountNoSpaces: number;
    syllableCount: number;
    averageWordLength: number;
    averageSentenceLength: number;
    averageSyllablesPerWord: number;
    readingTimeMinutes: number;
    wordFrequency: Map<string, number>;
    topWords: Array<[string, number]>;
}

export interface SessionStats {
    startTime: Date;
    endTime?: Date;
    wordsWritten: number;
    timeSpent: number;
    wpm: number;
    progress: number;
}

export interface Suggestion {
    id: string;
    type: 'repetition' | 'passive' | 'cliche' | 'long-sentence' | 'complex-word' | 'grammar';
    severity: 'low' | 'medium' | 'high';
    message: string;
    position: {
        start: number;
        end: number;
    };
    replacement?: string;
    explanation?: string;
    details?: any;
}

export interface SuggestionsResult {
    suggestions: Suggestion[];
    summary: {
        total: number;
        byType: Record<string, number>;
        bySeverity: Record<string, number>;
    };
}

export interface ReadabilityScores {
    fleschReadingEase: number;
    fleschKincaidGrade: number;
    gunningFog: number;
    colemanLiau: number;
    automatedReadability: number;
    daleChall: number;
    overallLevel: 'very-easy' | 'easy' | 'fairly-easy' | 'standard' | 'fairly-difficult' | 'difficult' | 'very-difficult';
    interpretation: string;
}

export interface DailyProgress {
    date: string;
    wordsWritten: number;
    goal: number;
    sessions: SessionStats[];
}
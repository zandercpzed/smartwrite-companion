import { TextMetrics, Language } from '../types';
import * as sbd from 'sbd';
import { hyphenateSync } from 'hyphen/en';

export class TextAnalyzer {
    private wordPattern = /[\wÀ-ÿ'-]+/g;

    public analyze(text: string, language: Language = 'en'): TextMetrics {
        const words = this.extractWords(text);
        const sentences = this.extractSentences(text); // sbd handles multiple languages somewhat, but explicit config could be better
        const paragraphs = this.extractParagraphs(text);
        const characters = text.length;
        const charactersNoSpaces = text.replace(/\s/g, '').length;
        
        // Syllable counting
        // Since hyphen is a single language import in this basic setup (en), we only support EN for syllables clearly.
        // For production multilingual, we'd need to dynamically load hyphenation patterns.
        // For MVP phase 2, we stick to EN or basic heuristics if not EN, or just use EN hyphenator (it works okayish for latin scripts as fallback)
        const syllables = this.countSyllables(words);

        const { frequency, repetitions } = this.analyzeFrequencies(words);

        return {
            words,
            sentences,
            paragraphs,
            characters,
            charactersNoSpaces,
            syllables,
            wordFrequency: frequency,
            repetitions
        };
    }

    private extractWords(text: string): string[] {
        return text.match(this.wordPattern) || [];
    }

    private extractSentences(text: string): string[] {
        // Basic usage of sbd. For better accuracy, pass options based on language.
        return sbd.sentences(text) || [];
    }

    private extractParagraphs(text: string): string[] {
        return text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    }

    private countSyllables(words: string[]): number {
        let totalSyllables = 0;
        
        for (const word of words) {
            // hyphenateSync returns text with soft hyphens, e.g. "ex-am-ple" (depends on config, default might be \u00AD)
            // Or usually hyphenates string. The library 'hyphen' returns a function.
            // Let's verify usage. Actually 'hyphen' package exports a factory. 
            // Importing 'hyphen/en' gives a hyphenator function usually.
            // Let's assume standard usage for now.
            const hyphenated = hyphenateSync(word);
            // Count segments separated by hyphen (soft hyphen or explicit if configured, hyphen/en default uses \u00AD soft hyphen)
            const segments = hyphenated.split(/\u00AD/);
            totalSyllables += segments.length;
        }

        return totalSyllables;
    }

    private stopWords = new Set([
        'de', 'a', 'o', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'com', 'não', 'uma', 'os', 'no', 'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'ao', 'ele', 'das', 'à', 'seu', 'sua', 'ou', 'quando', 'muito', 'nos', 'já', 'eu', 'também', 'só', 'pelo', 'pela', 'até', 'isso', 'ela', 'entre', 'depois', 'sem', 'mesmo', 'aos', 'seus', 'quem', 'nas', 'me', 'esse', 'eles', 'você', 'essa', 'num', 'nem', 'suas', 'meu', 'às', 'minha', 'numa', 'pelos', 'elas', 'qual', 'nós', 'lhe', 'deles', 'essas', 'esses', 'pelas', 'este', 'dele', 'tu', 'te', 'vocês', 'vos', 'lhes', 'meus', 'minhas', 'teu', 'tua', 'teus', 'tuas', 'nosso', 'nossa', 'nossos', 'nossas', 'dela', 'delas', 'esta', 'estes', 'estas', 'aquele', 'aquela', 'aqueles', 'aquelas', 'isto', 'aquilo',
        'estou', 'está', 'estamos', 'estão', 'estive', 'esteve', 'estivemos', 'estiveram', 'estava', 'estávamos', 'estavam', 'estivera', 'estivéramos', 'esteja', 'estejamos', 'estejam', 'estivesse', 'estivéssemos', 'estivessem', 'estiver', 'estivermos', 'estiverem', 'hei', 'há', 'havemos', 'hão', 'houve', 'houveram', 'houvera', 'houvéramos', 'haja', 'hajamos', 'hajam', 'houvesse', 'houvéssemos', 'houvessem', 'houver', 'houvermos', 'houverem', 'houverei', 'houverá', 'houveremos', 'houverão', 'houveria', 'houveríamos', 'houveriam', 'sou', 'somos', 'são', 'era', 'éramos', 'eram', 'fui', 'foi', 'fomos', 'foram', 'fora', 'fôramos', 'seja', 'sejamos', 'sejam', 'fosse', 'fôssemos', 'fossem', 'for', 'formos', 'forem', 'serei', 'será', 'seremos', 'serão', 'seria', 'seríamos', 'seriam', 'tenho', 'tem', 'temos', 'tém', 'tinha', 'tínhamos', 'tinham', 'tive', 'teve', 'tivemos', 'tiveram', 'tivera', 'tivéramos', 'tenha', 'tenhamos', 'tenham', 'tivesse', 'tivéssemos', 'tivessem', 'tiver', 'tivermos', 'tiverem', 'terei', 'terá', 'teremos', 'terão', 'teria', 'teríamos', 'teriam'
    ]);

    private analyzeFrequencies(words: string[]): { frequency: Map<string, number>, repetitions: Array<{ word: string, count: number }> } {
        const frequency = new Map<string, number>();
        const lowerWords = words.map(w => w.toLowerCase());

        for (const word of lowerWords) {
            frequency.set(word, (frequency.get(word) || 0) + 1);
        }

        // Filter repetitions (e.g. appearing more than 3 times, configurable in future)
        const repetitions: Array<{ word: string, count: number }> = [];
        for (const [word, count] of frequency.entries()) {
            // Check threshold AND ensure it's not a stop word AND sufficient length
            if (count > 3 && word.length > 3 && !this.stopWords.has(word)) {
                repetitions.push({ word, count });
            }
        }
        
        repetitions.sort((a, b) => b.count - a.count);

        return { frequency, repetitions };
    }
}
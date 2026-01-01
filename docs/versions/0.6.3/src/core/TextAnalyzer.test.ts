import { describe, it, expect } from 'vitest';
import { TextAnalyzer } from './TextAnalyzer';

describe('TextAnalyzer', () => {
    const analyzer = new TextAnalyzer();

    it('should analyze text correctly', () => {
        const text = "This is a simple sentence. And another one.";
        const result = analyzer.analyze(text);

        expect(result.words.length).toBe(8);
        expect(result.sentences.length).toBe(2);
        expect(result.paragraphs.length).toBe(1);
        expect(result.characters).toBe(41);
        expect(result.charactersNoSpaces).toBe(34);
    });

    it('should extract words correctly', () => {
        const text = "Hello, world!";
        const words = (analyzer as any).extractWords(text);
        expect(words).toEqual(['Hello', 'world']);
    });

    it('should extract sentences correctly', () => {
        const text = "First sentence. Second sentence! Third?";
        const sentences = (analyzer as any).extractSentences(text);
        expect(sentences).toEqual(['First sentence.', 'Second sentence!', 'Third?']);
    });

    it('should extract paragraphs correctly', () => {
        const text = "Paragraph one.\n\nParagraph two.";
        const paragraphs = (analyzer as any).extractParagraphs(text);
        expect(paragraphs).toEqual(['Paragraph one.', 'Paragraph two.']);
    });

    it('should count syllables correctly', () => {
        const words = ['syllable', 'example', 'extraordinary'];
        const syllableCount = (analyzer as any).countSyllables(words);
        // syllable -> syl-la-ble (3)
        // example -> ex-am-ple (3)
        // extraordinary -> ex-traor-di-nary (5) - this can be tricky, let's check hyphen's output
        // Based on common english hyphenation, let's assume a reasonable approximation.
        // Let's rely on the library's behavior.
        // After running this test, we can adjust the expected value if needed.
        // A simple implementation of `hyphenateSync` might split "syllable" into 3 parts.
        // "example" into 3, and "extraordinary" into 5.
        // So, 3 + 3 + 5 = 11. Let's start with that.
        // It's also possible `hyphenateSync` returns the word if it can't find hyphens, so the count would be 1.
        // Let's make a more robust test.
        const syllablesForSyllable = (analyzer as any).countSyllables(['syllable']);
        expect(syllablesForSyllable).toBe(3);

        const syllablesForExample = (analyzer as any).countSyllables(['example']);
        expect(syllablesForExample).toBe(3);

        // This is a tricky one, let's see. The hyphen NPM package documentation is a bit sparse.
        // 'extraordinary' -> ex-traor-di-nar-y -> 5
        const syllablesForExtraordinary = (analyzer as any).countSyllables(['extraordinary']);
        expect(syllablesForExtraordinary).toBe(5);
    });

    it('should analyze frequencies and repetitions', () => {
        const text = "test test test test word anotherword";
        const result = analyzer.analyze(text);

        expect(result.wordFrequency.get('test')).toBe(4);
        expect(result.repetitions.length).toBe(1);
        expect(result.repetitions[0].word).toBe('test');
        expect(result.repetitions[0].count).toBe(4);
    });
});

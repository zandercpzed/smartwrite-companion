import SmartWriteCompanionPlugin from '../main';

export interface TranslationResult {
    translatedText: string;
    chunks: number;
    error?: string;
}

export class TranslationService {
    private plugin: SmartWriteCompanionPlugin;
    private readonly CHUNK_SIZE = 4000; // ~1000-1500 tokens, safe for 8k models

    constructor(plugin: SmartWriteCompanionPlugin) {
        this.plugin = plugin;
    }

    /**
     * Translates a large text by splitting it into chunks and maintaining context.
     * @param text The full text to translate
     * @param sourceLang The source language (e.g. 'English')
     * @param targetLang The target language (e.g. 'Portuguese given the context of a Novel')
     * @param onProgress Callback for UI updates
     */
    async translateProject(
        text: string, 
        sourceLang: string, 
        targetLang: string,
        onProgress?: (status: string, percent: number) => void
    ): Promise<TranslationResult> {
        
        if (!this.plugin.settings.ollamaEnabled) {
            return { translatedText: '', chunks: 0, error: 'Ollama is disabled' };
        }

        const chunks = this.splitText(text);
        const translatedParts: string[] = [];
        let previousContextSummary = "";

        if (onProgress) onProgress('Preparing translation...', 0);

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const currentPart = i + 1;
            const totalParts = chunks.length;

            if (onProgress) {
                onProgress(
                    `Translating part ${currentPart}/${totalParts}...`, 
                    Math.round((i / totalParts) * 100)
                );
            }

            // 1. Construct Prompt
            let systemPrompt = `You are a professional literary translator. Translate the following text from ${sourceLang} to ${targetLang}. Preserve the tone, style, and formatting (markdown).`;
            
            if (previousContextSummary) {
                systemPrompt += `\n\nCONTEXT FROM PREVIOUS CHAPTERS: ${previousContextSummary}\nUse this context to maintain consistency in names, gender, and terminology.`;
            }

            const userPrompt = `Translate this segment:\n\n${chunk}`;

            try {
                // 2. Translate Chunk
                const translation = await this.plugin.ollamaService.generateCompletion(
                    userPrompt,
                    { system: systemPrompt }
                );
                translatedParts.push(translation);

                // 3. Generate Summary for Next Chunk (only if there is a next chunk)
                if (i < chunks.length - 1) {
                    const summaryPrompt = `Summarize the following text in 2 sentences, focusing on active characters and key events. Use English. Text:\n\n${translation}`;
                    previousContextSummary = await this.plugin.ollamaService.generateCompletion(summaryPrompt);
                }

            } catch (e) {
                console.error(`Translation failed at chunk ${i}`, e);
                return { 
                    translatedText: translatedParts.join('\n\n'), 
                    chunks: i, 
                    error: `Failed at part ${currentPart}: ${e instanceof Error ? e.message : 'Unknown error'}` 
                };
            }
        }

        if (onProgress) onProgress('Finalizing...', 100);

        return {
            translatedText: translatedParts.join('\n\n'), // Simple join, or we can use a delimiter
            chunks: chunks.length
        };
    }

    private splitText(text: string): string[] {
        const chunks: string[] = [];
        let currentIndex = 0;

        while (currentIndex < text.length) {
            let endIndex = currentIndex + this.CHUNK_SIZE;
            
            if (endIndex >= text.length) {
                endIndex = text.length;
            } else {
                // Find nearest paragraph break to avoid cutting sentences
                const lastNewline = text.lastIndexOf('\n', endIndex);
                if (lastNewline > currentIndex) {
                    endIndex = lastNewline;
                }
            }

            chunks.push(text.slice(currentIndex, endIndex));
            currentIndex = endIndex;
        }

        return chunks;
    }
}

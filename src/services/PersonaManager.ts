import SmartWriteCompanionPlugin from '../main';
import { Persona, PersonaAnalysisResult } from '../types';
import { BUILTIN_PERSONAS } from '../personas/library';

export class PersonaManager {
    private plugin: SmartWriteCompanionPlugin;
    private personas: Map<string, Persona> = new Map();
    private isAnalyzingStatus: boolean = false;
    private currentAbortController: AbortController | null = null;
    private currentTaskName: string | null = null;
    private currentProgress: number = 0;
    private pendingQueue: Array<{
        personaId: string;
        personaName: string;
        text: string;
        language?: string;
        onProgress?: (status: string, percent: number) => void;
        resolve: (result: PersonaAnalysisResult) => void;
    }> = [];

    constructor(plugin: SmartWriteCompanionPlugin) {
        this.plugin = plugin;
        this.initializePersonas();
        this.loadCustomPersonas();
    }

    private loadCustomPersonas(): void {
        const customs = this.plugin.settings.customPersonas || [];
        customs.forEach(persona => {
            this.personas.set(persona.id, persona);
        });
    }

    public reloadPersonas(): void {
        this.personas.clear();
        this.initializePersonas();
        this.loadCustomPersonas();
    }

    private initializePersonas(): void {
        BUILTIN_PERSONAS.forEach(p => {
            this.personas.set(p.id, p);
        });
    }

    /**
     * Get a specific persona by ID
     */
    getPersona(id: string): Persona | undefined {
        return this.personas.get(id);
    }

    /**
     * Get only ENABLED personas based on settings
     */
    listPersonas(): Persona[] {
        const enabledIds = this.plugin.settings.enabledPersonas || [];
        return Array.from(this.personas.values()).filter(p => enabledIds.includes(p.id));
    }

    /**
     * Get ALL registered personas (for settings UI)
     */
    listAllPersonas(): Persona[] {
        return Array.from(this.personas.values());
    }

    /**
     * Analyze text using a specific persona
     */
    async analyzeText(
        personaId: string, 
        text: string, 
        language?: string,
        onProgress?: (status: string, percent: number) => void,
        forceQueue: boolean = false
    ): Promise<PersonaAnalysisResult | { isBusy: boolean, personaName: string }> {
        if (this.isAnalyzingStatus) {
            const persona = this.getPersona(personaId);
            const name = persona ? persona.name : personaId;

            if (forceQueue) {
                return new Promise((resolve) => {
                    this.pendingQueue.push({ personaId, personaName: name, text, language, onProgress, resolve });
                });
            }

            return { isBusy: true, personaName: name };
        }

        const persona = this.getPersona(personaId);
        if (!persona) {
            return {
                personaId,
                personaName: 'Unknown',
                timestamp: Date.now(),
                analysis: '',
                error: `Persona '${personaId}' not found`
            };
        }

        if (!this.plugin.settings.ollamaEnabled) {
            return {
                personaId,
                personaName: persona.name,
                timestamp: Date.now(),
                analysis: '',
                error: 'Ollama is disabled in settings'
            };
        }

        this.isAnalyzingStatus = true;
        this.currentAbortController = new AbortController();
        try {
            // Text chunking logic
            const CHUNK_SIZE = 12000; // Characters approx ~3000 tokens
            const chunks: string[] = [];
            
            for (let i = 0; i < text.length; i += CHUNK_SIZE) {
                chunks.push(text.slice(i, i + CHUNK_SIZE));
            }

            const totalChunks = chunks.length;
            const analyses: string[] = [];
            this.currentTaskName = persona.name;
            this.currentProgress = 0;

            if (onProgress) onProgress('Initializing analysis...', 0);

            for (let i = 0; i < totalChunks; i++) {
                const chunk = chunks[i];
                const partPercent = Math.round(((i) / totalChunks) * 100);
                this.currentProgress = partPercent;
                if (onProgress) onProgress(`Analyzing part ${i + 1} of ${totalChunks}...`, partPercent);

                const userPrompt = totalChunks > 1 
                    ? `[PART ${i+1}/${totalChunks}] Please analyze this segment. Focus on local issues within this text block:\n\n${chunk}`
                    : `Please analyze the following text:\n\n${chunk}\n\nProvide your analysis following the format described in your instructions.`;

                // Language Injection
                let systemPrompt = persona.systemPrompt;
                if (language && language !== 'auto') {
                    const langName = this.getLanguageName(language);
                    systemPrompt += `\n\nCRITICAL INSTRUCTION: You use the persona defined above, BUT you MUST write your response in ${langName}. Do not verify the user's language, just output in ${langName}.`;
                }

                // Call Ollama with the persona's system prompt
                const result = await this.plugin.ollamaService.generateCompletion(
                    userPrompt,
                    { system: systemPrompt },
                    this.currentAbortController?.signal
                );
                
                analyses.push(result);
            }
            
            if (onProgress) onProgress('Finalizing...', 100);
            this.currentProgress = 100;

            const finalAnalysis = totalChunks > 1 
                ? `**Note:** This text was analyzed in ${totalChunks} parts.\n\n` + analyses.map((a, i) => `### Part ${i+1} analysis\n${a}`).join('\n\n---\n\n')
                : analyses[0];

            return {
                personaId,
                personaName: persona.name,
                timestamp: Date.now(),
                analysis: finalAnalysis
            };
        } catch (error) {
            if (error.name === 'AbortError' || error.message?.includes('abort')) {
                return {
                    personaId,
                    personaName: persona.name,
                    timestamp: Date.now(),
                    analysis: '',
                    error: 'Analysis cancelled by user'
                };
            }
            console.error('Persona Analysis Error:', error);
            return {
                personaId,
                personaName: persona.name,
                timestamp: Date.now(),
                analysis: '',
                error: (error as Error).message
            };
        } finally {
            this.isAnalyzingStatus = false;
            this.currentAbortController = null;
            this.currentTaskName = null;
            this.currentProgress = 0;
            // Trigger next in queue if any
            void this.processQueue();
        }
    }

    public getStatus() {
        return {
            isBusy: this.isAnalyzingStatus,
            taskName: this.currentTaskName,
            progress: this.currentProgress
        };
    }

    public getQueue() {
        return this.pendingQueue.map((t, i) => ({
            index: i,
            personaName: t.personaName
        }));
    }

    public cancelQueuedTask(index: number): void {
        if (index >= 0 && index < this.pendingQueue.length) {
            const task = this.pendingQueue.splice(index, 1)[0];
            task.resolve({
                personaId: task.personaId,
                personaName: task.personaName,
                timestamp: Date.now(),
                analysis: '',
                error: 'Queued task removed by user'
            });
        }
    }

    /**
     * Cancels the current analysis task
     */
    cancelAnalysis(): void {
        if (this.currentAbortController) {
            this.currentAbortController.abort();
            this.currentAbortController = null;
        }
        this.isAnalyzingStatus = false;
        this.pendingQueue = [];
    }

    private async processQueue(): Promise<void> {
        if (this.pendingQueue.length === 0 || this.isAnalyzingStatus) return;

        const nextTask = this.pendingQueue.shift();
        if (nextTask) {
            const result = await this.analyzeText(
                nextTask.personaId,
                nextTask.text,
                nextTask.language,
                nextTask.onProgress
            ) as PersonaAnalysisResult;
            nextTask.resolve(result);
        }
    }

    /**
     * Specialized analysis for background triggers (silent, no file creation notice)
     */
    async backgroundAnalyze(personaId: string, text: string, language: string): Promise<string | null> {
        const persona = this.getPersona(personaId);
        if (!persona || this.isAnalyzingStatus) return null;

        this.isAnalyzingStatus = true;
        try {
            // Simplified prompt for background feedback
            let systemPrompt = persona.systemPrompt;
            if (language && language !== 'auto') {
                systemPrompt += `\n\nCRITICAL INSTRUCTION: You use the persona defined above, BUT you MUST write your response in ${this.getLanguageName(language)}. Do not verify the user's language, just output in ${this.getLanguageName(language)}.`;
            }

            const result = await this.plugin.ollamaService.generateCompletion(
                `Briefly analyze this text and provide 3 focal points for improvement:\n\n${text.slice(-5000)}`, // Only look at last 5k chars for background speed
                { system: systemPrompt }
            );
            return result;
        } catch (error) {
            console.error('Background analysis failed:', error);
            return null;
        } finally {
            this.isAnalyzingStatus = false;
        }
    }

    private getLanguageName(code: string): string {
        const map: Record<string, string> = {
            'pt-br': 'Portuguese (Brazil)',
            'en-us': 'English (US)',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German'
        };
        return map[code] || 'English';
    }
}

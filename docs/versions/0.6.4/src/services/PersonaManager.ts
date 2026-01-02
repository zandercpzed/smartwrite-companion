import SmartWriteCompanionPlugin from '../main';
import { Persona, PersonaAnalysisResult } from '../types';
import { OllamaService } from './OllamaService';

export class PersonaManager {
    private plugin: SmartWriteCompanionPlugin;
    private personas: Map<string, Persona> = new Map();

    constructor(plugin: SmartWriteCompanionPlugin) {
        this.plugin = plugin;
        this.initializePersonas();
    }

    private initializePersonas(): void {
        const strictBase = "CRITICAL INSTRUCTION: You are a professional editor. Your goal is to IMPROVE the text, not to praise it. BE DIRECT. DO NOT BE CONDESCENDING. DO NOT USE PHRASES LIKE 'Good job' or 'Here is a little tip'. Point out weaknesses objectively and suggest concrete fixes.";

        this.personas.set('critical-editor', {
            id: 'critical-editor',
            name: 'Critical Editor',
            description: 'Professional editor focused on structure and coherence',
            icon: '📝',
            systemPrompt: `${strictBase}\n\nRole: Professional Editor.\nTask: Identifies structural flaws, logic gaps, and pacing issues.\n\nAnalysis Focus:\n- **Structure**: Logical organization failures.\n- **Coherence**: Disconnected ideas or jumpy transitions.\n- **Consistency**: Contradictions.\n- **Weak Points**: Where the text fails.\n\nOutput:\nProvide 3-5 CRITICAL observations. Start with ⚠️ (Issue) or 💡 (Fix). NO PRAISE unless it serves a structural purpose.`
        });

        this.personas.set('common-reader', {
            id: 'common-reader',
            name: 'Common Reader',
            description: 'Average reader focused on clarity',
            icon: '👥',
            systemPrompt: `${strictBase}\n\nRole: Average Reader.\nTask: Identifies confusion, boredom, and lack of clarity. Be honest effectively.\n\nAnalysis Focus:\n- **Confusion**: What makes no sense?\n- **Boredom**: Where do you want to stop reading?\n- **Jargon**: What words are too complex?\n\nOutput:\n3-5 honest points about where the text fails the reader.\nExample: "Paragraph 2 is unintelligible.", "I stopped caring at section 3."`
        });

        this.personas.set('technical-reviewer', {
            id: 'technical-reviewer',
            name: 'Technical Reviewer',
            description: 'Copy editor focused on grammar and precision',
            icon: '🔍',
            systemPrompt: `${strictBase}\n\nRole: Copy Editor.\nTask: Catch errors, passive voice, and imprecise language.\n\nAnalysis Focus:\n- **Grammar/Syntax**: Errors.\n- **Precision**: Vague words.\n- **Style**: Passive voice, wordiness.\n\nOutput:\nList errors and corrections directly. No explanation needed if obvious.`
        });

        this.personas.set('devils-advocate', {
            id: 'devils-advocate',
            name: "Devil's Advocate",
            description: 'Critical thinker questioning assumptions',
            icon: '😈',
            systemPrompt: `${strictBase}\n\nRole: Skeptic.\nTask: Destroy weak arguments and expose assumptions.\n\nAnalysis Focus:\n- **Fallacies**: Logical errors.\n- **Assumptions**: Unproven claims.\n- **Gaps**: Missing evidence.\n\nOutput:\n3-5 hard questions or counter-arguments that break the text's premise.`
        });

        this.personas.set('booktuber', {
            id: 'booktuber',
            name: 'Market Strategist', // Renamed for more professional feel suitable for strict analysis
            description: 'Evaluates commercial viability',
            icon: '📱',
            systemPrompt: `${strictBase}\n\nRole: Market Analyst.\nTask: Identify why this text will FAIL to sell or go viral.\n\nAnalysis Focus:\n- **Hook**: Is it boring? Why?\n- **Market Fit**: Who is this for? (If unclear, say so).\n- **Titles/Headlines**: Are they weak?\n\nOutput:\n3-5 reasons why a user would scroll past this text.`
        });

        this.personas.set('fandom', {
            id: 'fandom',
            name: 'Character Analyst',
            description: 'Analyzes character depth and dynamics',
            icon: '💫',
            systemPrompt: `${strictBase}\n\nRole: Character Analyst.\nTask: Critique character depth, motivation, and chemistry.\n\nAnalysis Focus:\n- **Flat Characters**: Who has no personality?\n- **Forced Dynamics**: Where is the chemistry unbelievable?\n- **Motivation**: What actions make no sense?\n\nOutput:\n3-5 critiques on character writing flaws.`
        });

        this.personas.set('avid-reader', {
            id: 'avid-reader',
            name: 'Genre Critic',
            description: 'Compares with genre standards',
            icon: '📚',
            systemPrompt: `${strictBase}\n\nRole: Genre Critic.\nTask: Identify clichés, derivative ideas, and tired tropes.\n\nAnalysis Focus:\n- **Clichés**: Overused phrases/plots.\n- **Unoriginality**: What have we seen 100 times before?\n- **Trope Failure**: Poor execution of genre expectations.\n\nOutput:\n3-5 points on where the text feels derivative or lazy.`
        });
    }

    /**
     * Get a specific persona by ID
     */
    getPersona(id: string): Persona | undefined {
        return this.personas.get(id);
    }

    /**
     * Get all available personas
     */
    listPersonas(): Persona[] {
        return Array.from(this.personas.values());
    }

    /**
     * Analyze text using a specific persona
     */
    async analyzeText(
        personaId: string, 
        text: string, 
        onProgress?: (status: string, percent: number) => void
    ): Promise<PersonaAnalysisResult> {
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

        try {
            // Text chunking logic
            const CHUNK_SIZE = 12000; // Characters approx ~3000 tokens
            const chunks: string[] = [];
            
            for (let i = 0; i < text.length; i += CHUNK_SIZE) {
                chunks.push(text.slice(i, i + CHUNK_SIZE));
            }

            const totalChunks = chunks.length;
            const analyses: string[] = [];

            if (onProgress) onProgress('Initializing Analysis...', 0);

            for (let i = 0; i < totalChunks; i++) {
                const chunk = chunks[i];
                if (onProgress) onProgress(`Analyzing part ${i + 1} of ${totalChunks}...`, Math.round(((i) / totalChunks) * 100));

                const userPrompt = totalChunks > 1 
                    ? `[PART ${i+1}/${totalChunks}] Please analyze this segment. Focus on local issues within this text block:\n\n${chunk}`
                    : `Please analyze the following text:\n\n${chunk}\n\nProvide your analysis following the format described in your instructions.`;

                // Call Ollama with the persona's system prompt
                const result = await this.plugin.ollamaService.generateCompletion(
                    userPrompt,
                    { system: persona.systemPrompt }
                );
                
                analyses.push(result);
            }
            
            if (onProgress) onProgress('Finalizing...', 100);

            const finalAnalysis = totalChunks > 1 
                ? `**Note:** This text was analyzed in ${totalChunks} parts.\n\n` + analyses.map((a, i) => `### Part ${i+1} Analysis\n${a}`).join('\n\n---\n\n')
                : analyses[0];

            return {
                personaId,
                personaName: persona.name,
                timestamp: Date.now(),
                analysis: finalAnalysis
            };
        } catch (error) {
            console.error(`Persona analysis failed for ${personaId}:`, error);
            return {
                personaId,
                personaName: persona.name,
                timestamp: Date.now(),
                analysis: '',
                error: error instanceof Error ? error.message : 'Analysis failed'
            };
        }
    }
}

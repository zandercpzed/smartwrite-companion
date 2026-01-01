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
        // Define personas with their prompts loaded from markdown files
        const personaDefinitions: Persona[] = [
            {
                id: 'critical-editor',
                name: 'Critical Editor',
                description: 'Professional editor focused on structure and coherence',
                systemPrompt: this.loadPrompt('critical-editor'),
                icon: '📝'
            },
            {
                id: 'common-reader',
                name: 'Common Reader',
                description: 'Average reader evaluating clarity and engagement',
                systemPrompt: this.loadPrompt('common-reader'),
                icon: '👥'
            },
            {
                id: 'technical-reviewer',
                name: 'Technical Reviewer',
                description: 'Copy editor focused on grammar and style',
                systemPrompt: this.loadPrompt('technical-reviewer'),
                icon: '🔍'
            },
            {
                id: 'devils-advocate',
                name: "Devil's Advocate",
                description: 'Critical thinker questioning assumptions',
                systemPrompt: this.loadPrompt('devils-advocate'),
                icon: '😈'
            },
            {
                id: 'booktuber',
                name: 'Booktuber',
                description: 'Content creator evaluating commercial appeal',
                systemPrompt: this.loadPrompt('booktuber'),
                icon: '📱'
            },
            {
                id: 'fandom',
                name: 'Fandom',
                description: 'Passionate fan analyzing character dynamics',
                systemPrompt: this.loadPrompt('fandom'),
                icon: '💫'
            },
            {
                id: 'avid-reader',
                name: 'Avid Reader',
                description: 'Well-read enthusiast comparing with genre conventions',
                systemPrompt: this.loadPrompt('avid-reader'),
                icon: '📚'
            }
        ];

        personaDefinitions.forEach(persona => {
            this.personas.set(persona.id, persona);
        });
    }

    private loadPrompt(personaId: string): string {
        // In a real implementation, this would read from the markdown file
        // For now, we'll use a placeholder that references the file location
        return `You are analyzing text as the ${personaId} persona. Load instructions from src/personas/prompts/${personaId}.md`;
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
    async analyzeText(personaId: string, text: string): Promise<PersonaAnalysisResult> {
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
            // Construct the analysis prompt
            const userPrompt = `Please analyze the following text:\n\n${text}\n\nProvide your analysis following the format described in your instructions.`;

            // Call Ollama with the persona's system prompt
            const analysis = await this.plugin.ollamaService.generateCompletion(
                userPrompt,
                { system: persona.systemPrompt }
            );

            return {
                personaId,
                personaName: persona.name,
                timestamp: Date.now(),
                analysis
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

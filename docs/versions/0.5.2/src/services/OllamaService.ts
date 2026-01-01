import { requestUrl } from 'obsidian';
import SmartWriteCompanionPlugin from '../main';

export interface OllamaModel {
    name: string;
    modified_at: string;
    size: number;
    digest: string;
    details: {
        format: string;
        family: string;
        families: string[] | null;
        parameter_size: string;
        quantization_level: string;
    };
}

export class OllamaService {
    private plugin: SmartWriteCompanionPlugin;

    constructor(plugin: SmartWriteCompanionPlugin) {
        this.plugin = plugin;
    }

    private get endpoint(): string {
        return this.plugin.settings.ollamaEndpoint.replace(/\/$/, '');
    }

    /**
     * Checks if the Ollama server is reachable.
     */
    async checkConnection(): Promise<boolean> {
        try {
            const response = await requestUrl({
                url: `${this.endpoint}/api/tags`,
                method: 'GET',
            });
            return response.status === 200;
        } catch (error) {
            console.warn('Ollama connection check failed:', error);
            return false;
        }
    }

    /**
     * Fetches the list of available models from the Ollama server.
     */
    async listModels(): Promise<OllamaModel[]> {
        try {
            const response = await requestUrl({
                url: `${this.endpoint}/api/tags`,
                method: 'GET',
            });

            if (response.status === 200) {
                return response.json.models || [];
            }
            return [];
        } catch (error) {
            console.error('Failed to list Ollama models:', error);
            return [];
        }
    }

    /**
     * Generates a completion using the selected model.
     * This is a base implementation for future features.
     */
    async generateCompletion(prompt: string, options: any = {}): Promise<string> {
        if (!this.plugin.settings.ollamaEnabled) {
            throw new Error('Ollama is disabled in settings.');
        }

        try {
            const response = await requestUrl({
                url: `${this.endpoint}/api/generate`,
                method: 'POST',
                body: JSON.stringify({
                    model: this.plugin.settings.ollamaModel,
                    prompt: prompt,
                    stream: false,
                    ...options
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                return response.json.response;
            }
            throw new Error(`Ollama error: ${response.status}`);
        } catch (error) {
            console.error('Ollama generation failed:', error);
            throw error;
        }
    }
}

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
    private isConnected: boolean = false;
    private lastHealthCheck: number = 0;
    private healthCheckInterval: number = 30000; // 30 seconds

    constructor(plugin: SmartWriteCompanionPlugin) {
        this.plugin = plugin;
    }

    private get endpoint(): string {
        return this.plugin.settings.ollamaEndpoint.replace(/\/$/, '');
    }

    /**
     * Initializes the Ollama service and performs health check.
     */
    async initializeService(): Promise<{ success: boolean; message: string }> {
        if (!this.plugin.settings.ollamaEnabled) {
            return {
                success: false,
                message: 'Ollama is disabled in settings.'
            };
        }

        const connected = await this.checkConnection();
        
        if (connected) {
            return {
                success: true,
                message: 'Ollama service connected successfully.'
            };
        } else {
            return {
                success: false,
                message: 'Ollama service is not running. Please start Ollama and retry.'
            };
        }
    }

    /**
     * Gets the current connection status.
     */
    getStatus(): { connected: boolean; lastCheck: number } {
        return {
            connected: this.isConnected,
            lastCheck: this.lastHealthCheck
        };
    }

    /**
     * Checks if the Ollama server is reachable and caches the result.
     */
    async checkConnection(): Promise<boolean> {
        try {
            const response = await requestUrl({
                url: `${this.endpoint}/api/tags`,
                method: 'GET',
            });
            
            this.isConnected = response.status === 200;
            this.lastHealthCheck = Date.now();
            return this.isConnected;
        } catch (error) {
            console.warn('Ollama connection check failed:', error);
            this.isConnected = false;
            this.lastHealthCheck = Date.now();
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

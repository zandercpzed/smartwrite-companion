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
    async initializeService(): Promise<{ success: boolean; message: string; needsInstall?: boolean }> {
        if (!this.plugin.settings.ollamaEnabled) {
            return {
                success: false,
                message: 'Ollama is disabled in settings.'
            };
        }

        const connected = await this.checkConnection();
        
        if (!connected) {
            return {
                success: false,
                message: 'Ollama service is not running. Please start Ollama and retry.'
            };
        }

        // Check if default model is installed
        const modelInstalled = await this.isModelInstalled(this.plugin.settings.ollamaModel);

        if (!modelInstalled) {
            return {
                success: true,
                message: 'Ollama connected but model not installed.',
                needsInstall: true
            };
        }

        return {
            success: true,
            message: 'Ollama service connected successfully.'
        };
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
     * Checks if a specific model is installed.
     */
    async isModelInstalled(modelName: string): Promise<boolean> {
        const models = await this.listModels();
        return models.some(m => m.name === modelName || m.name === `${modelName}:latest`);
    }

    /**
     * Pulls (downloads) a model from Ollama with progress tracking.
     */
    async pullModel(
        modelName: string,
        onProgress?: (progress: { status: string; percent?: number; total?: number; completed?: number }) => void
    ): Promise<boolean> {
        try {
            const response = await requestUrl({
                url: `${this.endpoint}/api/pull`,
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: modelName, stream: false })
            });

            if (response.status !== 200) {
                throw new Error(`Failed to pull model: ${response.status}`);
            }

            return true;
        } catch (error) {
            console.error('Failed to pull model:', error);
            return false;
        }
    }

    /**
     * Deletes a model from local storage.
     */
    async deleteModel(modelName: string): Promise<boolean> {
        try {
            const response = await requestUrl({
                url: `${this.endpoint}/api/delete`,
                method: 'DELETE',
                body: JSON.stringify({ name: modelName }),
                headers: { 'Content-Type': 'application/json' }
            });

            return response.status === 200;
        } catch (error) {
            console.error('Failed to delete model:', error);
            return false;
        }
    }

    /**
     * Generates a completion using the selected model.
     * This is a base implementation for future features.
     */
    async generateCompletion(prompt: string, options: Record<string, unknown> = {}): Promise<string> {
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

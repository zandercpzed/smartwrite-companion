import { App, TFile, normalizePath } from 'obsidian';

export interface LongformProject {
    name: string;
    path: string;
    indexFile: TFile;
    scenes: string[];
}

export class LongformService {
    app: App;

    constructor(app: App) {
        this.app = app;
    }

    /**
     * Scans the vault for potential Longform projects.
     * A Longform project is identified by a note containing 'longform' in its frontmatter.
     */
    getProjects(): LongformProject[] {
        const projects: LongformProject[] = [];
        const files = this.app.vault.getMarkdownFiles();

        for (const file of files) {
            const cache = this.app.metadataCache.getFileCache(file);
            if (cache?.frontmatter && cache.frontmatter.longform) {
                // This is likely a Longform index file
                const scenes = this.parseSceneList(cache.frontmatter.longform.scenes);
                
                projects.push({
                    name: file.basename,
                    path: file.path,
                    indexFile: file,
                    scenes: scenes
                });
            }
        }

        return projects;
    }

    /**
     * Recursively parses the scene list from frontmatter.
     * Longform scene lists can be simple arrays or nested objects (folders).
     */
    private parseSceneList(scenes: any[]): string[] {
        let scenePaths: string[] = [];
        
        if (!Array.isArray(scenes)) return [];

        for (const item of scenes) {
            if (typeof item === 'string') {
                // Simple file reference
                scenePaths.push(item);
            } else if (typeof item === 'object' && item !== null) {
                // Nested structure (e.g. folder or cosmetic grouping)
                // Longform usually puts the scene file in a key or strictly nested
                // We'll attempt to extract all strings from the object values
                Object.values(item).forEach(val => {
                    if (Array.isArray(val)) {
                         scenePaths = scenePaths.concat(this.parseSceneList(val));
                    }
                });
            }
        }

        return scenePaths;
    }

    /**
     * Retrieves the full unified text content of a project.
     * Stitches together all scenes in order.
     */
    async getProjectContent(project: LongformProject): Promise<string> {
        let fullText = "";
        
        // Resolve base path of the project (usually where the index file is)
        const projectDir = project.indexFile.parent ? project.indexFile.parent.path : "";

        for (const sceneName of project.scenes) {
            // Longform scenes might be relative paths or just filenames. 
            // We'll try to find the file.
            
            // 1. Try exact path if it looks like one
            let file = this.app.vault.getAbstractFileByPath(sceneName);
            
            // 2. Try relative to project dir
            if (!file && !sceneName.endsWith('.md')) {
                 file = this.app.vault.getAbstractFileByPath(normalizePath(`${projectDir}/${sceneName}.md`));
            }

            // 3. Try global search by basename (fallback)
                 const allFiles = this.app.vault.getMarkdownFiles();
                 const found = allFiles.find(f => f.basename === sceneName || f.name === sceneName);
                 if (found) file = found;

            if (file instanceof TFile) {
                const content = await this.app.vault.read(file);
                fullText += `\n\n*** Scene: ${file.basename} ***\n\n`;
                fullText += content;
            } else {
                console.warn(`[SmartWrite] Could not find scene file: ${sceneName}`);
            }
        }

        return fullText;
    }
}

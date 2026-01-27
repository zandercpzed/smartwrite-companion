import { App, Modal, TFolder, Setting } from 'obsidian';

export class FolderSelectionModal extends Modal {
    private onSelect: (folder: TFolder) => void;
    private onCancel?: () => void;
    private folders: TFolder[];
    private selectionMade: boolean = false;

    constructor(app: App, onSelect: (folder: TFolder) => void, onCancel?: () => void) {
        super(app);
        this.onSelect = onSelect;
        this.onCancel = onCancel;
        this.folders = this.getAllFolders();
    }

    private getAllFolders(): TFolder[] {
        const folders: TFolder[] = [];
        const files = this.app.vault.getAllLoadedFiles();
        files.forEach(file => {
            if (file instanceof TFolder) {
                folders.push(file);
            }
        });
        // Sort folders by path
        return folders.sort((a, b) => a.path.localeCompare(b.path));
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.createEl('h3', { text: 'Select Output Directory' });
        contentEl.createEl('p', { text: 'Where would you like to save the analysis report?' });

        const searchInput = contentEl.createEl('input', { 
            type: 'text', 
            cls: 'smartwrite-w100 smartwrite-mb-12',
            placeholder: 'Search folders...' 
        });

        const listContainer = contentEl.createDiv({ cls: 'smartwrite-folder-list' });
        this.renderFolders(listContainer, this.folders);

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase();
            const filtered = this.folders.filter(f => f.path.toLowerCase().includes(query));
            this.renderFolders(listContainer, filtered);
        });
    }

    private renderFolders(container: HTMLElement, folders: TFolder[]) {
        container.empty();
        if (folders.length === 0) {
            container.createDiv({ text: 'No folders found.', cls: 'smartwrite-p8-o5' });
            return;
        }

        folders.forEach(folder => {
            const folderItem = container.createDiv({ cls: 'smartwrite-folder-item' });
            folderItem.createSpan({ text: folder.path === '/' ? 'Vault Root (/)' : folder.path });
            
            folderItem.addEventListener('click', () => {
                this.selectionMade = true;
                this.onSelect(folder);
                this.close();
            });
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
        if (!this.selectionMade && this.onCancel) {
            this.onCancel();
        }
    }
}

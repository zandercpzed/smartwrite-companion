import { App, Modal, Setting, setIcon } from 'obsidian';
import SmartWriteCompanionPlugin from '../../main';

export class AnalysisStatusModal extends Modal {
    private plugin: SmartWriteCompanionPlugin;
    private refreshInterval: NodeJS.Timeout;

    constructor(app: App, plugin: SmartWriteCompanionPlugin) {
        super(app);
        this.plugin = plugin;
    }

    onOpen() {
        const { contentEl } = this;
        this.render();
        
        // Auto-refresh every second
        this.refreshInterval = setInterval(() => this.render(), 1000);
    }

    private render() {
        const { contentEl } = this;
        contentEl.empty();

        contentEl.createEl('h3', { text: 'Analysis Status & Queue' });

        const status = this.plugin.personaManager.getStatus();
        const queue = this.plugin.personaManager.getQueue();

        // 1. Active Task
        const activeSection = contentEl.createDiv({ cls: 'smartwrite-status-section' });
        activeSection.createEl('h4', { text: 'Active Task', cls: 'smartwrite-mb-8' });

        if (status.isBusy && status.taskName) {
            const activeRow = activeSection.createDiv({ cls: 'smartwrite-status-active-row' });
            activeRow.createSpan({ text: `🚀 ${status.taskName}`, cls: 'smartwrite-fw-bold' });
            
            const progressContainer = activeSection.createDiv({ cls: 'smartwrite-status-progress-bg' });
            progressContainer.createDiv({ 
                cls: 'smartwrite-status-progress-fill', 
                attr: { style: `width: ${status.progress}%` } 
            });
            activeSection.createDiv({ text: `${status.progress}% complete`, cls: 'smartwrite-f11-mt4' });

            const stopBtn = activeSection.createEl('button', { 
                text: 'Stop Task', 
                cls: 'smartwrite-stop-btn-modal' 
            });
            stopBtn.addEventListener('click', () => {
                this.plugin.personaManager.cancelAnalysis();
                this.render();
            });
        } else {
            activeSection.createDiv({ text: 'No active analysis.', cls: 'smartwrite-p8-o5' });
        }

        // 2. Queue
        const queueSection = contentEl.createDiv({ cls: 'smartwrite-status-section smartwrite-mt-16' });
        queueSection.createEl('h4', { text: 'Queue', cls: 'smartwrite-mb-8' });

        if (queue.length > 0) {
            queue.forEach(task => {
                const row = queueSection.createDiv({ cls: 'smartwrite-status-queue-row' });
                row.createSpan({ text: task.personaName });
                
                const removeBtn = row.createDiv({ cls: 'smartwrite-status-remove-btn' });
                setIcon(removeBtn, 'trash-2');
                removeBtn.addEventListener('click', () => {
                    this.plugin.personaManager.cancelQueuedTask(task.index);
                    this.render();
                });
            });
        } else {
            queueSection.createDiv({ text: 'Queue is empty.', cls: 'smartwrite-p8-o5' });
        }
    }

    onClose() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        const { contentEl } = this;
        contentEl.empty();
    }
}

import { Component } from 'obsidian';

export abstract class BasePanel extends Component {
    protected containerEl: HTMLElement;
    protected panelEl: HTMLElement;
    protected headerEl: HTMLElement;
    protected contentEl: HTMLElement;
    protected isCollapsed: boolean = false;

    constructor(containerEl: HTMLElement, title: string) {
        super();
        this.containerEl = containerEl;
        this.createPanel(title);
    }

    protected badgeEl: HTMLElement;

    private createPanel(title: string): void {
        // Create panel container
        this.panelEl = this.containerEl.createDiv({ cls: 'smartwrite-panel' });

        // Create header
        this.headerEl = this.panelEl.createDiv({ cls: 'smartwrite-panel-header' });

        // Toggle on left
        const toggleEl = this.headerEl.createDiv({ cls: 'smartwrite-panel-toggle' });
        toggleEl.setText('▼');
        toggleEl.addEventListener('click', (e) => {
             e.stopPropagation(); // prevent triggering parent clicks if any
             this.toggle();
        });

        // Title in middle
        const titleEl = this.headerEl.createDiv({ cls: 'smartwrite-panel-title' });
        titleEl.setText(title);

        // Badge on right
        this.badgeEl = this.headerEl.createDiv({ cls: 'smartwrite-count-badge' });
        this.badgeEl.style.display = 'none'; // Hidden by default

        // Header click toggles too
        this.headerEl.addEventListener('click', () => this.toggle());

        // Create content
        this.contentEl = this.panelEl.createDiv({ cls: 'smartwrite-panel-content' });

        this.renderContent();
    }

    public updateBadge(text: string | number): void {
        if (!this.badgeEl) return;
        if (text === undefined || text === null || text === '') {
            this.badgeEl.style.display = 'none';
        } else {
            this.badgeEl.setText(String(text));
            this.badgeEl.style.display = 'block';
        }
    }

    protected abstract renderContent(): void;

    public updateContent(data?: any): void {
        // Override in subclasses
    }

    private toggle(): void {
        this.isCollapsed = !this.isCollapsed;
        const toggleEl = this.headerEl.querySelector('.smartwrite-panel-toggle');

        if (this.isCollapsed) {
            this.contentEl.style.display = 'none';
            if (toggleEl) toggleEl.setText('▶');
        } else {
            this.contentEl.style.display = 'block';
            if (toggleEl) toggleEl.setText('▼');
        }
    }

    public getContainer(): HTMLElement {
        return this.containerEl;
    }

    public show(): void {
        if (this.panelEl) this.panelEl.style.display = 'block';
    }

    public hide(): void {
        if (this.panelEl) this.panelEl.style.display = 'none';
    }
}
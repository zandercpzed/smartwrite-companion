import { BasePanel } from './BasePanel';
import { SuggestionsResult } from '../../types';
import SmartWriteCompanionPlugin from "../../main";
import { MarkdownView } from 'obsidian';

export class SuggestionsPanel extends BasePanel {
    private plugin: SmartWriteCompanionPlugin;
    private suggestions: SuggestionsResult | null = null;

    constructor(containerEl: HTMLElement, plugin: SmartWriteCompanionPlugin) {
        super(containerEl, 'Suggestions');
        this.plugin = plugin;
    }

    protected renderContent(): void {
        if (!this.plugin) return;
        this.contentEl.empty();

        if (!this.suggestions || this.suggestions.suggestions.length === 0) {
            this.contentEl.createDiv({ cls: 'smartwrite-no-suggestions' }).setText('No suggestions available');
            this.updateBadge('');
            return;
        }

        // Aggregate suggestions by type
        const aggregated = new Map<string, {
            type: string,
            severity: string,
            count: number,
            instances: any[]
        }>();

        for (const s of this.suggestions.suggestions) {
            if (s.id === 'repetitions-group') {
                // Special case for repetitions which are already grouped
                aggregated.set('repetition', {
                    type: 'repetition',
                    severity: s.severity,
                    count: (s.details as any[]).length,
                    instances: s.details as any[]
                });
                continue;
            }

            const existing = aggregated.get(s.type);
            if (existing) {
                existing.count++;
                existing.instances.push(s);
                // Escalate severity if many issues
                if (existing.count > 5) existing.severity = 'high';
                else if (existing.count > 2) existing.severity = 'medium';
            } else {
                aggregated.set(s.type, {
                    type: s.type,
                    severity: s.severity,
                    count: 1,
                    instances: [s]
                });
            }
        }

        // Update badge with total count of individual matches
        const totalCount = Array.from(aggregated.values()).reduce((acc, curr) => acc + curr.count, 0);
        this.updateBadge(totalCount);

        const listContainer = this.contentEl.createDiv({ cls: 'smartwrite-suggestions-list' });

        for (const group of aggregated.values()) {
            const item = listContainer.createDiv({ cls: 'smartwrite-suggestion-item' });
            const isExpandable = group.instances.length > 0;

            const mainRow = item.createDiv({ cls: 'smartwrite-suggestion-main-row' });
            
            const dot = mainRow.createDiv({ cls: 'smartwrite-severity-dot' });
            if (group.severity === 'high') dot.addClass('smartwrite-severity-error');
            else if (group.severity === 'medium') dot.addClass('smartwrite-severity-warning');
            else dot.addClass('smartwrite-severity-info');

            const content = mainRow.createDiv({ cls: 'smartwrite-suggestion-content' });
            const typeHeader = content.createDiv({ cls: 'smartwrite-suggestion-header' });
            
            const type = typeHeader.createSpan({ cls: 'smartwrite-suggestion-type' });
            type.setText(group.type.charAt(0).toUpperCase() + group.type.slice(1).replace('-', ' '));
            
            if (isExpandable) {
                mainRow.classList.add('is-expandable');
                const toggleIcon = typeHeader.createSpan({ cls: 'smartwrite-suggestion-toggle-icon' });
                toggleIcon.setText('▼'); 
                
                mainRow.addEventListener('click', () => {
                   item.classList.toggle('is-collapsed');
                });
                item.classList.add('is-collapsed'); 
            }

            const description = content.createDiv({ cls: 'smartwrite-suggestion-description' });
            description.setText(`${group.count} issues detected`);
            if (group.type === 'repetition') description.setText(`${group.count} words repeated`);

            if (isExpandable) {
                const detailsContainer = item.createDiv({ cls: 'smartwrite-suggestion-details' });
                
                group.instances.slice(0, 10).forEach(instance => {
                    const detailItem = detailsContainer.createDiv({ cls: 'smartwrite-detail-item' });
                    
                    if (group.type === 'repetition') {
                        detailItem.addClass('smartwrite-repetition-item');
                        detailItem.createSpan({ cls: 'smartwrite-detail-text' }).setText(instance.word);
                        detailItem.createSpan({ cls: 'smartwrite-detail-sub' }).setText(String(instance.count));
                    } 
                    else {
                        detailItem.addClass('smartwrite-simple-item');
                        detailItem.createSpan({ cls: 'smartwrite-detail-text' }).setText(instance.message || group.type);
                        
                        // Add click to focus in editor
                        detailItem.addClass('smartwrite-pointer');
                        detailItem.addEventListener('click', (e) => {
                            e.stopPropagation();
                            if (instance.position && instance.position.start !== undefined) {
                                const activeView = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
                                if (activeView) {
                                    activeView.editor.setSelection(
                                        activeView.editor.offsetToPos(instance.position.start),
                                        activeView.editor.offsetToPos(instance.position.end)
                                    );
                                    activeView.editor.focus();
                                }
                            }
                        });
                    }
                });

                if (group.instances.length > 10) {
                    detailsContainer.createDiv({ cls: 'smartwrite-detail-more' }).setText(`+${group.instances.length - 10} more`);
                }
            }
        }
    }

    public update(suggestions: SuggestionsResult | null): void {
        this.suggestions = suggestions;
        this.renderContent();
    }
}
import { BasePanel } from './BasePanel';
import { SuggestionsResult } from '../../types';
import SmartWriteCompanionPlugin from "../../main";

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

        // Update badge (Calculate total items from details if available)
        const totalCount = this.suggestions.suggestions.reduce((acc, curr) => {
             if (curr.details && Array.isArray(curr.details)) {
                 return acc + curr.details.length;
             }
             return acc + 1;
        }, 0);
        this.updateBadge(totalCount);

        const listContainer = this.contentEl.createDiv({ cls: 'smartwrite-suggestions-list' });

        for (const suggestion of this.suggestions.suggestions) {
            const item = listContainer.createDiv({ cls: 'smartwrite-suggestion-item' });
            
            // Check if expandable (Has details array)
            const isExpandable = suggestion.details && Array.isArray(suggestion.details) && suggestion.details.length > 0;

            // Container for main row
            const mainRow = item.createDiv({ cls: 'smartwrite-suggestion-main-row' });
            
            // Dot
            const dot = mainRow.createDiv({ cls: 'smartwrite-severity-dot' });
            const typeLower = suggestion.type.toLowerCase();
            if (typeLower === 'grammar') dot.addClass('smartwrite-severity-error');
            else if (typeLower === 'long-sentence' || typeLower === 'repetition') dot.addClass('smartwrite-severity-warning');
            else dot.addClass('smartwrite-severity-info');

            // Content
            const content = mainRow.createDiv({ cls: 'smartwrite-suggestion-content' });
            
            const typeHeader = content.createDiv({ cls: 'smartwrite-suggestion-header' });
            // Type
            const type = typeHeader.createSpan({ cls: 'smartwrite-suggestion-type' });
            type.setText(suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1));
            
            // If expandable, add toggle icon
            if (isExpandable) {
                mainRow.classList.add('is-expandable');
                const toggleIcon = typeHeader.createSpan({ cls: 'smartwrite-suggestion-toggle-icon' });
                toggleIcon.setText('▼'); 
                
                mainRow.addEventListener('click', () => {
                   item.classList.toggle('is-collapsed');
                });
                item.classList.add('is-collapsed'); // Default collapsed
            }

            // Message
            const description = content.createDiv({ cls: 'smartwrite-suggestion-description' });
            description.setText(suggestion.message);

            if (suggestion.explanation) {
                item.setAttribute('title', suggestion.explanation);
            }

            // Render Details
            if (isExpandable) {
                const detailsContainer = item.createDiv({ cls: 'smartwrite-suggestion-details' });
                
                // Determine render strategy based on type or content
                const details = suggestion.details as any[];

                // Limit display to first 10 items
                details.slice(0, 10).forEach(detail => {
                    const detailItem = detailsContainer.createDiv({ cls: 'smartwrite-detail-item' });
                    
                    if (suggestion.type === 'repetition') {
                        detailItem.addClass('smartwrite-repetition-item');
                        detailItem.createSpan({ cls: 'smartwrite-detail-text' }).setText(detail.word);
                        detailItem.createSpan({ cls: 'smartwrite-detail-sub' }).setText(String(detail.count));
                    } 
                    else if (suggestion.type === 'long-sentence') {
                         detailItem.addClass('smartwrite-long-sentence-item');
                         // Show word count and snippet
                         detailItem.createDiv({ cls: 'smartwrite-detail-text' }).setText(`${detail.text}`);
                         detailItem.createDiv({ cls: 'smartwrite-detail-sub' }).setText(`${detail.count} words`);
                    }
                    else if (suggestion.type === 'grammar') {
                        detailItem.addClass('smartwrite-grammar-item');
                        detailItem.createDiv({ cls: 'smartwrite-detail-text' }).setText(detail.text);
                        if (detail.context) detailItem.createDiv({ cls: 'smartwrite-detail-context' }).setText(detail.context);
                    }
                    else {
                        // Complex words or default
                        detailItem.addClass('smartwrite-simple-item');
                        detailItem.createSpan({ cls: 'smartwrite-detail-text' }).setText(detail.text || detail.word || JSON.stringify(detail));
                    }
                });

                if (details.length > 10) {
                     detailsContainer.createDiv({ cls: 'smartwrite-detail-more' }).setText(`+${details.length - 10} more`);
                }
            }
        }
    }

    public update(suggestions: SuggestionsResult | null): void {
        this.suggestions = suggestions;
        this.renderContent();
    }
}
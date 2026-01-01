import { Extension, StateField, StateEffect, Transaction } from '@codemirror/state';
import { EditorView, Decoration, DecorationSet } from '@codemirror/view';
import { Suggestion } from '../types';

const addSuggestions = StateEffect.define<Suggestion[]>();
const clearSuggestions = StateEffect.define<void>();

export const suggestionField = StateField.define<DecorationSet>({
    create() {
        return Decoration.none;
    },
    update(decorations, tr: Transaction) {
        decorations = decorations.map(tr.changes);

        for (let e of tr.effects) {
            if (e.is(addSuggestions)) {
                const deco = e.value.map(s => {
                    const typeClass = `smartwrite-highlight-${s.type}`;
                    return Decoration.mark({
                        class: `smartwrite-highlight ${typeClass}`,
                        attributes: { title: s.message }
                    }).range(s.position.start, s.position.end);
                });
                // Sort by from position as required by Decoration.set
                deco.sort((a, b) => a.from - b.from);
                decorations = Decoration.set(deco);
            } else if (e.is(clearSuggestions)) {
                decorations = Decoration.none;
            }
        }
        return decorations;
    },
    provide: (f: StateField<DecorationSet>) => EditorView.decorations.from(f)
});

export class Highlighter {
    public static getExtension(): Extension {
        return [suggestionField];
    }

    public static updateHighlights(view: EditorView, suggestions: Suggestion[]) {
        // Filter out suggestions without valid positions or length 0
        const validSuggestions = suggestions.filter(s => 
            s.position && 
            s.position.start !== s.position.end &&
            s.position.start < view.state.doc.length &&
            s.position.end <= view.state.doc.length
        );

        view.dispatch({
            effects: addSuggestions.of(validSuggestions)
        });
    }

    public static clear(view: EditorView) {
        view.dispatch({
            effects: clearSuggestions.of()
        });
    }
}

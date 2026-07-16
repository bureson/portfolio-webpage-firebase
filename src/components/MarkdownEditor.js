import React, { Component } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, placeholder } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';

// Note: loaded lazily (React.lazy) so CodeMirror stays out of the visitor bundle

const cosmosTheme = EditorView.theme({
  '&': {
    backgroundColor: 'transparent',
    fontSize: '14px',
    color: 'rgba(236, 229, 195, 0.85)'
  },
  '.cm-content': {
    fontFamily: "'IBM Plex Mono', monospace",
    lineHeight: '1.9',
    caretColor: '#e8c15a',
    padding: '0 0 120px'
  },
  '&.cm-focused': {
    outline: 'none'
  },
  '.cm-cursor': {
    borderLeftColor: '#e8c15a'
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
    backgroundColor: 'rgba(232, 193, 90, 0.22) !important'
  },
  '.cm-placeholder': {
    color: 'rgba(236, 229, 195, 0.35)'
  }
}, { dark: true });

const cosmosHighlight = HighlightStyle.define([
  { tag: tags.heading, color: '#e8c15a', fontWeight: '700' },
  { tag: tags.strong, color: '#f4efd9', fontWeight: '700' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.quote, color: 'rgba(236, 229, 195, 0.55)', fontStyle: 'italic' },
  { tag: tags.link, color: '#e8c15a' },
  { tag: tags.url, color: 'rgba(236, 229, 195, 0.5)' },
  { tag: tags.monospace, color: '#dce1ff' },
  { tag: tags.strikethrough, textDecoration: 'line-through' },
  { tag: tags.processingInstruction, color: 'rgba(232, 193, 90, 0.7)' },
  { tag: tags.contentSeparator, color: 'rgba(232, 193, 90, 0.7)' }
]);

class MarkdownEditor extends Component {

  constructor(props) {
    super(props);
    this.containerRef = React.createRef();
  }

  componentDidMount = () => {
    const updateListener = EditorView.updateListener.of(update => {
      if (update.docChanged) {
        this.props.onChange(update.state.doc.toString());
      }
    });
    const editorKeymap = [
      { key: 'Mod-s', preventDefault: true, run: () => { this.props.onSave && this.props.onSave(); return true; } },
      { key: 'Mod-b', run: () => { this.wrapSelection('**'); return true; } },
      { key: 'Mod-i', run: () => { this.wrapSelection('*'); return true; } }
    ];
    this.view = new EditorView({
      state: EditorState.create({
        doc: this.props.value || '',
        extensions: [
          history(),
          keymap.of([...editorKeymap, ...defaultKeymap, ...historyKeymap]),
          markdown({ base: markdownLanguage }),
          syntaxHighlighting(cosmosHighlight),
          cosmosTheme,
          EditorView.lineWrapping,
          placeholder(this.props.placeholder || 'Write in markdown ...'),
          updateListener
        ]
      }),
      parent: this.containerRef.current
    });
  }

  componentWillUnmount = () => {
    this.view && this.view.destroy();
  }

  focus = () => {
    this.view.focus();
  }

  // wraps the selection in a marker pair, e.g. **bold** or *italic*
  wrapSelection = (marker) => {
    const { from, to } = this.view.state.selection.main;
    const selected = this.view.state.sliceDoc(from, to);
    this.view.dispatch({
      changes: { from, to, insert: `${marker}${selected}${marker}` },
      selection: { anchor: from + marker.length, head: to + marker.length }
    });
    this.view.focus();
  }

  // toggles a line prefix (## heading, > quote) on the current line
  prefixLine = (prefix) => {
    const { from } = this.view.state.selection.main;
    const line = this.view.state.doc.lineAt(from);
    if (line.text.startsWith(prefix)) {
      this.view.dispatch({ changes: { from: line.from, to: line.from + prefix.length, insert: '' } });
    } else {
      const existing = line.text.match(/^(#{1,6} |> )/);
      const stripLength = existing ? existing[0].length : 0;
      this.view.dispatch({ changes: { from: line.from, to: line.from + stripLength, insert: prefix } });
    }
    this.view.focus();
  }

  // inserts a block (image or file snippet) on its own line below the cursor
  insertBlock = (text) => {
    const { to } = this.view.state.selection.main;
    const line = this.view.state.doc.lineAt(to);
    const insert = (line.length ? '\n\n' : '') + text;
    this.view.dispatch({
      changes: { from: line.to, to: line.to, insert },
      selection: { anchor: line.to + insert.length }
    });
    this.view.focus();
  }

  insertLink = () => {
    const { from, to } = this.view.state.selection.main;
    const selected = this.view.state.sliceDoc(from, to) || 'link text';
    const urlStart = from + selected.length + 3; // past "[selected]("
    this.view.dispatch({
      changes: { from, to, insert: `[${selected}](url)` },
      selection: { anchor: urlStart, head: urlStart + 3 }
    });
    this.view.focus();
  }

  render = () => {
    return <div className='markdown-editor' ref={this.containerRef} />
  }

}

export default MarkdownEditor;

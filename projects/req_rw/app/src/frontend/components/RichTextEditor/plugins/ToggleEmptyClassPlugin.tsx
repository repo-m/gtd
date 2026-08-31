import { useEffect } from 'react';
import { $getRoot } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

export function ToggleEmptyClassPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const isEmpty = $getRoot().getTextContent().trim() === '';
        const el = editor.getRootElement();
        if (el) {
          el.classList.toggle('editor-empty', isEmpty);
        }
      });
    });
  }, [editor]);

  return null;
}

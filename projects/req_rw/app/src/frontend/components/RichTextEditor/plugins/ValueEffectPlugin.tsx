import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

interface Props {
  value: string;
}

export function ValueEffectPlugin({ value }: Props): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!value) return;
    const editorState = editor.parseEditorState(value);
    editor.setEditorState(editorState);
  }, [editor, value]);

  return null;
}

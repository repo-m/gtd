import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

interface Props {
  onChange?: (value: string) => void;
}

export function UpdateEffectPlugin({ onChange }: Props): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      if (!onChange) return;
      onChange(JSON.stringify(editorState.toJSON()));
    });
  }, [editor, onChange]);

  return null;
}

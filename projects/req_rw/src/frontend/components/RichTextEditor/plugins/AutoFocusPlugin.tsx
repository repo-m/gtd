import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

interface Props {
  editable: boolean;
}

export function AutoFocusPlugin({ editable }: Props): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (editable) {
      editor.focus();
    }
  }, [editor, editable]);

  return null;
}

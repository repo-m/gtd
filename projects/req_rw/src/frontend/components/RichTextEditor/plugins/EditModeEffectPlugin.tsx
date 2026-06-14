import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

interface Props {
  editable: boolean;
  onUpdate: (value: string) => void;
}

export function EditModeEffectPlugin({ editable, onUpdate }: Props): null {
  const [editor] = useLexicalComposerContext();
  const prevEditableRef = useRef<boolean>(editable);

  useEffect(() => {
    editor.setEditable(editable);

    const wasEditable = prevEditableRef.current;
    prevEditableRef.current = editable;

    if (!editable && wasEditable) {
      const serialized = JSON.stringify(editor.getEditorState().toJSON());
      onUpdate(serialized);
    }
  }, [editor, editable, onUpdate]);

  return null;
}

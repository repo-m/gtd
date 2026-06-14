import { useEffect, useContext } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { GlobalEditorContext } from '../../GlobalEditorContext';

interface Props {
  editable: boolean;
}

export function RegisterEditorPlugin({ editable }: Props): null {
  const [editor] = useLexicalComposerContext();
  const { setActiveEditor } = useContext(GlobalEditorContext);

  useEffect(() => {
    if (editable) {
      setActiveEditor(editor);
      return () => setActiveEditor(null);
    }
  }, [editor, editable, setActiveEditor]);

  return null;
}

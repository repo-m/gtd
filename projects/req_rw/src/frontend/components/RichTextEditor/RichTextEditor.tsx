import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import type { CharRange } from '../../store/searchSlice';
import { editorConfig } from './editorConfig';
import { ValueEffectPlugin } from './plugins/ValueEffectPlugin';
import { UpdateEffectPlugin } from './plugins/UpdateEffectPlugin';
import { EditModeEffectPlugin } from './plugins/EditModeEffectPlugin';
import { ToggleEmptyClassPlugin } from './plugins/ToggleEmptyClassPlugin';
import { AutoFocusPlugin } from './plugins/AutoFocusPlugin';
import { SearchMarkPlugin } from './plugins/SearchMarkPlugin';
import { RegisterEditorPlugin } from './plugins/RegisterEditorPlugin';

interface Props {
  value: string;
  editable: boolean;
  onUpdate: (value: string) => void;
  onChange?: (value: string) => void;
  searchResults?: CharRange[];
}

export function RichTextEditor({
  value,
  editable,
  onUpdate,
  onChange,
  searchResults = [],
}: Props) {
  const initialConfig = {
    ...editorConfig,
    namespace: 'RichTextEditor',
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container">
        <RichTextPlugin
          contentEditable={<ContentEditable className="editor-input" />}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <ListPlugin />
        <ValueEffectPlugin value={value} />
        <UpdateEffectPlugin onChange={onChange} />
        <EditModeEffectPlugin editable={editable} onUpdate={onUpdate} />
        <SearchMarkPlugin searchResults={searchResults} />
        <ToggleEmptyClassPlugin />
        <AutoFocusPlugin editable={editable} />
        <RegisterEditorPlugin editable={editable} />
      </div>
    </LexicalComposer>
  );
}

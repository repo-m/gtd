import { createContext, useContext, useRef, useCallback } from 'react';
import type { LexicalEditor } from 'lexical';

interface GlobalEditorContextValue {
  activeEditorRef: React.MutableRefObject<LexicalEditor | null>;
  setActiveEditor: (editor: LexicalEditor | null) => void;
}

const defaultRef = { current: null };

export const GlobalEditorContext = createContext<GlobalEditorContextValue>({
  activeEditorRef: defaultRef,
  setActiveEditor: () => {},
});

export function GlobalEditorProvider({ children }: { children: React.ReactNode }) {
  const activeEditorRef = useRef<LexicalEditor | null>(null);
  const setActiveEditor = useCallback((editor: LexicalEditor | null) => {
    activeEditorRef.current = editor;
  }, []);

  return (
    <GlobalEditorContext.Provider value={{ activeEditorRef, setActiveEditor }}>
      {children}
    </GlobalEditorContext.Provider>
  );
}

export function useGlobalEditor() {
  return useContext(GlobalEditorContext);
}

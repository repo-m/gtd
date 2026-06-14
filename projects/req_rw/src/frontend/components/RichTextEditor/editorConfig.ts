import type { InitialConfigType } from '@lexical/react/LexicalComposer';
import { ListNode, ListItemNode } from '@lexical/list';
import { SearchMarkNode } from './plugins/SearchMarkPlugin/SearchMarkNode';

export const editorConfig: Omit<InitialConfigType, 'namespace'> = {
  theme: {},
  editable: false,
  onError(error: Error): void {
    console.error(error);
  },
  nodes: [ListNode, ListItemNode, SearchMarkNode],
};

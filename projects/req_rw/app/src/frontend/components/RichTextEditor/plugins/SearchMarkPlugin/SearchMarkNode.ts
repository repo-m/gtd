import type {
  EditorConfig,
  NodeKey,
  SerializedElementNode,
  Spread,
} from 'lexical';
import { ElementNode, LexicalNode } from 'lexical';

export type SerializedSearchMarkNode = Spread<
  { type: 'search-mark'; version: 1 },
  SerializedElementNode
>;

export class SearchMarkNode extends ElementNode {
  static getType(): string {
    return 'search-mark';
  }

  static clone(node: SearchMarkNode): SearchMarkNode {
    return new SearchMarkNode(node.__key);
  }

  constructor(key?: NodeKey) {
    super(key);
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const el = document.createElement('mark');
    el.className = 'search-mark';
    return el;
  }

  updateDOM(): boolean {
    return false;
  }

  isInline(): boolean {
    return true;
  }

  canBeEmpty(): false {
    return false;
  }

  canInsertTextBefore(): false {
    return false;
  }

  canInsertTextAfter(): false {
    return false;
  }

  exportJSON(): SerializedSearchMarkNode {
    return {
      ...super.exportJSON(),
      type: 'search-mark',
      version: 1,
    };
  }

  static importJSON(_serializedNode: SerializedElementNode): SearchMarkNode {
    return $createSearchMarkNode();
  }
}

export function $createSearchMarkNode(): SearchMarkNode {
  return new SearchMarkNode();
}

export function $isSearchMarkNode(
  node: LexicalNode | null | undefined,
): node is SearchMarkNode {
  return node instanceof SearchMarkNode;
}

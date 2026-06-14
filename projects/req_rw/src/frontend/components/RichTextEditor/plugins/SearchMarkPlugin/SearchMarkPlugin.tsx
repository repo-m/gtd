import { useEffect } from 'react';
import { $getRoot, $isElementNode, $isTextNode, TextNode, LexicalNode } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { CharRange } from '../../../../store/searchSlice';
import { $createSearchMarkNode, $isSearchMarkNode } from './SearchMarkNode';

interface Props {
  searchResults: CharRange[];
}

function collectTextNodes(node: LexicalNode): TextNode[] {
  if ($isTextNode(node)) return [node];
  if ($isElementNode(node)) {
    const result: TextNode[] = [];
    node.getChildren().forEach(child => result.push(...collectTextNodes(child)));
    return result;
  }
  return [];
}

function unwrapSearchMarks(node: LexicalNode): void {
  if ($isSearchMarkNode(node)) {
    const children = node.getChildren();
    for (const child of children) {
      node.insertBefore(child);
    }
    node.remove();
    return;
  }
  if ($isElementNode(node)) {
    const children = [...node.getChildren()];
    for (const child of children) {
      unwrapSearchMarks(child);
    }
  }
}

export function SearchMarkPlugin({ searchResults }: Props): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => {
      const root = $getRoot();

      unwrapSearchMarks(root);

      if (searchResults.length === 0 || editor.isEditable()) return;

      const sortedRanges = [...searchResults].sort((a, b) => a.start - b.start);

      for (const range of sortedRanges) {
        if (range.start >= range.end) continue;

        const textNodes = collectTextNodes(root);
        let offset = 0;

        for (const node of textNodes) {
          const nodeLen = node.getTextContent().length;
          const nodeStart = offset;
          const nodeEnd = offset + nodeLen;
          offset = nodeEnd;

          if (nodeEnd <= range.start || nodeStart >= range.end) continue;
          if ($isSearchMarkNode(node.getParent())) continue;

          const localStart = Math.max(range.start - nodeStart, 0);
          const localEnd = Math.min(range.end - nodeStart, nodeLen);
          if (localStart >= localEnd) continue;

          const splitOffsets: number[] = [];
          if (localStart > 0) splitOffsets.push(localStart);
          if (localEnd < nodeLen) splitOffsets.push(localEnd);

          let target: TextNode;
          if (splitOffsets.length === 0) {
            target = node;
          } else {
            const parts = node.splitText(...(splitOffsets as [number, ...number[]]));
            target = parts[localStart > 0 ? 1 : 0];
          }

          const markNode = $createSearchMarkNode();
          target.insertBefore(markNode);
          markNode.append(target);
        }
      }
    });
  }, [editor, searchResults]);

  return null;
}

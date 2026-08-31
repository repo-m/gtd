import type { Command } from './filterCommands';

interface NavReq {
  text?: string;
  heading?: string;
}

function plainTextPreview(content: string | undefined, maxLen: number): string {
  if (!content) return '';
  const stripped = content.replace(/<[^>]*>/g, '');
  return stripped.length > maxLen ? stripped.slice(0, maxLen) + '…' : stripped;
}

/**
 * Builds the Command Palette's "Navigate" section from the flat req id list.
 * Excludes `rootId` — the root sentinel requirement is an internal container,
 * never a user-visible requirement, and must not appear as a navigable entry.
 */
export function buildNavCommands(
  reqIds: number[],
  requirements: Record<number, NavReq | undefined>,
  rootId: number | null,
  onNavigate: (id: number) => void,
): Command[] {
  return reqIds
    .filter((id) => id !== rootId)
    .map((id) => {
      const req = requirements[id];
      const preview = req ? plainTextPreview(req.text ?? req.heading ?? '', 60) : '';
      return {
        id: `nav-${id}`,
        label: `REQ-${id}  ${preview}`,
        section: 'Navigate' as const,
        keywords: [String(id)],
        action: () => onNavigate(id),
      };
    });
}

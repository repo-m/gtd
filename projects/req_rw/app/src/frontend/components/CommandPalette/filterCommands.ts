export interface Command {
  id: string;
  label: string;
  section: 'Actions' | 'Navigate' | 'View' | 'Find';
  shortcut?: string;
  keywords?: string[];
  action: () => void;
}

export function filterCommands(commands: Command[], query: string): Command[] {
  if (!query.trim()) return commands.filter((c) => c.section !== 'Navigate');
  const q = query.toLowerCase();
  return commands.filter(
    (c) =>
      c.label.toLowerCase().includes(q) ||
      c.keywords?.some((k) => k.toLowerCase().includes(q)),
  );
}

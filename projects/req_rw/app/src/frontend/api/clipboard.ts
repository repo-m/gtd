export async function clipboardWrite(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

export async function clipboardRead(): Promise<string> {
  return navigator.clipboard.readText();
}

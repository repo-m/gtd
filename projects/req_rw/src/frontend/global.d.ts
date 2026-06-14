interface PyWebviewApiShape {
  getState(): Promise<{ id: string; filepath: string | null }>;
}

declare global {
  interface Window {
    pywebview?: {
      api: PyWebviewApiShape;
    };
  }
}

export {};

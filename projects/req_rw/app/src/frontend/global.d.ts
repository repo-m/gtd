interface PyWebviewApiShape {
  getState(): Promise<{ id: string; filepath: string; lastFilepath: string }>;
}

declare global {
  interface Window {
    pywebview?: {
      api: PyWebviewApiShape;
    };
  }
}

export {};

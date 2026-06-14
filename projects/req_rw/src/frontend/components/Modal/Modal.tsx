import { ReactNode } from 'react';

interface ModalProps {
  title: string;
  children: ReactNode;
}

export function Modal({ title, children }: ModalProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--color-overlay)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 4,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 640,
          maxWidth: 900,
          maxHeight: '90vh',
          boxShadow: 'var(--shadow-modal)',
          color: 'var(--color-text)',
        }}
      >
        <div
          style={{
            padding: '8px 12px',
            borderBottom: '1px solid var(--color-border)',
            fontWeight: 'bold',
            fontSize: 14,
          }}
        >
          {title}
        </div>
        {children}
      </div>
    </div>
  );
}

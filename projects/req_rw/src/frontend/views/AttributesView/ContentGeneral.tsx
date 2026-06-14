import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { fileUpdate, fileUpdatePrefix, fileUpdateTitle } from '../../store/fileSlice';
import { MenuActions } from './AttributesMenu';

interface ContentGeneralProps {
  initialTitle: string;
  initialPrefix: string;
  initialDescription: string;
  isActive: boolean;
  stableSetOnSubmit: (fn: () => void) => void;
  stableSetMenuActions: (actions: MenuActions) => void;
}

export function ContentGeneral({
  initialTitle,
  initialPrefix,
  initialDescription,
  isActive,
  stableSetOnSubmit,
  stableSetMenuActions,
}: ContentGeneralProps) {
  const dispatch = useDispatch();
  const [title, setTitle] = useState(initialTitle);
  const [prefix, setPrefix] = useState(initialPrefix);
  const [description, setDescription] = useState(initialDescription);

  const latestRef = useRef({ title, prefix, description });
  latestRef.current = { title, prefix, description };

  useEffect(() => {
    if (!isActive) return;
    stableSetMenuActions({ onAdd: () => {}, onRemove: () => {} });
    stableSetOnSubmit(() => {
      const { title: t, prefix: p, description: d } = latestRef.current;
      if (t !== initialTitle) dispatch(fileUpdateTitle(t));
      if (p !== initialPrefix) dispatch(fileUpdatePrefix(p));
      if (d !== initialDescription) dispatch(fileUpdate({ description: d }));
    });
  }, [isActive, stableSetOnSubmit, stableSetMenuActions, dispatch, initialTitle, initialPrefix, initialDescription]);

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <label style={labelStyle}>
        Title
        <input
          style={inputStyle}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <label style={labelStyle}>
        Prefix
        <input
          style={inputStyle}
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
        />
      </label>
      <label style={labelStyle}>
        Description
        <textarea
          style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  fontSize: 13,
  fontWeight: 'bold',
};

const inputStyle: React.CSSProperties = {
  padding: '4px 8px',
  fontSize: 13,
  border: '1px solid var(--color-border)',
  borderRadius: 3,
  fontWeight: 'normal',
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
  width: '100%',
  boxSizing: 'border-box',
};

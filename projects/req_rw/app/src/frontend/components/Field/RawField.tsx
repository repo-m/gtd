interface Props {
  value: unknown;
}

export function RawField({ value }: Props) {
  return (
    <pre style={{ margin: 0, fontSize: 11, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
      {JSON.stringify(value)}
    </pre>
  );
}

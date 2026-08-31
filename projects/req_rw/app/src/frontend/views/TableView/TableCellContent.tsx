import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { IdField } from '../../components/Field/IdField';
import { ContentField } from '../../components/Field/ContentField';
import { LinkField } from '../../components/Field/LinkField';
import { SingleLinePlainTextField } from '../../components/Field/SingleLinePlainTextField';
import { RichTextField } from '../../components/Field/RichTextField';
import { RawField } from '../../components/Field/RawField';
import { NumField } from '../../components/Field/NumField';

interface Props {
  id: number;
  field: string;
}

export function TableCellContent({ id, field }: Props) {
  const req = useSelector((state: RootState) => state.file.present.requirements[id]);
  const fields = useSelector((state: RootState) => state.file.present.fields);
  const focus = useSelector((state: RootState) => state.app.focus);
  const editMode = useSelector((state: RootState) => state.app.editMode);

  if (!req) return null;

  const isFocused = focus?.id === id && focus?.field === field;
  const isEditable = isFocused && (focus?.editable ?? false) && (editMode || (focus?.postCreate ?? false));

  if (field === 'id') return <IdField req={req} />;
  if (field === 'content') return <ContentField id={id} req={req} editable={isEditable} />;
  if (field === 'links') return <LinkField id={id} />;

  const fieldDef = fields.find((f) => f.name === field);
  const value = req[field];

  if (fieldDef?.type === 'RichText') {
    return (
      <RichTextField id={id} field={field} value={value as string | undefined} editable={isEditable} />
    );
  }
  if (fieldDef?.type === 'Integer' || fieldDef?.type === 'Real') {
    return (
      <NumField id={id} field={field} value={value as number | undefined} editable={isEditable} />
    );
  }
  if (fieldDef?.type === 'String') {
    return (
      <SingleLinePlainTextField
        id={id}
        field={field}
        value={value as string | undefined}
        editable={isEditable}
      />
    );
  }

  return <RawField value={value} />;
}

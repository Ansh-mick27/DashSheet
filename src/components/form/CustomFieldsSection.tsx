// ==========================================
// DashSheet — Renders SuperAdmin-defined
// extra fields for a report form
// ==========================================
import { CustomField, ExtraFields } from '../../types';
import FormField from './FormField';
import FormSelect from './FormSelect';
import FormTextarea from './FormTextarea';

interface CustomFieldsSectionProps {
  fields: CustomField[];
  values: ExtraFields;
  onChange: (key: string, value: string | number | boolean) => void;
}

export default function CustomFieldsSection({ fields, values, onChange }: CustomFieldsSectionProps) {
  if (fields.length === 0) return null;

  return (
    <>
      <h3 className="form-section-title">Additional Fields</h3>
      <div className="form-grid">
        {fields.map(field => {
          const value = values[field.fieldKey];

          if (field.fieldType === 'textarea') {
            return (
              <FormTextarea
                key={field.id}
                label={field.label}
                name={field.fieldKey}
                value={(value as string) ?? ''}
                onChange={v => onChange(field.fieldKey, v)}
                required={field.required}
              />
            );
          }

          if (field.fieldType === 'select') {
            return (
              <FormSelect
                key={field.id}
                label={field.label}
                name={field.fieldKey}
                value={(value as string) ?? ''}
                onChange={v => onChange(field.fieldKey, v)}
                options={field.options}
                required={field.required}
              />
            );
          }

          if (field.fieldType === 'checkbox') {
            return (
              <label key={field.id} className="form-checkbox-inline">
                <input
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={e => onChange(field.fieldKey, e.target.checked)}
                />
                {field.label}{field.required && ' *'}
              </label>
            );
          }

          if (field.fieldType === 'number') {
            return (
              <FormField
                key={field.id}
                label={field.label}
                name={field.fieldKey}
                type="number"
                value={(value as number) ?? ''}
                onChange={v => onChange(field.fieldKey, Number(v))}
                required={field.required}
              />
            );
          }

          if (field.fieldType === 'date') {
            return (
              <FormField
                key={field.id}
                label={field.label}
                name={field.fieldKey}
                type="date"
                value={(value as string) ?? ''}
                onChange={v => onChange(field.fieldKey, v)}
                required={field.required}
              />
            );
          }

          return (
            <FormField
              key={field.id}
              label={field.label}
              name={field.fieldKey}
              value={(value as string) ?? ''}
              onChange={v => onChange(field.fieldKey, v)}
              required={field.required}
            />
          );
        })}
      </div>
    </>
  );
}

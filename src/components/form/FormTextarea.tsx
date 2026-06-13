// ==========================================
// DashSheet — Form Textarea
// ==========================================
import { ChangeEvent } from 'react';

interface FormTextareaProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  rows?: number;
}

export default function FormTextarea({
  label, name, value, onChange, required, placeholder, rows = 4
}: FormTextareaProps) {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value);

  return (
    <div className="settings-form__field">
      <label htmlFor={name}>{label}{required && ' *'}</label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        required={required}
        placeholder={placeholder}
        rows={rows}
        className="settings-form__input form-textarea"
      />
    </div>
  );
}

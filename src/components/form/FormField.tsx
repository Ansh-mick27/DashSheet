// ==========================================
// DashSheet — Form Field (text/number/date input)
// ==========================================
import { ChangeEvent } from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  readOnly?: boolean;
  min?: number;
  max?: number;
}

export default function FormField({
  label, name, type = 'text', value, onChange, required, placeholder, readOnly, min, max
}: FormFieldProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value);

  return (
    <div className="settings-form__field">
      <label htmlFor={name}>{label}{required && ' *'}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        required={required}
        placeholder={placeholder}
        readOnly={readOnly}
        min={min}
        max={max}
        className="settings-form__input"
      />
    </div>
  );
}

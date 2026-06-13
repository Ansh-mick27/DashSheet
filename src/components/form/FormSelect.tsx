// ==========================================
// DashSheet — Form Select
// ==========================================
import { ChangeEvent } from 'react';

interface FormSelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
  placeholder?: string;
}

export default function FormSelect({
  label, name, value, onChange, options, required, placeholder = 'Select...'
}: FormSelectProps) {
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value);

  return (
    <div className="settings-form__field">
      <label htmlFor={name}>{label}{required && ' *'}</label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        required={required}
        className="settings-form__input"
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

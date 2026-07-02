// ==========================================
// DashSheet — Form Select
// ==========================================
import { useState, useEffect, ChangeEvent } from 'react';

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
  const hasOther = options.includes('Other');

  // Derive initial display state — if value is non-empty and not in options, it's a custom "other" text
  const initIsOther = hasOther && value !== '' && !options.includes(value);
  const [selectVal, setSelectVal] = useState(initIsOther ? 'Other' : value);
  const [otherText, setOtherText] = useState(initIsOther ? value : '');

  // Reset internal state when the parent clears the field (form reset)
  useEffect(() => {
    if (value === '') {
      setSelectVal('');
      setOtherText('');
    }
  }, [value]);

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    setSelectVal(v);
    if (v !== 'Other') {
      setOtherText('');
      onChange(v);
    }
    // When 'Other' is chosen we wait for the text input before propagating
  };

  const handleOtherChange = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setOtherText(text);
    onChange(text);
  };

  return (
    <div className="settings-form__field">
      <label htmlFor={name}>{label}{required && ' *'}</label>
      <select
        id={name}
        name={name}
        value={selectVal}
        onChange={handleSelectChange}
        required={required}
        className="settings-form__input"
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      {hasOther && selectVal === 'Other' && (
        <input
          type="text"
          id={`${name}_other`}
          name={`${name}_other`}
          className="settings-form__input"
          value={otherText}
          onChange={handleOtherChange}
          placeholder="Please specify…"
          required={required}
          style={{ marginTop: 6 }}
        />
      )}
    </div>
  );
}

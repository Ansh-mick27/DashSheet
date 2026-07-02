// ==========================================
// DashSheet — Form Radio Group
// ==========================================
import { useState, useEffect, ChangeEvent } from 'react';

interface FormRadioGroupProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
}

export default function FormRadioGroup({ label, name, value, onChange, options, required }: FormRadioGroupProps) {
  const hasOther = options.includes('Other');

  const initIsOther = hasOther && value !== '' && !options.includes(value);
  const [radioVal, setRadioVal] = useState(initIsOther ? 'Other' : value);
  const [otherText, setOtherText] = useState(initIsOther ? value : '');

  useEffect(() => {
    if (value === '') {
      setRadioVal('');
      setOtherText('');
    }
  }, [value]);

  const handleChange = (opt: string) => {
    setRadioVal(opt);
    if (opt !== 'Other') {
      setOtherText('');
      onChange(opt);
    }
  };

  const handleOtherChange = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setOtherText(text);
    onChange(text);
  };

  return (
    <div className="settings-form__field">
      <label>{label}{required && ' *'}</label>
      <div className="form-radio-group">
        {options.map(option => (
          <label key={option} className="form-radio">
            <input
              type="radio"
              name={name}
              value={option}
              checked={radioVal === option}
              onChange={() => handleChange(option)}
              required={required && !radioVal}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
      {hasOther && radioVal === 'Other' && (
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

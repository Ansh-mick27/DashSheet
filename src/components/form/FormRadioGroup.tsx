// ==========================================
// DashSheet — Form Radio Group
// ==========================================
interface FormRadioGroupProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
}

export default function FormRadioGroup({ label, name, value, onChange, options, required }: FormRadioGroupProps) {
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
              checked={value === option}
              onChange={() => onChange(option)}
              required={required}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

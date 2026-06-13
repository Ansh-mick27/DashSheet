// ==========================================
// DashSheet — Form Checkbox Group (teaching methods)
// ==========================================
import { TEACHING_METHODS } from '../../data/constants';
import { TrainingReport } from '../../types';

type Methods = TrainingReport['methods'];

interface FormCheckboxGroupProps {
  label: string;
  value: Methods;
  onChange: (value: Methods) => void;
  methods?: string[];
}

export default function FormCheckboxGroup({ label, value, onChange, methods = TEACHING_METHODS }: FormCheckboxGroupProps) {
  const toggle = (method: string) => {
    const selected = value.selected.includes(method)
      ? value.selected.filter(m => m !== method)
      : [...value.selected, method];
    onChange({ ...value, selected });
  };

  return (
    <div className="settings-form__field">
      <label>{label}</label>
      <div className="form-checkbox-group">
        {methods.map(method => (
          <label key={method} className="form-checkbox">
            <input
              type="checkbox"
              checked={value.selected.includes(method)}
              onChange={() => toggle(method)}
            />
            <span>{method}</span>
          </label>
        ))}
      </div>
      <input
        type="text"
        value={value.other}
        onChange={e => onChange({ ...value, other: e.target.value })}
        placeholder="Other (specify)"
        className="settings-form__input form-checkbox-other"
      />
    </div>
  );
}

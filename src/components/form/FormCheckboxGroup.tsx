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
}

export default function FormCheckboxGroup({ label, value, onChange }: FormCheckboxGroupProps) {
  const toggle = (key: keyof Omit<Methods, 'other'>) => {
    onChange({ ...value, [key]: !value[key] });
  };

  return (
    <div className="settings-form__field">
      <label>{label}</label>
      <div className="form-checkbox-group">
        {TEACHING_METHODS.map(({ key, label: methodLabel }) => (
          <label key={key} className="form-checkbox">
            <input
              type="checkbox"
              checked={value[key]}
              onChange={() => toggle(key)}
            />
            <span>{methodLabel}</span>
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

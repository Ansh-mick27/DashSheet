// ==========================================
// DashSheet — Hiring Rounds Configuration
// ==========================================
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { HiringRound } from '../../types';
import { ROUND_DELIVERY_MODES } from '../../data/constants';

interface RoundsConfigProps {
  value: HiringRound[];
  onChange: (value: HiringRound[]) => void;
}

export default function RoundsConfig({ value, onChange }: RoundsConfigProps) {
  const addRound = () => onChange([...value, { name: '', mode: '' }]);
  const removeRound = (index: number) => onChange(value.filter((_, i) => i !== index));
  const updateRound = (index: number, patch: Partial<HiringRound>) => {
    onChange(value.map((round, i) => i === index ? { ...round, ...patch } : round));
  };
  const moveRound = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const updated = [...value];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    onChange(updated);
  };

  return (
    <div className="rounds-config">
      {value.length > 0 && (
        <div className="rounds-config__header">
          <span>#</span>
          <span>Round Name</span>
          <span>Delivery Mode</span>
          <span></span>
        </div>
      )}
      {value.map((round, i) => (
        <div className="rounds-config__row" key={i}>
          <span className="rounds-config__index">{i + 1}</span>
          <input
            type="text"
            className="settings-form__input"
            value={round.name}
            onChange={e => updateRound(i, { name: e.target.value })}
            placeholder="e.g. Online Assessment"
          />
          <select
            className="settings-form__input"
            value={round.mode}
            onChange={e => updateRound(i, { mode: e.target.value as HiringRound['mode'] })}
          >
            <option value="">Select mode...</option>
            {ROUND_DELIVERY_MODES.map(mode => <option key={mode} value={mode}>{mode}</option>)}
          </select>
          <div className="rounds-config__actions">
            <button type="button" className="rounds-config__btn" onClick={() => moveRound(i, -1)} disabled={i === 0} aria-label="Move up">
              <ArrowUp size={14} />
            </button>
            <button type="button" className="rounds-config__btn" onClick={() => moveRound(i, 1)} disabled={i === value.length - 1} aria-label="Move down">
              <ArrowDown size={14} />
            </button>
            <button type="button" className="rounds-config__btn rounds-config__btn--remove" onClick={() => removeRound(i)} aria-label="Remove round">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
      <button type="button" className="rounds-config__add" onClick={addRound}>
        <Plus size={14} /> Add Round
      </button>
    </div>
  );
}

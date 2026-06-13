// ==========================================
// DashSheet — Time Slot Grid (Work Report)
// ==========================================
import { TIME_SLOTS, TASKS, TASK_STATUSES } from '../../data/constants';
import { TimeSlotEntry } from '../../types';

interface TimeSlotGridProps {
  value: TimeSlotEntry[];
  onChange: (value: TimeSlotEntry[]) => void;
}

export default function TimeSlotGrid({ value, onChange }: TimeSlotGridProps) {
  const updateRow = (index: number, patch: Partial<TimeSlotEntry>) => {
    const updated = value.map((row, i) => i === index ? { ...row, ...patch } : row);
    onChange(updated);
  };

  return (
    <div className="time-slot-grid">
      <div className="time-slot-grid__header">
        <span>Time Slot</span>
        <span>Task</span>
        <span>Status</span>
        <span>Remarks</span>
      </div>
      {TIME_SLOTS.map((slot, i) => {
        const row = value[i] ?? { timeSlot: slot, task: '', status: '', remarks: '' };
        return (
          <div className="time-slot-grid__row" key={slot}>
            <span className="time-slot-grid__label">{slot}</span>
            <select
              className="settings-form__input"
              value={row.task}
              onChange={e => updateRow(i, { task: e.target.value })}
            >
              <option value="">Select task...</option>
              {TASKS.map(task => <option key={task} value={task}>{task}</option>)}
            </select>
            <select
              className="settings-form__input"
              value={row.status}
              onChange={e => updateRow(i, { status: e.target.value as TimeSlotEntry['status'] })}
            >
              <option value="">Select status...</option>
              {TASK_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
            </select>
            <input
              type="text"
              className="settings-form__input"
              value={row.remarks}
              onChange={e => updateRow(i, { remarks: e.target.value })}
              placeholder="Remarks"
            />
          </div>
        );
      })}
    </div>
  );
}

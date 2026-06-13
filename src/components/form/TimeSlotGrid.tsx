// ==========================================
// DashSheet — Time Slot Grid (Work Report)
// ==========================================
import { TASKS, TASK_STATUSES } from '../../data/constants';
import { TimeSlotEntry } from '../../types';

interface TimeSlotGridProps {
  value: TimeSlotEntry[];
  onChange: (value: TimeSlotEntry[]) => void;
  tasks?: string[];
  statuses?: string[];
}

export default function TimeSlotGrid({ value, onChange, tasks = TASKS, statuses = TASK_STATUSES }: TimeSlotGridProps) {
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
      {value.map((row, i) => {
        return (
          <div className="time-slot-grid__row" key={row.timeSlot}>
            <span className="time-slot-grid__label">{row.timeSlot}</span>
            <select
              className="settings-form__input"
              value={row.task}
              onChange={e => updateRow(i, { task: e.target.value })}
            >
              <option value="">Select task...</option>
              {tasks.map(task => <option key={task} value={task}>{task}</option>)}
            </select>
            <select
              className="settings-form__input"
              value={row.status}
              onChange={e => updateRow(i, { status: e.target.value as TimeSlotEntry['status'] })}
            >
              <option value="">Select status...</option>
              {statuses.map(status => <option key={status} value={status}>{status}</option>)}
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

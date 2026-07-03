// ==========================================
// DashSheet — Time Slot Grid (Work Report)
// ==========================================
import { useState, useEffect } from 'react';
import { TASKS, TASK_STATUSES } from '../../data/constants';
import { TimeSlotEntry } from '../../types';

interface TimeSlotGridProps {
  value: TimeSlotEntry[];
  onChange: (value: TimeSlotEntry[]) => void;
  tasks?: string[];
  statuses?: string[];
}

export default function TimeSlotGrid({ value, onChange, tasks = TASKS, statuses = TASK_STATUSES }: TimeSlotGridProps) {
  // Track which rows are in "Other" mode (select shows "Other", text input captures custom task)
  const [otherRows, setOtherRows] = useState<Set<number>>(new Set());

  // Reset other-mode when the form is cleared (all tasks become empty)
  useEffect(() => {
    if (value.every(row => !row.task)) {
      setOtherRows(new Set());
    }
  }, [value]);

  const updateRow = (index: number, patch: Partial<TimeSlotEntry>) => {
    onChange(value.map((row, i) => i === index ? { ...row, ...patch } : row));
  };

  const handleTaskSelect = (index: number, selected: string) => {
    if (selected === 'Other') {
      setOtherRows(prev => new Set([...prev, index]));
      // Don't call updateRow here — doing so changes `value`, triggers the reset
      // useEffect, and immediately clears otherRows before the UI can show the input.
      // The text input's onChange handler will write to the row when the user types.
    } else {
      setOtherRows(prev => { const s = new Set(prev); s.delete(index); return s; });
      updateRow(index, { task: selected });
    }
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
        const isOther = otherRows.has(i);
        return (
          <div className="time-slot-grid__row" key={row.timeSlot}>
            <span className="time-slot-grid__label">{row.timeSlot}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <select
                className="settings-form__input"
                value={isOther ? 'Other' : row.task}
                onChange={e => handleTaskSelect(i, e.target.value)}
              >
                <option value="">Select task...</option>
                {tasks.map(task => <option key={task} value={task}>{task}</option>)}
              </select>
              {isOther && (
                <input
                  type="text"
                  className="settings-form__input"
                  value={row.task}
                  onChange={e => updateRow(i, { task: e.target.value })}
                  placeholder="Specify task…"
                />
              )}
            </div>
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

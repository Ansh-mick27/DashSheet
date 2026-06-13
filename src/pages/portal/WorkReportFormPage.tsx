// ==========================================
// DashSheet — Work Report Form Page
// ==========================================
import { useState, useMemo, FormEvent } from 'react';
import { CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { submitWorkReport } from '../../services/dataApi';
import { todayISO, isoToDDMMYYYY } from '../../lib/dateUtils';
import { TIME_SLOTS, TASKS } from '../../data/constants';
import { WorkReport, TimeSlotEntry, ExtraFields } from '../../types';
import { useFormConfig } from '../../lib/useFormConfig';
import { mergeOptions } from '../../lib/options';
import FormField from '../../components/form/FormField';
import FormTextarea from '../../components/form/FormTextarea';
import TimeSlotGrid from '../../components/form/TimeSlotGrid';
import CustomFieldsSection from '../../components/form/CustomFieldsSection';

function emptyTimeSlots(): TimeSlotEntry[] {
  return TIME_SLOTS.map(slot => ({ timeSlot: slot, task: '', status: '', remarks: '' }));
}

export default function WorkReportFormPage() {
  const { member } = useAuth();
  const [date, setDate] = useState(todayISO());
  const [timeSlots, setTimeSlots] = useState<TimeSlotEntry[]>(emptyTimeSlots());
  const [keyAccomplishments, setKeyAccomplishments] = useState('');
  const [challengesSolutions, setChallengesSolutions] = useState('');
  const [pendingWork, setPendingWork] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [reviewedBy, setReviewedBy] = useState('');
  const [extraFields, setExtraFields] = useState<ExtraFields>({});
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const { fieldOptions, customFields } = useFormConfig('work');
  const tasks = useMemo(() => mergeOptions(TASKS, fieldOptions, 'tasks'), [fieldOptions]);

  const handleExtraChange = (key: string, value: string | number | boolean) => {
    setExtraFields(prev => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setDate(todayISO());
    setTimeSlots(emptyTimeSlots());
    setKeyAccomplishments(''); setChallengesSolutions(''); setPendingWork('');
    setAdditionalNotes(''); setReviewedBy('');
    setExtraFields({});
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!member) return;
    setStatus('saving');
    try {
      const report: WorkReport = {
        timestamp: new Date().toISOString(),
        trainerName: member.name,
        date: isoToDDMMYYYY(date),
        department: member.department,
        batch: member.batch,
        timeSlots,
        keyAccomplishments,
        challengesSolutions,
        pendingWork,
        additionalNotes,
        reviewedBy,
        extraFields
      };
      await submitWorkReport(report);
      setStatus('success');
      resetForm();
      setTimeout(() => setStatus('idle'), 4000);
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Work Report</h2>
          <p className="page-subtitle">Record your daily task schedule</p>
        </div>
      </div>

      <div className="settings-card">
        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-grid form-grid--3">
            <FormField label="Trainer Name" name="trainerName" value={member?.name ?? ''} onChange={() => {}} readOnly />
            <FormField label="Department" name="department" value={member?.department ?? ''} onChange={() => {}} readOnly />
            <FormField label="Date" name="date" type="date" value={date} onChange={setDate} required />
          </div>

          <div className="form-section-title">Daily Schedule</div>
          <TimeSlotGrid value={timeSlots} onChange={setTimeSlots} tasks={tasks} />

          <div className="form-section-title">Summary</div>
          <FormTextarea label="Key Accomplishments" name="keyAccomplishments" value={keyAccomplishments} onChange={setKeyAccomplishments} rows={2} required />
          <FormTextarea label="Challenges & Solutions" name="challengesSolutions" value={challengesSolutions} onChange={setChallengesSolutions} rows={2} />
          <FormTextarea label="Pending Work" name="pendingWork" value={pendingWork} onChange={setPendingWork} rows={2} />
          <FormTextarea label="Additional Notes" name="additionalNotes" value={additionalNotes} onChange={setAdditionalNotes} rows={2} />
          <FormField label="Reviewed By (optional)" name="reviewedBy" value={reviewedBy} onChange={setReviewedBy} />

          <CustomFieldsSection fields={customFields} values={extraFields} onChange={handleExtraChange} />

          <div className="settings-form__actions">
            <button type="submit" disabled={status === 'saving'} className="btn btn--primary">
              <Send size={18} />
              {status === 'saving' ? 'Submitting...' : 'Submit Report'}
            </button>

            {status === 'success' && (
              <span className="settings-form__status settings-form__status--success">
                <CheckCircle2 size={18} /> Report submitted successfully!
              </span>
            )}
            {status === 'error' && (
              <span className="settings-form__status settings-form__status--error">
                <AlertCircle size={18} /> Failed to submit report. Please try again.
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

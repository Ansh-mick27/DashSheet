// ==========================================
// DashSheet — Work Report Form Page
// ==========================================
import { useState, useMemo, useEffect, FormEvent } from 'react';
import { CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { submitWorkReport } from '../../services/dataApi';
import { todayISO, isoToDDMMYYYY } from '../../lib/dateUtils';
import { TIME_SLOTS, TASKS, TASK_STATUSES, DRIVE_TEST_STATUSES, INTERNSHIP_ACTIVITIES } from '../../data/constants';
import { WorkReport, TimeSlotEntry, ExtraFields, PlacementDriveEntry, PlacementInternshipEntry, Member } from '../../types';
import { useFormConfig } from '../../lib/useFormConfig';
import { mergeOptions } from '../../lib/options';
import FormField from '../../components/form/FormField';
import FormTextarea from '../../components/form/FormTextarea';
import TimeSlotGrid from '../../components/form/TimeSlotGrid';
import CustomFieldsSection from '../../components/form/CustomFieldsSection';
import { Plus, Trash2 } from 'lucide-react';

const TH: React.CSSProperties = {
  padding: '8px 10px', textAlign: 'left', fontWeight: 600, fontSize: 12,
  whiteSpace: 'nowrap', borderBottom: '2px solid rgba(99,102,241,0.25)',
  background: 'rgba(99,102,241,0.07)', color: 'inherit', opacity: 0.9,
};
const TD: React.CSSProperties = {
  padding: '5px 6px', verticalAlign: 'middle',
  borderBottom: '1px solid rgba(100,116,139,0.15)',
};

const emptyDriveRow = (): PlacementDriveEntry =>
  ({ companyName: '', profile: '', ctc: '', location: '', eligibleStudents: '', applied: '', appear: '', testStatus: '', interviewStatus: '', remark: '' });

const emptyInternshipRow = (): PlacementInternshipEntry =>
  ({ activity: '', batchDept: '', noStudents: '', trainerCompany: '', status: '', remarks: '' });

function emptyTimeSlots(slots: string[]): TimeSlotEntry[] {
  return slots.map(slot => ({ timeSlot: slot, task: '', status: '', remarks: '' }));
}

interface WorkReportFormPageProps {
  adminMembers?: Member[];
}

export default function WorkReportFormPage({ adminMembers }: WorkReportFormPageProps = {}) {
  const { member } = useAuth();
  const isAdminMode = Boolean(adminMembers);
  const [adminSelectedMember, setAdminSelectedMember] = useState<Member | null>(null);
  const activeMember = isAdminMode ? adminSelectedMember : member;
  const [date, setDate] = useState(todayISO());
  const [timeSlots, setTimeSlots] = useState<TimeSlotEntry[]>(emptyTimeSlots(TIME_SLOTS));
  const [keyAccomplishments, setKeyAccomplishments] = useState('');
  const [challengesSolutions, setChallengesSolutions] = useState('');
  const [pendingWork, setPendingWork] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [placementDriveUpdate, setPlacementDriveUpdate] = useState<PlacementDriveEntry[]>([emptyDriveRow(), emptyDriveRow(), emptyDriveRow()]);
  const [internshipCoord, setInternshipCoord] = useState<PlacementInternshipEntry[]>([emptyInternshipRow(), emptyInternshipRow(), emptyInternshipRow()]);
  const [otherInternshipRows, setOtherInternshipRows] = useState<Set<number>>(new Set());
  const [extraFields, setExtraFields] = useState<ExtraFields>({});
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const { fieldOptions, customFields } = useFormConfig('work');
  const tasks = useMemo(() => mergeOptions(TASKS, fieldOptions, 'tasks'), [fieldOptions]);
  const taskStatuses = useMemo(() => mergeOptions(TASK_STATUSES, fieldOptions, 'taskStatuses'), [fieldOptions]);
  const timeSlotLabels = useMemo(() => mergeOptions(TIME_SLOTS, fieldOptions, 'timeSlots'), [fieldOptions]);

  // Keep the time slot grid in sync with SuperAdmin-managed slots, preserving any entered data.
  useEffect(() => {
    setTimeSlots(prev => {
      const sameSlots = prev.length === timeSlotLabels.length && prev.every((row, i) => row.timeSlot === timeSlotLabels[i]);
      if (sameSlots) return prev;
      return timeSlotLabels.map(slot => prev.find(row => row.timeSlot === slot) ?? { timeSlot: slot, task: '', status: '', remarks: '' });
    });
  }, [timeSlotLabels]);

  const handleExtraChange = (key: string, value: string | number | boolean) => {
    setExtraFields(prev => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setDate(todayISO());
    setTimeSlots(emptyTimeSlots(timeSlotLabels));
    setKeyAccomplishments(''); setChallengesSolutions(''); setPendingWork('');
    setAdditionalNotes('');
    setPlacementDriveUpdate([emptyDriveRow(), emptyDriveRow(), emptyDriveRow()]);
    setInternshipCoord([emptyInternshipRow(), emptyInternshipRow(), emptyInternshipRow()]);
    setOtherInternshipRows(new Set());
    setExtraFields({});
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeMember) return;
    setStatus('saving');
    try {
      const report: WorkReport = {
        timestamp: new Date().toISOString(),
        trainerName: activeMember.name,
        date: isoToDDMMYYYY(date),
        department: activeMember.department,
        batch: activeMember.batch,
        timeSlots,
        keyAccomplishments,
        challengesSolutions,
        pendingWork,
        additionalNotes,
        placementDriveUpdate: placementDriveUpdate.filter(r => r.companyName),
        internshipCoordination: internshipCoord.filter(r => r.activity),
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
          <h2 className="page-title">Daily Work Report</h2>
          <p className="page-subtitle">Record your daily task schedule</p>
        </div>
      </div>

      {isAdminMode && (
        <div className="settings-card">
          <div className="form-section-title" style={{ marginBottom: 12 }}>Select Trainer &amp; Date</div>
          <div className="form-grid form-grid--2">
            <div className="settings-form__field">
              <label className="settings-form__label">Trainer Name</label>
              <select className="settings-form__input" value={adminSelectedMember?.id ?? ''}
                onChange={e => setAdminSelectedMember(adminMembers!.find(m => m.id === e.target.value) ?? null)}>
                <option value="">— Select trainer —</option>
                {adminMembers!.filter(m => m.role === 'Trainer' || m.role === 'Admin').map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.department})</option>
                ))}
              </select>
            </div>
            <div className="settings-form__field">
              <label className="settings-form__label">Date</label>
              <input type="date" className="settings-form__input" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
          </div>
        </div>
      )}
      <div className="settings-card">
        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-grid form-grid--3">
            <FormField label="Trainer Name" name="trainerName" value={activeMember?.name ?? ''} onChange={() => {}} readOnly />
            <FormField label="Department" name="department" value={activeMember?.department ?? ''} onChange={() => {}} readOnly />
            <FormField label="Date" name="date" type="date" value={date} onChange={setDate} required />
          </div>

          <div className="form-section-title">Daily Schedule</div>
          <TimeSlotGrid value={timeSlots} onChange={setTimeSlots} tasks={tasks} statuses={taskStatuses} />

          <div className="form-section-title">Summary</div>
          <FormTextarea label="Key Accomplishments" name="keyAccomplishments" value={keyAccomplishments} onChange={setKeyAccomplishments} rows={2} required />
          <FormTextarea label="Challenges & Solutions" name="challengesSolutions" value={challengesSolutions} onChange={setChallengesSolutions} rows={2} />
          <FormTextarea label="Pending Work" name="pendingWork" value={pendingWork} onChange={setPendingWork} rows={2} />
          <FormTextarea label="Additional Notes" name="additionalNotes" value={additionalNotes} onChange={setAdditionalNotes} rows={2} />

          <div className="form-section-title">Placement Drive Update</div>
          <div className="tbl-scroll">
            <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%', minWidth: 820 }}>
              <thead>
                <tr>
                  {['Company Name', 'Profile', 'CTC', 'Location', 'No. Eligible', 'No. Applied', 'Appear', 'Test Status', 'Interview Status', 'Remark', ''].map(h => (
                    <th key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {placementDriveUpdate.map((row, i) => (
                  <tr key={i}>
                    <td style={{ ...TD, minWidth: 90 }}><input className="settings-form__input" style={{ minWidth: 78 }} value={row.companyName} onChange={e => setPlacementDriveUpdate(prev => prev.map((r, j) => j === i ? { ...r, companyName: e.target.value } : r))} placeholder="Company" /></td>
                    <td style={{ ...TD, minWidth: 75 }}><input className="settings-form__input" style={{ minWidth: 63 }} value={row.profile} onChange={e => setPlacementDriveUpdate(prev => prev.map((r, j) => j === i ? { ...r, profile: e.target.value } : r))} placeholder="Role" /></td>
                    <td style={{ ...TD, minWidth: 60 }}><input className="settings-form__input" style={{ minWidth: 48 }} value={row.ctc} onChange={e => setPlacementDriveUpdate(prev => prev.map((r, j) => j === i ? { ...r, ctc: e.target.value } : r))} placeholder="LPA" /></td>
                    <td style={{ ...TD, minWidth: 70 }}><input className="settings-form__input" style={{ minWidth: 58 }} value={row.location} onChange={e => setPlacementDriveUpdate(prev => prev.map((r, j) => j === i ? { ...r, location: e.target.value } : r))} placeholder="City" /></td>
                    <td style={{ ...TD, minWidth: 60 }}><input className="settings-form__input" style={{ minWidth: 48 }} type="number" value={row.eligibleStudents} onChange={e => setPlacementDriveUpdate(prev => prev.map((r, j) => j === i ? { ...r, eligibleStudents: e.target.value } : r))} placeholder="0" min={0} /></td>
                    <td style={{ ...TD, minWidth: 60 }}><input className="settings-form__input" style={{ minWidth: 48 }} type="number" value={row.applied} onChange={e => setPlacementDriveUpdate(prev => prev.map((r, j) => j === i ? { ...r, applied: e.target.value } : r))} placeholder="0" min={0} /></td>
                    <td style={{ ...TD, minWidth: 60 }}><input className="settings-form__input" style={{ minWidth: 48 }} type="number" value={row.appear} onChange={e => setPlacementDriveUpdate(prev => prev.map((r, j) => j === i ? { ...r, appear: e.target.value } : r))} placeholder="0" min={0} /></td>
                    <td style={{ ...TD, minWidth: 85 }}><select className="settings-form__input" style={{ minWidth: 73 }} value={row.testStatus} onChange={e => setPlacementDriveUpdate(prev => prev.map((r, j) => j === i ? { ...r, testStatus: e.target.value } : r))}><option value="">Select...</option>{DRIVE_TEST_STATUSES.map(o => <option key={o}>{o}</option>)}</select></td>
                    <td style={{ ...TD, minWidth: 85 }}><select className="settings-form__input" style={{ minWidth: 73 }} value={row.interviewStatus} onChange={e => setPlacementDriveUpdate(prev => prev.map((r, j) => j === i ? { ...r, interviewStatus: e.target.value } : r))}><option value="">Select...</option>{DRIVE_TEST_STATUSES.map(o => <option key={o}>{o}</option>)}</select></td>
                    <td style={{ ...TD, minWidth: 85 }}><input className="settings-form__input" style={{ minWidth: 73 }} value={row.remark} onChange={e => setPlacementDriveUpdate(prev => prev.map((r, j) => j === i ? { ...r, remark: e.target.value } : r))} placeholder="Remark" /></td>
                    <td style={{ ...TD, width: 36 }}>{placementDriveUpdate.length > 1 && <button type="button" className="btn btn--ghost btn--sm" onClick={() => setPlacementDriveUpdate(prev => prev.filter((_, j) => j !== i))}><Trash2 size={13} /></button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className="btn btn--ghost btn--sm" style={{ marginTop: 8 }} onClick={() => setPlacementDriveUpdate(prev => [...prev, emptyDriveRow()])}><Plus size={13} /> Add Row</button>

          <div className="form-section-title" style={{ marginTop: 24 }}>Internship / Training Coordination</div>
          <div className="tbl-scroll">
            <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%', minWidth: 720 }}>
              <thead>
                <tr>
                  {['Activity', 'Batch / Department', 'No. of Students', 'Trainer / Company', 'Status', 'Remarks', ''].map(h => (
                    <th key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {internshipCoord.map((row, i) => {
                  const isOtherI = otherInternshipRows.has(i);
                  return (
                    <tr key={i}>
                      <td style={{ ...TD, minWidth: 200 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <select className="settings-form__input" style={{ minWidth: 180 }}
                            value={isOtherI ? 'Other' : row.activity}
                            onChange={e => {
                              if (e.target.value === 'Other') {
                                setOtherInternshipRows(prev => new Set([...prev, i]));
                              } else {
                                setOtherInternshipRows(prev => { const s = new Set(prev); s.delete(i); return s; });
                                setInternshipCoord(prev => prev.map((r, j) => j === i ? { ...r, activity: e.target.value } : r));
                              }
                            }}>
                            <option value="">Select activity...</option>
                            {INTERNSHIP_ACTIVITIES.map(a => <option key={a} value={a}>{a}</option>)}
                          </select>
                          {isOtherI && <input className="settings-form__input" style={{ minWidth: 180 }} value={row.activity} onChange={e => setInternshipCoord(prev => prev.map((r, j) => j === i ? { ...r, activity: e.target.value } : r))} placeholder="Specify activity…" />}
                        </div>
                      </td>
                      <td style={{ ...TD, minWidth: 130 }}><input className="settings-form__input" style={{ minWidth: 118 }} value={row.batchDept} onChange={e => setInternshipCoord(prev => prev.map((r, j) => j === i ? { ...r, batchDept: e.target.value } : r))} placeholder="Batch / Dept." /></td>
                      <td style={{ ...TD, minWidth: 90 }}><input className="settings-form__input" style={{ minWidth: 78 }} type="number" value={row.noStudents} onChange={e => setInternshipCoord(prev => prev.map((r, j) => j === i ? { ...r, noStudents: e.target.value } : r))} placeholder="0" min={0} /></td>
                      <td style={{ ...TD, minWidth: 130 }}><input className="settings-form__input" style={{ minWidth: 118 }} value={row.trainerCompany} onChange={e => setInternshipCoord(prev => prev.map((r, j) => j === i ? { ...r, trainerCompany: e.target.value } : r))} placeholder="Trainer / Company" /></td>
                      <td style={{ ...TD, minWidth: 110 }}><select className="settings-form__input" style={{ minWidth: 98 }} value={row.status} onChange={e => setInternshipCoord(prev => prev.map((r, j) => j === i ? { ...r, status: e.target.value as PlacementInternshipEntry['status'] } : r))}><option value="">Select...</option><option>Completed</option><option>Pending</option></select></td>
                      <td style={{ ...TD, minWidth: 140 }}><input className="settings-form__input" style={{ minWidth: 128 }} value={row.remarks} onChange={e => setInternshipCoord(prev => prev.map((r, j) => j === i ? { ...r, remarks: e.target.value } : r))} placeholder="Remarks" /></td>
                      <td style={{ ...TD, width: 36 }}>{internshipCoord.length > 1 && <button type="button" className="btn btn--ghost btn--sm" onClick={() => { setInternshipCoord(prev => prev.filter((_, j) => j !== i)); setOtherInternshipRows(prev => { const s = new Set(prev); s.delete(i); return s; }); }}><Trash2 size={13} /></button>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button type="button" className="btn btn--ghost btn--sm" style={{ marginTop: 8 }} onClick={() => setInternshipCoord(prev => [...prev, emptyInternshipRow()])}><Plus size={13} /> Add Row</button>

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

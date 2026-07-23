// ==========================================
// DashSheet — Placement Officer Daily Task Report Form
// ==========================================
import { useState, FormEvent } from 'react';
import { CheckCircle2, AlertCircle, Send, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { submitPlacementWorkReport } from '../../services/dataApi';
import { todayISO, isoToDDMMYYYY } from '../../lib/dateUtils';
import {
  PLACEMENT_WORK_LOG_SLOTS, PLACEMENT_ENGAGEMENT_PURPOSES, PLACEMENT_ENGAGEMENT_MODES,
  STUDENT_ENGAGEMENT_PURPOSES, STUDENT_ENGAGEMENT_STATUSES, DRIVE_TEST_STATUSES,
  INTERNSHIP_ACTIVITIES, MIS_TASKS, PRIORITIES, RELATED_TO_OPTIONS,
} from '../../data/constants';
import {
  PlacementWorkReport, PlacementWorkLogEntry, PlacementCompanyEngagementEntry,
  PlacementStudentEngagementEntry, PlacementDriveEntry, PlacementInternshipEntry,
  PlacementMISEntry, PlacementPendingWorkEntry, PlacementIssueSupportEntry, ExtraFields,
} from '../../types';
import { useFormConfig } from '../../lib/useFormConfig';
import FormField from '../../components/form/FormField';
import FormTextarea from '../../components/form/FormTextarea';
import CustomFieldsSection from '../../components/form/CustomFieldsSection';

// Shared table styles
const TH: React.CSSProperties = {
  padding: '8px 10px', textAlign: 'left', fontWeight: 600, fontSize: 12,
  whiteSpace: 'nowrap', borderBottom: '2px solid rgba(99,102,241,0.25)',
  background: 'rgba(99,102,241,0.07)', color: 'inherit', opacity: 0.9,
};
const TD: React.CSSProperties = {
  padding: '5px 6px', verticalAlign: 'middle',
  borderBottom: '1px solid rgba(100,116,139,0.15)',
};
const STATIC_CELL: React.CSSProperties = { fontSize: 12, opacity: 0.85, whiteSpace: 'nowrap' };

const emptyCompanyRow = (): PlacementCompanyEngagementEntry =>
  ({ companyName: '', hrContact: '', location: '', purpose: '', mode: '', outcome: '', remark: '' });

const emptyStudentRow = (): PlacementStudentEngagementEntry =>
  ({ studentName: '', purpose: '', issueIdentified: '', actionTaken: '', status: '' });

const emptyDriveRow = (): PlacementDriveEntry =>
  ({ companyName: '', profile: '', ctc: '', location: '', eligibleStudents: '', applied: '', appear: '', testStatus: '', interviewStatus: '', remark: '' });

const emptyPendingRow = (): PlacementPendingWorkEntry =>
  ({ pendingTask: '', personConcerned: '', targetDate: '', priority: '' });

const emptyIssueRow = (): PlacementIssueSupportEntry =>
  ({ issue: '', relatedTo: '', supportRequired: '', urgency: '' });

function initWorkLog(): PlacementWorkLogEntry[] {
  return PLACEMENT_WORK_LOG_SLOTS.map(s => ({ timeSlot: s.timeSlot, activity: s.activity, involved: '', status: '', remarks: '' }));
}

function initInternship(): PlacementInternshipEntry[] {
  return INTERNSHIP_ACTIVITIES.map(a => ({ activity: a, batchDept: '', noStudents: '', trainerCompany: '', status: '', remarks: '' }));
}

function initMIS(): PlacementMISEntry[] {
  return MIS_TASKS.map(t => ({ task: t, status: '', remarks: '' }));
}

export default function PlacementWorkReportFormPage() {
  const { member } = useAuth();
  const [date, setDate] = useState(todayISO());
  const [department, setDepartment] = useState(member?.department ?? '');
  const [reportingTo, setReportingTo] = useState('');

  const [workLog, setWorkLog] = useState<PlacementWorkLogEntry[]>(initWorkLog);

  const [companyEngagement, setCompanyEngagement] = useState<PlacementCompanyEngagementEntry[]>(
    [emptyCompanyRow(), emptyCompanyRow(), emptyCompanyRow()]
  );
  const [totalCompaniesContacted, setTotalCompaniesContacted] = useState('');
  const [newCompaniesApproached, setNewCompaniesApproached] = useState('');
  const [followUpCompanies, setFollowUpCompanies] = useState('');
  const [confirmedOpportunities, setConfirmedOpportunities] = useState('');

  const [studentEngagement, setStudentEngagement] = useState<PlacementStudentEngagementEntry[]>(
    [emptyStudentRow(), emptyStudentRow(), emptyStudentRow()]
  );
  const [totalStudentsInteracted, setTotalStudentsInteracted] = useState('');
  const [resumeReviewsDone, setResumeReviewsDone] = useState('');
  const [mockInterviewsSupport, setMockInterviewsSupport] = useState('');
  const [studentsGuidedApplications, setStudentsGuidedApplications] = useState('');

  const [placementDriveUpdate, setPlacementDriveUpdate] = useState<PlacementDriveEntry[]>(
    [emptyDriveRow(), emptyDriveRow(), emptyDriveRow()]
  );

  const [internshipCoord, setInternshipCoord] = useState<PlacementInternshipEntry[]>(initInternship);
  const [misDoc, setMisDoc] = useState<PlacementMISEntry[]>(initMIS);

  const [achievement1, setAchievement1] = useState('');
  const [achievement2, setAchievement2] = useState('');
  const [achievement3, setAchievement3] = useState('');

  const [pendingWork, setPendingWork] = useState<PlacementPendingWorkEntry[]>(
    [emptyPendingRow(), emptyPendingRow(), emptyPendingRow()]
  );
  const [issuesSupport, setIssuesSupport] = useState<PlacementIssueSupportEntry[]>(
    [emptyIssueRow(), emptyIssueRow(), emptyIssueRow()]
  );

  const [extraFields, setExtraFields] = useState<ExtraFields>({});
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const { customFields } = useFormConfig('placement_work');

  const resetForm = () => {
    setDate(todayISO()); setDepartment(member?.department ?? ''); setReportingTo('');
    setWorkLog(initWorkLog());
    setCompanyEngagement([emptyCompanyRow(), emptyCompanyRow(), emptyCompanyRow()]);
    setTotalCompaniesContacted(''); setNewCompaniesApproached(''); setFollowUpCompanies(''); setConfirmedOpportunities('');
    setStudentEngagement([emptyStudentRow(), emptyStudentRow(), emptyStudentRow()]);
    setTotalStudentsInteracted(''); setResumeReviewsDone(''); setMockInterviewsSupport(''); setStudentsGuidedApplications('');
    setPlacementDriveUpdate([emptyDriveRow(), emptyDriveRow(), emptyDriveRow()]);
    setInternshipCoord(initInternship()); setMisDoc(initMIS());
    setAchievement1(''); setAchievement2(''); setAchievement3('');
    setPendingWork([emptyPendingRow(), emptyPendingRow(), emptyPendingRow()]);
    setIssuesSupport([emptyIssueRow(), emptyIssueRow(), emptyIssueRow()]);
    setExtraFields({});
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!member) return;
    setStatus('saving');
    try {
      const report: PlacementWorkReport = {
        timestamp: new Date().toISOString(),
        staffName: member.name,
        date: isoToDDMMYYYY(date),
        department,
        reportingTo,
        workLog,
        companyEngagement: companyEngagement.filter(r => r.companyName),
        totalCompaniesContacted: Number(totalCompaniesContacted) || 0,
        newCompaniesApproached: Number(newCompaniesApproached) || 0,
        followUpCompanies: Number(followUpCompanies) || 0,
        confirmedOpportunities: Number(confirmedOpportunities) || 0,
        studentEngagement: studentEngagement.filter(r => r.studentName),
        totalStudentsInteracted: Number(totalStudentsInteracted) || 0,
        resumeReviewsDone: Number(resumeReviewsDone) || 0,
        mockInterviewsSupport: Number(mockInterviewsSupport) || 0,
        studentsGuidedApplications: Number(studentsGuidedApplications) || 0,
        placementDriveUpdate: placementDriveUpdate.filter(r => r.companyName),
        internshipCoordination: internshipCoord,
        misDocumentation: misDoc,
        achievement1, achievement2, achievement3,
        pendingWork: pendingWork.filter(r => r.pendingTask),
        issuesSupport: issuesSupport.filter(r => r.issue),
        extraFields,
      };
      await submitPlacementWorkReport(report);
      setStatus('success');
      resetForm();
      setTimeout(() => setStatus('idle'), 4000);
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  // Generic updaters for dynamic tables
  const updateWorkLog = (i: number, patch: Partial<PlacementWorkLogEntry>) =>
    setWorkLog(prev => prev.map((r, idx) => idx === i ? { ...r, ...patch } : r));

  const updateCompany = (i: number, patch: Partial<PlacementCompanyEngagementEntry>) =>
    setCompanyEngagement(prev => prev.map((r, idx) => idx === i ? { ...r, ...patch } : r));

  const updateStudent = (i: number, patch: Partial<PlacementStudentEngagementEntry>) =>
    setStudentEngagement(prev => prev.map((r, idx) => idx === i ? { ...r, ...patch } : r));

  const updateDrive = (i: number, patch: Partial<PlacementDriveEntry>) =>
    setPlacementDriveUpdate(prev => prev.map((r, idx) => idx === i ? { ...r, ...patch } : r));

  const updateInternship = (i: number, patch: Partial<PlacementInternshipEntry>) =>
    setInternshipCoord(prev => prev.map((r, idx) => idx === i ? { ...r, ...patch } : r));

  const updateMIS = (i: number, patch: Partial<PlacementMISEntry>) =>
    setMisDoc(prev => prev.map((r, idx) => idx === i ? { ...r, ...patch } : r));

  const updatePending = (i: number, patch: Partial<PlacementPendingWorkEntry>) =>
    setPendingWork(prev => prev.map((r, idx) => idx === i ? { ...r, ...patch } : r));

  const updateIssue = (i: number, patch: Partial<PlacementIssueSupportEntry>) =>
    setIssuesSupport(prev => prev.map((r, idx) => idx === i ? { ...r, ...patch } : r));

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Placement Officer – Daily Task Report</h2>
          <p className="page-subtitle">Reporting Time: 8:30 AM to 5:30 PM</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Header Fields */}
        <div className="settings-card">
          <div className="form-grid form-grid--3">
            <FormField label="Name of Placement Officer" name="staffName" value={member?.name ?? ''} onChange={() => {}} readOnly />
            <FormField label="Date" name="date" type="date" value={date} onChange={setDate} required />
            <FormField label="Reporting To" name="reportingTo" value={reportingTo} onChange={setReportingTo} required />
          </div>
          <div className="form-grid">
            <FormField label="Department / Institute" name="department" value={department} onChange={setDepartment} required />
          </div>
        </div>

        {/* Section 1: Time-Wise Daily Work Log */}
        <div className="settings-card">
          <div className="form-section-title">1. Time-Wise Daily Work Log</div>
          <div className="tbl-scroll">
            <table style={{ borderCollapse: 'collapse', fontSize: 13, minWidth: 780 }}>
              <thead>
                <tr>
                  {['Time Slot', 'Activity / Task Performed', 'Company / Student / Dept. Involved', 'Status', 'Remarks'].map(h => (
                    <th key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {workLog.map((row, i) => {
                  const isLunch = row.timeSlot === '12:30 – 01:30';
                  return (
                    <tr key={i} style={isLunch ? { opacity: 0.65 } : {}}>
                      <td style={TD}><span style={STATIC_CELL}>{row.timeSlot}</span></td>
                      <td style={{ ...TD, minWidth: 220 }}><span style={{ fontSize: 12 }}>{row.activity}</span></td>
                      <td style={{ ...TD, minWidth: 160 }}>
                        {isLunch ? <span style={{ opacity: 0.4 }}>—</span> : (
                          <input className="settings-form__input" style={{ minWidth: 140 }} value={row.involved}
                            onChange={e => updateWorkLog(i, { involved: e.target.value })} placeholder="Enter details" />
                        )}
                      </td>
                      <td style={{ ...TD, minWidth: 120 }}>
                        {isLunch ? <span style={{ opacity: 0.4 }}>—</span> : (
                          <select className="settings-form__input" style={{ minWidth: 108 }} value={row.status}
                            onChange={e => updateWorkLog(i, { status: e.target.value as PlacementWorkLogEntry['status'] })}>
                            <option value="">Select...</option>
                            <option>Completed</option>
                            <option>Pending</option>
                          </select>
                        )}
                      </td>
                      <td style={{ ...TD, minWidth: 160 }}>
                        <input className="settings-form__input" style={{ minWidth: 140 }} value={row.remarks}
                          onChange={e => updateWorkLog(i, { remarks: e.target.value })} placeholder="Remarks" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Company / Recruiter Engagement */}
        <div className="settings-card">
          <div className="form-section-title">2. Company / Recruiter Engagement</div>
          <div className="tbl-scroll">
            <table style={{ borderCollapse: 'collapse', fontSize: 13, minWidth: 900 }}>
              <thead>
                <tr>
                  {['Sr.', 'Company Name', 'HR Contact Person', 'Location', 'Purpose', 'Mode', 'Outcome / Next Follow-up', 'Remark', ''].map(h => (
                    <th key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {companyEngagement.map((row, i) => (
                  <tr key={i}>
                    <td style={{ ...TD, width: 36, textAlign: 'center' }}><span style={STATIC_CELL}>{i + 1}</span></td>
                    <td style={{ ...TD, minWidth: 130 }}>
                      <input className="settings-form__input" style={{ minWidth: 118 }} value={row.companyName}
                        onChange={e => updateCompany(i, { companyName: e.target.value })} placeholder="Company" />
                    </td>
                    <td style={{ ...TD, minWidth: 120 }}>
                      <input className="settings-form__input" style={{ minWidth: 108 }} value={row.hrContact}
                        onChange={e => updateCompany(i, { hrContact: e.target.value })} placeholder="HR Name" />
                    </td>
                    <td style={{ ...TD, minWidth: 100 }}>
                      <input className="settings-form__input" style={{ minWidth: 88 }} value={row.location}
                        onChange={e => updateCompany(i, { location: e.target.value })} placeholder="City" />
                    </td>
                    <td style={{ ...TD, minWidth: 110 }}>
                      <select className="settings-form__input" style={{ minWidth: 98 }} value={row.purpose}
                        onChange={e => updateCompany(i, { purpose: e.target.value })}>
                        <option value="">Select...</option>
                        {PLACEMENT_ENGAGEMENT_PURPOSES.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </td>
                    <td style={{ ...TD, minWidth: 100 }}>
                      <select className="settings-form__input" style={{ minWidth: 88 }} value={row.mode}
                        onChange={e => updateCompany(i, { mode: e.target.value })}>
                        <option value="">Select...</option>
                        {PLACEMENT_ENGAGEMENT_MODES.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </td>
                    <td style={{ ...TD, minWidth: 150 }}>
                      <input className="settings-form__input" style={{ minWidth: 138 }} value={row.outcome}
                        onChange={e => updateCompany(i, { outcome: e.target.value })} placeholder="Outcome / next step" />
                    </td>
                    <td style={{ ...TD, minWidth: 120 }}>
                      <input className="settings-form__input" style={{ minWidth: 108 }} value={row.remark}
                        onChange={e => updateCompany(i, { remark: e.target.value })} placeholder="Remark" />
                    </td>
                    <td style={{ ...TD, width: 36 }}>
                      {companyEngagement.length > 1 && (
                        <button type="button" className="btn btn--ghost btn--sm"
                          onClick={() => setCompanyEngagement(prev => prev.filter((_, idx) => idx !== i))}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className="btn btn--ghost btn--sm" style={{ marginTop: 8 }}
            onClick={() => setCompanyEngagement(prev => [...prev, emptyCompanyRow()])}>
            <Plus size={13} /> Add Row
          </button>
          <div className="form-grid form-grid--2" style={{ marginTop: 16 }}>
            <FormField label="Total Companies Contacted Today" name="totalCompanies" type="number" value={totalCompaniesContacted} onChange={setTotalCompaniesContacted} min={0} />
            <FormField label="New Companies Approached" name="newCompanies" type="number" value={newCompaniesApproached} onChange={setNewCompaniesApproached} min={0} />
            <FormField label="Follow-up Companies" name="followUp" type="number" value={followUpCompanies} onChange={setFollowUpCompanies} min={0} />
            <FormField label="Confirmed Opportunities / Drives" name="confirmed" type="number" value={confirmedOpportunities} onChange={setConfirmedOpportunities} min={0} />
          </div>
        </div>

        {/* Section 3: Student Engagement / Counselling */}
        <div className="settings-card">
          <div className="form-section-title">3. Student Engagement / Counselling</div>
          <div className="tbl-scroll">
            <table style={{ borderCollapse: 'collapse', fontSize: 13, minWidth: 700 }}>
              <thead>
                <tr>
                  {['Sr.', 'Student Name / Batch', 'Purpose', 'Issue Identified', 'Action Taken', 'Status', ''].map(h => (
                    <th key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {studentEngagement.map((row, i) => (
                  <tr key={i}>
                    <td style={{ ...TD, width: 36, textAlign: 'center' }}><span style={STATIC_CELL}>{i + 1}</span></td>
                    <td style={{ ...TD, minWidth: 140 }}>
                      <input className="settings-form__input" style={{ minWidth: 128 }} value={row.studentName}
                        onChange={e => updateStudent(i, { studentName: e.target.value })} placeholder="Name / Batch" />
                    </td>
                    <td style={{ ...TD, minWidth: 110 }}>
                      <select className="settings-form__input" style={{ minWidth: 98 }} value={row.purpose}
                        onChange={e => updateStudent(i, { purpose: e.target.value })}>
                        <option value="">Select...</option>
                        {STUDENT_ENGAGEMENT_PURPOSES.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </td>
                    <td style={{ ...TD, minWidth: 140 }}>
                      <input className="settings-form__input" style={{ minWidth: 128 }} value={row.issueIdentified}
                        onChange={e => updateStudent(i, { issueIdentified: e.target.value })} placeholder="Issue" />
                    </td>
                    <td style={{ ...TD, minWidth: 140 }}>
                      <input className="settings-form__input" style={{ minWidth: 128 }} value={row.actionTaken}
                        onChange={e => updateStudent(i, { actionTaken: e.target.value })} placeholder="Action" />
                    </td>
                    <td style={{ ...TD, minWidth: 100 }}>
                      <select className="settings-form__input" style={{ minWidth: 88 }} value={row.status}
                        onChange={e => updateStudent(i, { status: e.target.value as PlacementStudentEngagementEntry['status'] })}>
                        <option value="">Select...</option>
                        {STUDENT_ENGAGEMENT_STATUSES.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </td>
                    <td style={{ ...TD, width: 36 }}>
                      {studentEngagement.length > 1 && (
                        <button type="button" className="btn btn--ghost btn--sm"
                          onClick={() => setStudentEngagement(prev => prev.filter((_, idx) => idx !== i))}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className="btn btn--ghost btn--sm" style={{ marginTop: 8 }}
            onClick={() => setStudentEngagement(prev => [...prev, emptyStudentRow()])}>
            <Plus size={13} /> Add Row
          </button>
          <div className="form-grid form-grid--2" style={{ marginTop: 16 }}>
            <FormField label="Total Students Interacted With" name="totalStudents" type="number" value={totalStudentsInteracted} onChange={setTotalStudentsInteracted} min={0} />
            <FormField label="Resume Reviews Done" name="resumeReviews" type="number" value={resumeReviewsDone} onChange={setResumeReviewsDone} min={0} />
            <FormField label="Mock Interviews / GD Support" name="mockInterviews" type="number" value={mockInterviewsSupport} onChange={setMockInterviewsSupport} min={0} />
            <FormField label="Students Guided for Applications" name="studentsGuided" type="number" value={studentsGuidedApplications} onChange={setStudentsGuidedApplications} min={0} />
          </div>
        </div>

        {/* Section 4: Placement Drive / Hiring Process Update */}
        <div className="settings-card">
          <div className="form-section-title">4. Placement Drive / Hiring Process Update</div>
          <div className="tbl-scroll">
            <table style={{ borderCollapse: 'collapse', fontSize: 13, minWidth: 1000 }}>
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
                    <td style={{ ...TD, minWidth: 120 }}>
                      <input className="settings-form__input" style={{ minWidth: 108 }} value={row.companyName}
                        onChange={e => updateDrive(i, { companyName: e.target.value })} placeholder="Company" />
                    </td>
                    <td style={{ ...TD, minWidth: 100 }}>
                      <input className="settings-form__input" style={{ minWidth: 88 }} value={row.profile}
                        onChange={e => updateDrive(i, { profile: e.target.value })} placeholder="Role" />
                    </td>
                    <td style={{ ...TD, minWidth: 80 }}>
                      <input className="settings-form__input" style={{ minWidth: 68 }} value={row.ctc}
                        onChange={e => updateDrive(i, { ctc: e.target.value })} placeholder="LPA" />
                    </td>
                    <td style={{ ...TD, minWidth: 90 }}>
                      <input className="settings-form__input" style={{ minWidth: 78 }} value={row.location}
                        onChange={e => updateDrive(i, { location: e.target.value })} placeholder="City" />
                    </td>
                    <td style={{ ...TD, minWidth: 80 }}>
                      <input className="settings-form__input" style={{ minWidth: 68 }} type="number" value={row.eligibleStudents}
                        onChange={e => updateDrive(i, { eligibleStudents: e.target.value })} placeholder="0" min={0} />
                    </td>
                    <td style={{ ...TD, minWidth: 80 }}>
                      <input className="settings-form__input" style={{ minWidth: 68 }} type="number" value={row.applied}
                        onChange={e => updateDrive(i, { applied: e.target.value })} placeholder="0" min={0} />
                    </td>
                    <td style={{ ...TD, minWidth: 80 }}>
                      <input className="settings-form__input" style={{ minWidth: 68 }} type="number" value={row.appear}
                        onChange={e => updateDrive(i, { appear: e.target.value })} placeholder="0" min={0} />
                    </td>
                    <td style={{ ...TD, minWidth: 110 }}>
                      <select className="settings-form__input" style={{ minWidth: 98 }} value={row.testStatus}
                        onChange={e => updateDrive(i, { testStatus: e.target.value })}>
                        <option value="">Select...</option>
                        {DRIVE_TEST_STATUSES.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </td>
                    <td style={{ ...TD, minWidth: 110 }}>
                      <select className="settings-form__input" style={{ minWidth: 98 }} value={row.interviewStatus}
                        onChange={e => updateDrive(i, { interviewStatus: e.target.value })}>
                        <option value="">Select...</option>
                        {DRIVE_TEST_STATUSES.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </td>
                    <td style={{ ...TD, minWidth: 110 }}>
                      <input className="settings-form__input" style={{ minWidth: 98 }} value={row.remark}
                        onChange={e => updateDrive(i, { remark: e.target.value })} placeholder="Remark" />
                    </td>
                    <td style={{ ...TD, width: 36 }}>
                      {placementDriveUpdate.length > 1 && (
                        <button type="button" className="btn btn--ghost btn--sm"
                          onClick={() => setPlacementDriveUpdate(prev => prev.filter((_, idx) => idx !== i))}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className="btn btn--ghost btn--sm" style={{ marginTop: 8 }}
            onClick={() => setPlacementDriveUpdate(prev => [...prev, emptyDriveRow()])}>
            <Plus size={13} /> Add Row
          </button>
        </div>

        {/* Section 5: Internship / Training / Skill Development Coordination */}
        <div className="settings-card">
          <div className="form-section-title">5. Internship / Training / Skill Development Coordination</div>
          <div className="tbl-scroll">
            <table style={{ borderCollapse: 'collapse', fontSize: 13, minWidth: 800 }}>
              <thead>
                <tr>
                  {['Activity', 'Batch / Department', 'No. of Students', 'Trainer / Company', 'Status', 'Remarks'].map(h => (
                    <th key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {internshipCoord.map((row, i) => (
                  <tr key={i}>
                    <td style={{ ...TD, minWidth: 200 }}><span style={{ fontSize: 12 }}>{row.activity}</span></td>
                    <td style={{ ...TD, minWidth: 130 }}>
                      <input className="settings-form__input" style={{ minWidth: 118 }} value={row.batchDept}
                        onChange={e => updateInternship(i, { batchDept: e.target.value })} placeholder="Batch / Dept." />
                    </td>
                    <td style={{ ...TD, minWidth: 90 }}>
                      <input className="settings-form__input" style={{ minWidth: 78 }} type="number" value={row.noStudents}
                        onChange={e => updateInternship(i, { noStudents: e.target.value })} placeholder="0" min={0} />
                    </td>
                    <td style={{ ...TD, minWidth: 130 }}>
                      <input className="settings-form__input" style={{ minWidth: 118 }} value={row.trainerCompany}
                        onChange={e => updateInternship(i, { trainerCompany: e.target.value })} placeholder="Trainer / Company" />
                    </td>
                    <td style={{ ...TD, minWidth: 110 }}>
                      <select className="settings-form__input" style={{ minWidth: 98 }} value={row.status}
                        onChange={e => updateInternship(i, { status: e.target.value as PlacementInternshipEntry['status'] })}>
                        <option value="">Select...</option>
                        <option>Completed</option>
                        <option>Pending</option>
                      </select>
                    </td>
                    <td style={{ ...TD, minWidth: 140 }}>
                      <input className="settings-form__input" style={{ minWidth: 128 }} value={row.remarks}
                        onChange={e => updateInternship(i, { remarks: e.target.value })} placeholder="Remarks" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 6: MIS / Documentation Work */}
        <div className="settings-card">
          <div className="form-section-title">6. MIS / Documentation Work</div>
          <div className="tbl-scroll">
            <table style={{ borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
              <thead>
                <tr>
                  {['Task', 'Status', 'Remarks'].map(h => (
                    <th key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {misDoc.map((row, i) => (
                  <tr key={i}>
                    <td style={{ ...TD, minWidth: 220 }}><span style={{ fontSize: 12 }}>{row.task}</span></td>
                    <td style={{ ...TD, minWidth: 120 }}>
                      <select className="settings-form__input" style={{ minWidth: 108 }} value={row.status}
                        onChange={e => updateMIS(i, { status: e.target.value as PlacementMISEntry['status'] })}>
                        <option value="">Select...</option>
                        <option>Completed</option>
                        <option>Pending</option>
                      </select>
                    </td>
                    <td style={{ ...TD, minWidth: 200 }}>
                      <input className="settings-form__input" style={{ minWidth: 188 }} value={row.remarks}
                        onChange={e => updateMIS(i, { remarks: e.target.value })} placeholder="Remarks" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 7: Key Achievements */}
        <div className="settings-card">
          <div className="form-section-title">7. Key Achievements of the Day</div>
          <FormTextarea label="Achievement 1" name="achievement1" value={achievement1} onChange={setAchievement1} rows={2} />
          <FormTextarea label="Achievement 2" name="achievement2" value={achievement2} onChange={setAchievement2} rows={2} />
          <FormTextarea label="Achievement 3" name="achievement3" value={achievement3} onChange={setAchievement3} rows={2} />
        </div>

        {/* Section 8: Pending Work / Follow-up Required */}
        <div className="settings-card">
          <div className="form-section-title">8. Pending Work / Follow-up Required</div>
          <div className="tbl-scroll">
            <table style={{ borderCollapse: 'collapse', fontSize: 13, minWidth: 620 }}>
              <thead>
                <tr>
                  {['Sr.', 'Pending Task', 'Person / Company Concerned', 'Target Date', 'Priority', ''].map(h => (
                    <th key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pendingWork.map((row, i) => (
                  <tr key={i}>
                    <td style={{ ...TD, width: 36, textAlign: 'center' }}><span style={STATIC_CELL}>{i + 1}</span></td>
                    <td style={{ ...TD, minWidth: 160 }}>
                      <input className="settings-form__input" style={{ minWidth: 148 }} value={row.pendingTask}
                        onChange={e => updatePending(i, { pendingTask: e.target.value })} placeholder="Task description" />
                    </td>
                    <td style={{ ...TD, minWidth: 160 }}>
                      <input className="settings-form__input" style={{ minWidth: 148 }} value={row.personConcerned}
                        onChange={e => updatePending(i, { personConcerned: e.target.value })} placeholder="Person / Company" />
                    </td>
                    <td style={{ ...TD, minWidth: 130 }}>
                      <input className="settings-form__input" style={{ minWidth: 118 }} type="date" value={row.targetDate}
                        onChange={e => updatePending(i, { targetDate: e.target.value })} />
                    </td>
                    <td style={{ ...TD, minWidth: 100 }}>
                      <select className="settings-form__input" style={{ minWidth: 88 }} value={row.priority}
                        onChange={e => updatePending(i, { priority: e.target.value as PlacementPendingWorkEntry['priority'] })}>
                        <option value="">Select...</option>
                        {PRIORITIES.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </td>
                    <td style={{ ...TD, width: 36 }}>
                      {pendingWork.length > 1 && (
                        <button type="button" className="btn btn--ghost btn--sm"
                          onClick={() => setPendingWork(prev => prev.filter((_, idx) => idx !== i))}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className="btn btn--ghost btn--sm" style={{ marginTop: 8 }}
            onClick={() => setPendingWork(prev => [...prev, emptyPendingRow()])}>
            <Plus size={13} /> Add Row
          </button>
        </div>

        {/* Section 9: Issues / Support Required */}
        <div className="settings-card">
          <div className="form-section-title">9. Issues / Support Required</div>
          <div className="tbl-scroll">
            <table style={{ borderCollapse: 'collapse', fontSize: 13, minWidth: 580 }}>
              <thead>
                <tr>
                  {['Issue', 'Related To', 'Support Required From', 'Urgency', ''].map(h => (
                    <th key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {issuesSupport.map((row, i) => (
                  <tr key={i}>
                    <td style={{ ...TD, minWidth: 160 }}>
                      <input className="settings-form__input" style={{ minWidth: 148 }} value={row.issue}
                        onChange={e => updateIssue(i, { issue: e.target.value })} placeholder="Describe issue" />
                    </td>
                    <td style={{ ...TD, minWidth: 120 }}>
                      <select className="settings-form__input" style={{ minWidth: 108 }} value={row.relatedTo}
                        onChange={e => updateIssue(i, { relatedTo: e.target.value })}>
                        <option value="">Select...</option>
                        {RELATED_TO_OPTIONS.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </td>
                    <td style={{ ...TD, minWidth: 160 }}>
                      <input className="settings-form__input" style={{ minWidth: 148 }} value={row.supportRequired}
                        onChange={e => updateIssue(i, { supportRequired: e.target.value })} placeholder="Support needed from" />
                    </td>
                    <td style={{ ...TD, minWidth: 100 }}>
                      <select className="settings-form__input" style={{ minWidth: 88 }} value={row.urgency}
                        onChange={e => updateIssue(i, { urgency: e.target.value as PlacementIssueSupportEntry['urgency'] })}>
                        <option value="">Select...</option>
                        {PRIORITIES.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </td>
                    <td style={{ ...TD, width: 36 }}>
                      {issuesSupport.length > 1 && (
                        <button type="button" className="btn btn--ghost btn--sm"
                          onClick={() => setIssuesSupport(prev => prev.filter((_, idx) => idx !== i))}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className="btn btn--ghost btn--sm" style={{ marginTop: 8 }}
            onClick={() => setIssuesSupport(prev => [...prev, emptyIssueRow()])}>
            <Plus size={13} /> Add Row
          </button>
        </div>

        {/* Custom Fields from SuperAdmin */}
        {customFields.length > 0 && (
          <div className="settings-card">
            <CustomFieldsSection fields={customFields} values={extraFields}
              onChange={(k, v) => setExtraFields(prev => ({ ...prev, [k]: v }))} />
          </div>
        )}

        {/* Submit */}
        <div className="settings-card">
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
                <AlertCircle size={18} /> Failed to submit. Please try again.
              </span>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

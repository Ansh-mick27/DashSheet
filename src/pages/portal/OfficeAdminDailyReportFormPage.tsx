// ==========================================
// DashSheet — Office Admin Daily Task Report Form
// ==========================================
import { useState, useRef, useEffect, FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, Send, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { submitOfficeAdminDailyReport } from '../../services/dataApi';
import { todayISO, isoToDDMMYYYY } from '../../lib/dateUtils';
import {
  OA_TIME_SLOTS, OA_TASK_ACTIVITIES, OA_RELATED_AREAS,
  OA_ISSUE_AREAS, OA_RECEPTION_PURPOSES, OA_HOSPITALITY_REQUIREMENTS,
} from '../../data/constants';
import {
  Member,
  OATimeSlotEntry, OAStudentSupportRow, OACampusProcessRow, OAHousekeepingRow,
  OAFileDocRow, OAInfrastructureRow, OAMISRow, OAIssueRow, OAPendingWorkRow,
  OAITPeripheralRow, OAReceptionRow, OATravelRow, OATravelDetails,
  OAHospitalityRow, OAPrintingRow, OAInstallationRow, OAVendorRow,
  OAChecklistRow, OfficeAdminDailyReport,
} from '../../types';
import FormField from '../../components/form/FormField';

const TH: React.CSSProperties = { padding: '6px 8px', background: 'var(--bg-card)', fontWeight: 600, fontSize: 12, textAlign: 'left', whiteSpace: 'nowrap', borderBottom: '1px solid var(--border-color)' };
const TD: React.CSSProperties = { padding: '4px 6px', verticalAlign: 'top', borderBottom: '1px solid var(--border-color)' };

const INFRA_ROWS = [
  { utility: 'Electricity', statusOptions: ['Available', 'Issue'] },
  { utility: 'AC / Fans', statusOptions: ['Working', 'Not Working'] },
  { utility: 'Lighting', statusOptions: ['Proper', 'Poor'] },
  { utility: 'Drinking Water', statusOptions: ['Available', 'Not Available'] },
  { utility: 'Internet / Wi-Fi', statusOptions: ['Working', 'Not Working'] },
  { utility: 'Power Backup', statusOptions: ['Available', 'Not Available'] },
  { utility: 'Seating Arrangement', statusOptions: ['Done', 'Pending'] },
  { utility: 'Cleanliness', statusOptions: ['Done', 'Pending'] },
];

const IT_PERIPHERAL_ROWS = [
  { equipment: 'Desktop / Laptop', statusOptions: ['Working', 'Not Working'] },
  { equipment: 'Printer', statusOptions: ['Working', 'Not Working'] },
  { equipment: 'Scanner', statusOptions: ['Working', 'Not Working'] },
  { equipment: 'Projector', statusOptions: ['Working', 'Not Working'] },
  { equipment: 'Speaker / Mic', statusOptions: ['Working', 'Not Working'] },
  { equipment: 'LAN / Wi-Fi', statusOptions: ['Working', 'Not Working'] },
  { equipment: 'Extension Boards', statusOptions: ['Available', 'Not Available'] },
  { equipment: 'Power Backup', statusOptions: ['Available', 'Not Available'] },
];

const PRINTING_ROWS = ['Student List','Attendance Sheet','Company Schedule','Certificates','Feedback Forms','Direction Signage','Room Labels','Posters / Notices','Banners / Flex'];

const INSTALLATION_ROWS = [
  { item: 'Banner / Flex', location: 'Gate / Auditorium / CDC / Venue' },
  { item: 'Standee', location: 'Reception / Venue Entry' },
  { item: 'Direction Board', location: 'Gate to Venue' },
  { item: 'Registration Desk Label', location: 'Registration Area' },
  { item: 'Interview Room Labels', location: 'Room Doors' },
  { item: 'Waiting Area Signage', location: 'Student Waiting Area' },
  { item: 'Company Name Board', location: 'Guest / Interview Room' },
];

const VENDOR_ROWS = [
  { vendor: 'Caterer', serviceRequired: 'Tea / Snacks / Lunch' },
  { vendor: 'Transport Vendor', serviceRequired: 'Cab / Vehicle' },
  { vendor: 'Printing Vendor', serviceRequired: 'Banner / Certificate / Print Material' },
  { vendor: 'IT Support', serviceRequired: 'Systems / Internet / Projector' },
  { vendor: 'Housekeeping', serviceRequired: 'Cleaning / Room Setup' },
  { vendor: 'Security', serviceRequired: 'Gate Entry / Parking / Movement' },
];

const PRE_PROCESS_POINTS = [
  'Venue cleaned and ready','Seating arrangement completed','Registration desk ready',
  'Reception informed','Gate / security informed','Parking slot arranged','Guest escort assigned',
  'Attendance sheets printed','Student list printed / shared','Company schedule printed',
  'Required files prepared','Stationery arranged','Water bottles arranged',
  'Tea / snacks / lunch arranged','Projector / laptop / internet checked',
  'Mic / speaker checked','Extension boards arranged','Banners / standees installed',
  'Direction boards placed','Room labels installed','Housekeeping team briefed',
  'IT team briefed','Security team briefed','Pickup / drop confirmed',
];
const POST_PROCESS_POINTS = [
  'Guest / company feedback taken','Reception informed about guest departure',
  'Security informed about vehicle exit','Attendance sheets collected and filed',
  'Feedback forms collected and filed','Company documents placed in file',
  'Equipment returned','Rooms restored after process',
  'Balance stationery returned to stock','Banners / standees removed or stored safely',
  'Temporary signage / labels removed','Hospitality bills verified',
  'Travel / cab bills verified','Vendor slips / bills collected',
  'Digital folder updated','Final report submitted',
];
const NEXT_DAY_POINTS = [
  'Rooms booked and checked','Housekeeping informed','IT support informed',
  'Security / gate informed','Reception informed','Student list prepared',
  'Attendance sheets ready','Stationery arranged','Files prepared',
  'Printing requirement completed','Hospitality requirement confirmed',
  'Travel / commuting requirement confirmed','Vendor follow-up done',
  'Signage / branding requirement checked',
];

function initTimeSlotLog(): OATimeSlotEntry[] {
  return OA_TIME_SLOTS.map(ts => ({ timeSlot: ts, taskActivity: [], relatedArea: '', status: '', remark: '' }));
}

function initStudentSupport(): OAStudentSupportRow[] {
  return [
    'Student records updated today',
    'Eligibility / academic data verified',
    'Backlog / defaulter records checked',
    'Resumes collected / updated',
    'Student documents verified',
    'Training attendance updated',
    'Placement drive attendance updated',
    'Student list shared with CDC / company / department',
    'Student Calling',
  ].map(p => ({ particular: p, countStatus: '', remarks: '' }));
}

function initCampusProcess(): OACampusProcessRow[] {
  return [
    { process: 'Placement Drive', supportProvided: 'Rooms, attendance, student movement, company desk' },
    { process: 'Training Session', supportProvided: 'Classroom, projector, attendance, seating' },
    { process: 'Online Assessment', supportProvided: 'Lab, systems, internet, invigilation support' },
    { process: 'Mock Interview / GD', supportProvided: 'Rooms, panels, student list' },
    { process: 'Company Visit', supportProvided: 'Hospitality, meeting room, presentation setup' },
    { process: 'Guest Session / Workshop', supportProvided: 'Auditorium, mic, projector, seating' },
  ].map(r => ({ ...r, venue: '', noOfStudentsGuests: '', status: '', remarks: '' }));
}

function initHousekeeping(): OAHousekeepingRow[] {
  return ['CDC Office', 'Training Classroom', 'Interview Rooms', 'Waiting Area', 'Washrooms', 'Reception / Registration Desk']
    .map(area => ({ area, status: '', issueFound: '', actionTaken: '', remarks: '' }));
}

function initFileDoc(): OAFileDocRow[] {
  return [
    { fileType: 'Company File', purpose: 'Recruiter record / JD / communication' },
    { fileType: 'Placement Drive File', purpose: 'Attendance / shortlist / result / feedback' },
    { fileType: 'Training File', purpose: 'Attendance / topics / trainer report' },
    { fileType: 'Student File', purpose: 'Resume / documents / eligibility' },
    { fileType: 'Offer Letter File', purpose: 'Selection and offer records' },
    { fileType: 'Vendor File', purpose: 'Bills / quotations / delivery slips' },
  ].map(r => ({ ...r, preparedUpdated: '', physicalFile: '', digitalFolder: '', remarks: '' }));
}

function initInfrastructure(): OAInfrastructureRow[] {
  return INFRA_ROWS.map(r => ({ utility: r.utility, location: '', status: '', issueFound: '', actionTaken: '' }));
}

function initMISRecords(): OAMISRow[] {
  return [
    'Student Master Sheet','Training Attendance','Placement Drive Attendance',
    'Company Database','Offer / Selection Data','Stock Register',
    'Infrastructure Checklist','Issue Register','Vendor / Bill Record','Daily Report',
  ].map(r => ({ recordType: r, updated: '', pending: '', remarks: '' }));
}

function emptyIssueRow(): OAIssueRow {
  return { issue: '', relatedArea: '', reportedTo: '', actionRequired: '', priority: '' };
}

function emptyPendingRow(): OAPendingWorkRow {
  return { pendingTask: '', concernedPerson: '', targetDate: '', priority: '' };
}

function initITPeripherals(): OAITPeripheralRow[] {
  return IT_PERIPHERAL_ROWS.map(r => ({ equipment: r.equipment, location: '', workingStatus: '', issueReported: '', actionTaken: '' }));
}

function emptyReceptionRow(): OAReceptionRow {
  return { visitorName: '', purposeOfVisit: '', expectedTime: '', receptionInformed: '', gateSecurityInformed: '', parkingRequired: '', remarks: '' };
}

function emptyTravelRow(): OATravelRow {
  return { guestName: '', from: '', to: '', pickupTime: '', dropTime: '', vehicleDriverDetails: '', status: '', remarks: '' };
}

function initTravelDetails(): OATravelDetails {
  return { driverName: '', driverMobile: '', vehicleNo: '', vendorInternal: '', securityInformed: '', parkingArranged: '' };
}

function emptyHospitalityRow(): OAHospitalityRow {
  return { guest: '', requirement: '', time: '', arrangedBy: '', status: '', remarks: '' };
}

function initPrintingMaterial(): OAPrintingRow[] {
  return PRINTING_ROWS.map(m => ({ material: m, quantity: '', purpose: '', requestedBy: '', completedTime: '', status: '', remarks: '' }));
}

function initInstallationDisplay(): OAInstallationRow[] {
  return INSTALLATION_ROWS.map(r => ({ item: r.item, location: r.location, installedBy: '', timeCompleted: '', status: '', remarks: '' }));
}

function initVendorCoordination(): OAVendorRow[] {
  return VENDOR_ROWS.map(r => ({ ...r, contactPerson: '', deliveryTime: '', status: '', remarks: '' }));
}

function initChecklist(points: string[]): OAChecklistRow[] {
  return points.map(p => ({ point: p, status: '', remarks: '' }));
}

function OtherSelect({
  value,
  options,
  onChange,
  style,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  style?: React.CSSProperties;
}) {
  const isOtherMode = value !== '' && !options.includes(value);
  return (
    <div>
      <select
        className="settings-form__input"
        style={style}
        value={isOtherMode ? 'Other' : value}
        onChange={e => onChange(e.target.value)}
      >
        <option value="">Select...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
        <option value="Other">Other</option>
      </select>
      {isOtherMode && (
        <input
          type="text"
          className="settings-form__input"
          style={{ marginTop: 4, ...(style ?? {}) }}
          placeholder="Specify..."
          value={value === 'Other' ? '' : value}
          onChange={e => onChange(e.target.value || 'Other')}
        />
      )}
    </div>
  );
}

function MultiSelect({
  values,
  options,
  onChange,
  style,
}: {
  values: string[];
  options: string[];
  onChange: (v: string[]) => void;
  style?: React.CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0, openUp: false });
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const customValue = values.find(v => !options.includes(v)) ?? '';
  const hasCustom = customValue !== '';

  const handleToggle = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const dropH = 240;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < dropH && rect.top > dropH;
      setDropPos({
        top: openUp ? rect.top - dropH : rect.bottom,
        left: rect.left,
        width: Math.max(rect.width, 260),
        openUp,
      });
    }
    setOpen(o => !o);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        dropRef.current && !dropRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const toggle = (opt: string) => {
    onChange(values.includes(opt) ? values.filter(v => v !== opt) : [...values, opt]);
  };

  const setCustom = (text: string) => {
    const base = values.filter(v => options.includes(v));
    onChange(text ? [...base, text] : base);
  };

  const displayText = values.length === 0 ? 'Select activities...' : values.join(', ');

  const dropdown = (
    <div
      ref={dropRef}
      style={{
        position: 'fixed',
        zIndex: 9999,
        top: dropPos.top,
        left: dropPos.left,
        width: dropPos.width,
        minWidth: 260,
        maxWidth: 360,
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 6,
        boxShadow: '0 4px 20px rgba(0,0,0,0.22)',
        maxHeight: 240,
        overflowY: 'auto',
        padding: '4px 0',
      }}
    >
      {options.map(opt => (
        <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', cursor: 'pointer', fontSize: 12 }}>
          <input type="checkbox" checked={values.includes(opt)} onChange={() => toggle(opt)} style={{ margin: 0, cursor: 'pointer' }} />
          {opt}
        </label>
      ))}
      <div style={{ borderTop: '1px solid var(--border-color)', marginTop: 4 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', cursor: 'pointer', fontSize: 12 }}>
          <input type="checkbox" checked={hasCustom} onChange={() => hasCustom ? setCustom('') : setCustom('Other')} style={{ margin: 0, cursor: 'pointer' }} />
          Other
        </label>
        {hasCustom && (
          <div style={{ padding: '2px 12px 8px' }}>
            <input
              type="text"
              className="settings-form__input"
              placeholder="Specify other..."
              value={customValue === 'Other' ? '' : customValue}
              onChange={e => setCustom(e.target.value || 'Other')}
              style={{ fontSize: 12 }}
              autoFocus
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ position: 'relative', minWidth: (style?.minWidth as number) ?? 200 }}>
      <div
        ref={triggerRef}
        className="settings-form__input"
        style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', userSelect: 'none', minHeight: 34, padding: '5px 8px', ...style }}
        onClick={handleToggle}
      >
        <span style={{ fontSize: 11, flex: 1, lineHeight: 1.5, wordBreak: 'break-word' }}>{displayText}</span>
        <span style={{ opacity: 0.5, fontSize: 10, marginLeft: 4, flexShrink: 0 }}>▾</span>
      </div>
      {open && createPortal(dropdown, document.body)}
    </div>
  );
}

interface Props { adminMembers?: Member[]; }

export default function OfficeAdminDailyReportFormPage({ adminMembers }: Props = {}) {
  const { member } = useAuth();
  const isAdminMode = Boolean(adminMembers);
  const [adminSelectedMember, setAdminSelectedMember] = useState<Member | null>(null);
  const activeMember = isAdminMode ? adminSelectedMember : member;
  const [date, setDate] = useState(todayISO());

  const [timeSlotLog, setTimeSlotLog] = useState<OATimeSlotEntry[]>(initTimeSlotLog);
  const [studentSupport, setStudentSupport] = useState<OAStudentSupportRow[]>(initStudentSupport);
  const [campusProcess, setCampusProcess] = useState<OACampusProcessRow[]>(initCampusProcess);
  const [housekeeping, setHousekeeping] = useState<OAHousekeepingRow[]>(initHousekeeping);
  const [fileDoc, setFileDoc] = useState<OAFileDocRow[]>(initFileDoc);
  const [infrastructure, setInfrastructure] = useState<OAInfrastructureRow[]>(initInfrastructure);
  const [misRecords, setMisRecords] = useState<OAMISRow[]>(initMISRecords);
  const [keyWork, setKeyWork] = useState<string[]>(['']);
  const [issues, setIssues] = useState<OAIssueRow[]>([emptyIssueRow(), emptyIssueRow()]);
  const [pendingWork, setPendingWork] = useState<OAPendingWorkRow[]>([emptyPendingRow(), emptyPendingRow(), emptyPendingRow(), emptyPendingRow()]);
  const [hasCampusDay, setHasCampusDay] = useState(false);
  const [itPeripherals, setItPeripherals] = useState<OAITPeripheralRow[]>(initITPeripherals);
  const [receptionRows, setReceptionRows] = useState<OAReceptionRow[]>([emptyReceptionRow(), emptyReceptionRow()]);
  const [travelRows, setTravelRows] = useState<OATravelRow[]>([emptyTravelRow(), emptyTravelRow()]);
  const [travelDetails, setTravelDetails] = useState<OATravelDetails>(initTravelDetails);
  const [hospitalityRows, setHospitalityRows] = useState<OAHospitalityRow[]>([emptyHospitalityRow(), emptyHospitalityRow()]);
  const [printingMaterial, setPrintingMaterial] = useState<OAPrintingRow[]>(initPrintingMaterial);
  const [installationDisplay, setInstallationDisplay] = useState<OAInstallationRow[]>(initInstallationDisplay);
  const [vendorCoordination, setVendorCoordination] = useState<OAVendorRow[]>(initVendorCoordination);
  const [preChecklist, setPreChecklist] = useState<OAChecklistRow[]>(() => initChecklist(PRE_PROCESS_POINTS));
  const [postChecklist, setPostChecklist] = useState<OAChecklistRow[]>(() => initChecklist(POST_PROCESS_POINTS));
  const [nextDayReadiness, setNextDayReadiness] = useState<OAChecklistRow[]>(() => initChecklist(NEXT_DAY_POINTS));

  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const resetForm = () => {
    setDate(todayISO());
    setTimeSlotLog(initTimeSlotLog());
    setStudentSupport(initStudentSupport());
    setCampusProcess(initCampusProcess());
    setHousekeeping(initHousekeeping());
    setFileDoc(initFileDoc());
    setInfrastructure(initInfrastructure());
    setMisRecords(initMISRecords());
    setKeyWork(['']);
    setIssues([emptyIssueRow(), emptyIssueRow()]);
    setPendingWork([emptyPendingRow(), emptyPendingRow(), emptyPendingRow(), emptyPendingRow()]);
    setHasCampusDay(false);
    setItPeripherals(initITPeripherals());
    setReceptionRows([emptyReceptionRow(), emptyReceptionRow()]);
    setTravelRows([emptyTravelRow(), emptyTravelRow()]);
    setTravelDetails(initTravelDetails());
    setHospitalityRows([emptyHospitalityRow(), emptyHospitalityRow()]);
    setPrintingMaterial(initPrintingMaterial());
    setInstallationDisplay(initInstallationDisplay());
    setVendorCoordination(initVendorCoordination());
    setPreChecklist(initChecklist(PRE_PROCESS_POINTS));
    setPostChecklist(initChecklist(POST_PROCESS_POINTS));
    setNextDayReadiness(initChecklist(NEXT_DAY_POINTS));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeMember) return;
    setStatus('saving');
    try {
      const report: OfficeAdminDailyReport = {
        timestamp: new Date().toISOString(),
        staffName: activeMember.name,
        date: isoToDDMMYYYY(date),
        department: 'Career Development Center',
        timeSlotLog,
        studentSupport,
        campusProcess,
        housekeeping,
        fileDocumentation: fileDoc,
        infrastructure,
        misRecords,
        keyWorkCompleted: keyWork.filter(k => k.trim()),
        issues: issues.filter(r => r.issue),
        pendingWork,
        hasCampusDay,
        itPeripherals,
        receptionNotification: receptionRows,
        travelRows,
        travelDetails,
        hospitality: hospitalityRows,
        printingMaterial,
        installationDisplay,
        vendorCoordination,
        preProcessChecklist: preChecklist,
        postProcessChecklist: postChecklist,
        nextDayReadiness,
      };
      await submitOfficeAdminDailyReport(report);
      setStatus('success');
      resetForm();
      setTimeout(() => setStatus('idle'), 4000);
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="page-header">
          <div>
            <h2 className="page-title">Office Admin Daily Task Report</h2>
          </div>
        </div>
        <div className="settings-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <CheckCircle2 size={48} style={{ color: 'var(--color-success)', margin: '0 auto 16px' }} />
          <h3 style={{ marginBottom: 8 }}>Report Submitted Successfully!</h3>
          <p className="settings-card__desc">Your daily task report has been recorded.</p>
          <button className="btn btn--primary" style={{ marginTop: 20 }} onClick={() => setStatus('idle')}>
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">Office Admin Daily Task Report</h2>
          <p className="page-subtitle">Reporting Time: 8:30 AM to 5:30 PM</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {isAdminMode && (
          <div className="settings-card">
            <div className="form-section-title" style={{ marginBottom: 12 }}>Select Office Admin &amp; Date</div>
            <div className="form-grid form-grid--2">
              <div className="settings-form__field">
                <label className="settings-form__label">Office Admin</label>
                <select className="settings-form__input" value={adminSelectedMember?.id ?? ''}
                  onChange={e => {
                    const m = adminMembers!.find(m => m.id === e.target.value) ?? null;
                    setAdminSelectedMember(m);
                  }}>
                  <option value="">— Select office admin —</option>
                  {adminMembers!.filter(m => m.role === 'OfficeAdmin' || m.role === 'SuperAdmin').map(m => (
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

        {/* Header Fields */}
        <div className="settings-card">
          <div className="form-grid form-grid--3">
            <FormField label="Name" name="staffName" value={activeMember?.name ?? ''} onChange={() => {}} readOnly />
            <FormField label="Date" name="date" type="date" value={date} onChange={isAdminMode ? setDate : () => {}} readOnly={!isAdminMode} required />
            <FormField label="Department" name="department" value="Career Development Center" onChange={() => {}} readOnly />
          </div>
        </div>

        {/* Section 2 — Time Slot Task Log */}
        <div className="settings-card">
          <div className="form-section-title">2. Time Slot Task Log</div>
          <div className="tbl-scroll">
            <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%', minWidth: 720 }}>
              <thead>
                <tr>
                  {['Time Slot', 'Task / Activity', 'Related Area', 'Status', 'Remark'].map(h => (
                    <th key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlotLog.map((row, i) => (
                  <tr key={i}>
                    <td style={{ ...TD, minWidth: 130 }}><span style={{ fontSize: 12, opacity: 0.85 }}>{row.timeSlot}</span></td>
                    <td style={{ ...TD, minWidth: 260 }}>
                      <MultiSelect
                        style={{ minWidth: 240 }}
                        options={OA_TASK_ACTIVITIES}
                        values={row.taskActivity}
                        onChange={v => setTimeSlotLog(prev => prev.map((r, j) => j === i ? { ...r, taskActivity: v } : r))}
                      />
                    </td>
                    <td style={{ ...TD, minWidth: 160 }}>
                      <OtherSelect
                        style={{ minWidth: 140 }}
                        options={OA_RELATED_AREAS}
                        value={row.relatedArea}
                        onChange={v => setTimeSlotLog(prev => prev.map((r, j) => j === i ? { ...r, relatedArea: v } : r))}
                      />
                    </td>
                    <td style={{ ...TD, minWidth: 110 }}>
                      <OtherSelect
                        style={{ minWidth: 90 }}
                        options={['Completed', 'Pending']}
                        value={row.status}
                        onChange={v => setTimeSlotLog(prev => prev.map((r, j) => j === i ? { ...r, status: v } : r))}
                      />
                    </td>
                    <td style={{ ...TD, minWidth: 140 }}>
                      <input className="settings-form__input" style={{ minWidth: 120 }} value={row.remark}
                        onChange={e => setTimeSlotLog(prev => prev.map((r, j) => j === i ? { ...r, remark: e.target.value } : r))}
                        placeholder="Remark" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3 — Student Data / Placement / Training Support */}
        <div className="settings-card">
          <div className="form-section-title">3. Student Data / Placement / Training Support</div>
          <div className="tbl-scroll">
            <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%', minWidth: 540 }}>
              <thead>
                <tr>
                  {['Particular', 'Count / Status', 'Remarks'].map(h => <th key={h} style={TH}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {studentSupport.map((row, i) => (
                  <tr key={i}>
                    <td style={{ ...TD, minWidth: 220 }}><span style={{ fontSize: 12, opacity: 0.85 }}>{row.particular}</span></td>
                    <td style={{ ...TD, minWidth: 130 }}>
                      <input className="settings-form__input" style={{ minWidth: 110 }} value={row.countStatus}
                        onChange={e => setStudentSupport(prev => prev.map((r, j) => j === i ? { ...r, countStatus: e.target.value } : r))}
                        placeholder="Count / Status" />
                    </td>
                    <td style={{ ...TD, minWidth: 180 }}>
                      <input className="settings-form__input" style={{ minWidth: 160 }} value={row.remarks}
                        onChange={e => setStudentSupport(prev => prev.map((r, j) => j === i ? { ...r, remarks: e.target.value } : r))}
                        placeholder="Remarks" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4 — Campus Process Support Report */}
        <div className="settings-card">
          <div className="form-section-title">4. Campus Process Support Report</div>
          <div className="tbl-scroll">
            <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%', minWidth: 760 }}>
              <thead>
                <tr>
                  {['Process / Activity', 'Venue', 'Support Provided', 'No. of Students / Guests', 'Status', 'Remarks'].map(h => <th key={h} style={TH}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {campusProcess.map((row, i) => (
                  <tr key={i}>
                    <td style={{ ...TD, minWidth: 140 }}><span style={{ fontSize: 12, opacity: 0.85 }}>{row.process}</span></td>
                    <td style={{ ...TD, minWidth: 110 }}>
                      <input className="settings-form__input" style={{ minWidth: 90 }} value={row.venue}
                        onChange={e => setCampusProcess(prev => prev.map((r, j) => j === i ? { ...r, venue: e.target.value } : r))}
                        placeholder="Venue" />
                    </td>
                    <td style={{ ...TD, minWidth: 200 }}>
                      <input className="settings-form__input" style={{ minWidth: 180 }} value={row.supportProvided} readOnly
                        placeholder={row.supportProvided} />
                    </td>
                    <td style={{ ...TD, minWidth: 100 }}>
                      <input className="settings-form__input" style={{ minWidth: 80 }} value={row.noOfStudentsGuests}
                        onChange={e => setCampusProcess(prev => prev.map((r, j) => j === i ? { ...r, noOfStudentsGuests: e.target.value } : r))}
                        placeholder="0" />
                    </td>
                    <td style={{ ...TD, minWidth: 110 }}>
                      <OtherSelect
                        style={{ minWidth: 90 }}
                        options={['Completed', 'Pending']}
                        value={row.status}
                        onChange={v => setCampusProcess(prev => prev.map((r, j) => j === i ? { ...r, status: v } : r))}
                      />
                    </td>
                    <td style={{ ...TD, minWidth: 140 }}>
                      <input className="settings-form__input" style={{ minWidth: 120 }} value={row.remarks}
                        onChange={e => setCampusProcess(prev => prev.map((r, j) => j === i ? { ...r, remarks: e.target.value } : r))}
                        placeholder="Remarks" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 5 — Housekeeping Readiness Report */}
        <div className="settings-card">
          <div className="form-section-title">5. Housekeeping Readiness Report</div>
          <div className="tbl-scroll">
            <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%', minWidth: 640 }}>
              <thead>
                <tr>
                  {['Area Checked', 'Status', 'Issue Found', 'Action Taken', 'Remarks'].map(h => <th key={h} style={TH}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {housekeeping.map((row, i) => (
                  <tr key={i}>
                    <td style={{ ...TD, minWidth: 160 }}><span style={{ fontSize: 12, opacity: 0.85 }}>{row.area}</span></td>
                    <td style={{ ...TD, minWidth: 110 }}>
                      <OtherSelect
                        style={{ minWidth: 90 }}
                        options={['Clean', 'Not Clean']}
                        value={row.status}
                        onChange={v => setHousekeeping(prev => prev.map((r, j) => j === i ? { ...r, status: v } : r))}
                      />
                    </td>
                    <td style={{ ...TD, minWidth: 140 }}>
                      <input className="settings-form__input" style={{ minWidth: 120 }} value={row.issueFound}
                        onChange={e => setHousekeeping(prev => prev.map((r, j) => j === i ? { ...r, issueFound: e.target.value } : r))}
                        placeholder="Issue" />
                    </td>
                    <td style={{ ...TD, minWidth: 140 }}>
                      <input className="settings-form__input" style={{ minWidth: 120 }} value={row.actionTaken}
                        onChange={e => setHousekeeping(prev => prev.map((r, j) => j === i ? { ...r, actionTaken: e.target.value } : r))}
                        placeholder="Action" />
                    </td>
                    <td style={{ ...TD, minWidth: 140 }}>
                      <input className="settings-form__input" style={{ minWidth: 120 }} value={row.remarks}
                        onChange={e => setHousekeeping(prev => prev.map((r, j) => j === i ? { ...r, remarks: e.target.value } : r))}
                        placeholder="Remarks" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 6 — File Making / Documentation Report */}
        <div className="settings-card">
          <div className="form-section-title">6. File Making / Documentation Report</div>
          <div className="tbl-scroll">
            <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%', minWidth: 700 }}>
              <thead>
                <tr>
                  {['File / Document Type', 'Purpose', 'Prepared / Updated', 'Physical File', 'Digital Folder', 'Remarks'].map(h => <th key={h} style={TH}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {fileDoc.map((row, i) => (
                  <tr key={i}>
                    <td style={{ ...TD, minWidth: 130 }}><span style={{ fontSize: 12, opacity: 0.85 }}>{row.fileType}</span></td>
                    <td style={{ ...TD, minWidth: 180 }}><span style={{ fontSize: 12, opacity: 0.75 }}>{row.purpose}</span></td>
                    <td style={{ ...TD, minWidth: 110 }}>
                      <OtherSelect
                        style={{ minWidth: 90 }}
                        options={['Yes', 'No']}
                        value={row.preparedUpdated}
                        onChange={v => setFileDoc(prev => prev.map((r, j) => j === i ? { ...r, preparedUpdated: v } : r))}
                      />
                    </td>
                    <td style={{ ...TD, minWidth: 100 }}>
                      <OtherSelect
                        style={{ minWidth: 80 }}
                        options={['Yes', 'No']}
                        value={row.physicalFile}
                        onChange={v => setFileDoc(prev => prev.map((r, j) => j === i ? { ...r, physicalFile: v } : r))}
                      />
                    </td>
                    <td style={{ ...TD, minWidth: 110 }}>
                      <OtherSelect
                        style={{ minWidth: 90 }}
                        options={['Yes', 'No']}
                        value={row.digitalFolder}
                        onChange={v => setFileDoc(prev => prev.map((r, j) => j === i ? { ...r, digitalFolder: v } : r))}
                      />
                    </td>
                    <td style={{ ...TD, minWidth: 140 }}>
                      <input className="settings-form__input" style={{ minWidth: 120 }} value={row.remarks}
                        onChange={e => setFileDoc(prev => prev.map((r, j) => j === i ? { ...r, remarks: e.target.value } : r))}
                        placeholder="Remarks" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 7 — Infrastructure / Utilities Readiness Report */}
        <div className="settings-card">
          <div className="form-section-title">7. Infrastructure / Utilities Readiness Report</div>
          <div className="tbl-scroll">
            <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%', minWidth: 620 }}>
              <thead>
                <tr>
                  {['Utility / Facility', 'Location', 'Status', 'Issue Found', 'Action Taken'].map(h => <th key={h} style={TH}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {infrastructure.map((row, i) => (
                  <tr key={i}>
                    <td style={{ ...TD, minWidth: 140 }}><span style={{ fontSize: 12, opacity: 0.85 }}>{row.utility}</span></td>
                    <td style={{ ...TD, minWidth: 120 }}>
                      <input className="settings-form__input" style={{ minWidth: 100 }} value={row.location}
                        onChange={e => setInfrastructure(prev => prev.map((r, j) => j === i ? { ...r, location: e.target.value } : r))}
                        placeholder="Location" />
                    </td>
                    <td style={{ ...TD, minWidth: 120 }}>
                      <OtherSelect
                        style={{ minWidth: 100 }}
                        options={INFRA_ROWS[i]?.statusOptions ?? []}
                        value={row.status}
                        onChange={v => setInfrastructure(prev => prev.map((r, j) => j === i ? { ...r, status: v } : r))}
                      />
                    </td>
                    <td style={{ ...TD, minWidth: 140 }}>
                      <input className="settings-form__input" style={{ minWidth: 120 }} value={row.issueFound}
                        onChange={e => setInfrastructure(prev => prev.map((r, j) => j === i ? { ...r, issueFound: e.target.value } : r))}
                        placeholder="Issue" />
                    </td>
                    <td style={{ ...TD, minWidth: 140 }}>
                      <input className="settings-form__input" style={{ minWidth: 120 }} value={row.actionTaken}
                        onChange={e => setInfrastructure(prev => prev.map((r, j) => j === i ? { ...r, actionTaken: e.target.value } : r))}
                        placeholder="Action" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 8 — MIS / Records Updated Today */}
        <div className="settings-card">
          <div className="form-section-title">8. MIS / Records Updated Today</div>
          <div className="tbl-scroll">
            <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%', minWidth: 540 }}>
              <thead>
                <tr>
                  {['Record Type', 'Updated', 'Pending', 'Remarks'].map(h => <th key={h} style={TH}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {misRecords.map((row, i) => (
                  <tr key={i}>
                    <td style={{ ...TD, minWidth: 180 }}><span style={{ fontSize: 12, opacity: 0.85 }}>{row.recordType}</span></td>
                    <td style={{ ...TD, minWidth: 90 }}>
                      <OtherSelect
                        style={{ minWidth: 70 }}
                        options={['Yes', 'No']}
                        value={row.updated}
                        onChange={v => setMisRecords(prev => prev.map((r, j) => j === i ? { ...r, updated: v } : r))}
                      />
                    </td>
                    <td style={{ ...TD, minWidth: 130 }}>
                      <input className="settings-form__input" style={{ minWidth: 110 }} value={row.pending}
                        onChange={e => setMisRecords(prev => prev.map((r, j) => j === i ? { ...r, pending: e.target.value } : r))}
                        placeholder="Pending items" />
                    </td>
                    <td style={{ ...TD, minWidth: 160 }}>
                      <input className="settings-form__input" style={{ minWidth: 140 }} value={row.remarks}
                        onChange={e => setMisRecords(prev => prev.map((r, j) => j === i ? { ...r, remarks: e.target.value } : r))}
                        placeholder="Remarks" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 9 — Key Work Completed Today */}
        <div className="settings-card">
          <div className="form-section-title">9. Key Work Completed Today</div>
          {keyWork.map((kw, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <label className="settings-form__label">Work {i + 1}</label>
                <textarea className="settings-form__input" rows={2} style={{ width: '100%', resize: 'vertical' }}
                  value={kw} onChange={e => setKeyWork(prev => prev.map((k, j) => j === i ? e.target.value : k))}
                  placeholder="Describe key work completed..." />
              </div>
              {keyWork.length > 1 && (
                <button type="button" className="btn btn--ghost btn--sm" style={{ marginBottom: 4 }}
                  onClick={() => setKeyWork(prev => prev.filter((_, j) => j !== i))}>
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn btn--ghost btn--sm" style={{ marginTop: 4 }}
            onClick={() => setKeyWork(prev => [...prev, ''])}>
            <Plus size={13} /> Add More
          </button>
        </div>

        {/* Section 10 — Issues / Shortages / Support Required */}
        <div className="settings-card">
          <div className="form-section-title">10. Issues / Shortages / Support Required</div>
          <div className="tbl-scroll">
            <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%', minWidth: 700 }}>
              <thead>
                <tr>
                  {['Issue / Shortage', 'Related Area', 'Reported To', 'Action Required', 'Priority', ''].map(h => <th key={h} style={TH}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {issues.map((row, i) => (
                  <tr key={i}>
                    <td style={{ ...TD, minWidth: 160 }}>
                      <input className="settings-form__input" style={{ minWidth: 140 }} value={row.issue}
                        onChange={e => setIssues(prev => prev.map((r, j) => j === i ? { ...r, issue: e.target.value } : r))}
                        placeholder="Describe issue" />
                    </td>
                    <td style={{ ...TD, minWidth: 130 }}>
                      <OtherSelect
                        style={{ minWidth: 110 }}
                        options={OA_ISSUE_AREAS}
                        value={row.relatedArea}
                        onChange={v => setIssues(prev => prev.map((r, j) => j === i ? { ...r, relatedArea: v } : r))}
                      />
                    </td>
                    <td style={{ ...TD, minWidth: 120 }}>
                      <input className="settings-form__input" style={{ minWidth: 100 }} value={row.reportedTo}
                        onChange={e => setIssues(prev => prev.map((r, j) => j === i ? { ...r, reportedTo: e.target.value } : r))}
                        placeholder="Reported to" />
                    </td>
                    <td style={{ ...TD, minWidth: 140 }}>
                      <input className="settings-form__input" style={{ minWidth: 120 }} value={row.actionRequired}
                        onChange={e => setIssues(prev => prev.map((r, j) => j === i ? { ...r, actionRequired: e.target.value } : r))}
                        placeholder="Action required" />
                    </td>
                    <td style={{ ...TD, minWidth: 100 }}>
                      <OtherSelect
                        style={{ minWidth: 80 }}
                        options={['High', 'Medium', 'Low']}
                        value={row.priority}
                        onChange={v => setIssues(prev => prev.map((r, j) => j === i ? { ...r, priority: v } : r))}
                      />
                    </td>
                    <td style={{ ...TD, width: 36 }}>
                      {issues.length > 1 && (
                        <button type="button" className="btn btn--ghost btn--sm"
                          onClick={() => setIssues(prev => prev.filter((_, j) => j !== i))}>
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
            onClick={() => setIssues(prev => [...prev, emptyIssueRow()])}>
            <Plus size={13} /> Add Row
          </button>
        </div>

        {/* Section 11 — Pending Work / Follow-up for Next Day */}
        <div className="settings-card">
          <div className="form-section-title">11. Pending Work / Follow-up for Next Day</div>
          <div className="tbl-scroll">
            <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%', minWidth: 600 }}>
              <thead>
                <tr>
                  {['Sr.', 'Pending Task', 'Concerned Person / Department / Vendor', 'Target Date', 'Priority'].map(h => <th key={h} style={TH}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {pendingWork.map((row, i) => (
                  <tr key={i}>
                    <td style={{ ...TD, width: 36, textAlign: 'center' }}><span style={{ fontSize: 12, opacity: 0.85 }}>{i + 1}</span></td>
                    <td style={{ ...TD, minWidth: 160 }}>
                      <input className="settings-form__input" style={{ minWidth: 140 }} value={row.pendingTask}
                        onChange={e => setPendingWork(prev => prev.map((r, j) => j === i ? { ...r, pendingTask: e.target.value } : r))}
                        placeholder="Task" />
                    </td>
                    <td style={{ ...TD, minWidth: 180 }}>
                      <input className="settings-form__input" style={{ minWidth: 160 }} value={row.concernedPerson}
                        onChange={e => setPendingWork(prev => prev.map((r, j) => j === i ? { ...r, concernedPerson: e.target.value } : r))}
                        placeholder="Person / Dept / Vendor" />
                    </td>
                    <td style={{ ...TD, minWidth: 130 }}>
                      <input type="date" className="settings-form__input" style={{ minWidth: 110 }} value={row.targetDate}
                        onChange={e => setPendingWork(prev => prev.map((r, j) => j === i ? { ...r, targetDate: e.target.value } : r))} />
                    </td>
                    <td style={{ ...TD, minWidth: 100 }}>
                      <OtherSelect
                        style={{ minWidth: 80 }}
                        options={['High', 'Medium', 'Low']}
                        value={row.priority}
                        onChange={v => setPendingWork(prev => prev.map((r, j) => j === i ? { ...r, priority: v } : r))}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Campus Day Toggle */}
        <div className="settings-card">
          <div className="form-section-title">Campus Process Sections</div>
          <p className="settings-card__desc">Show campus-day sections if there is a campus process today or next day.</p>
          <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="radio" name="hasCampusDay" checked={hasCampusDay} onChange={() => setHasCampusDay(true)} />
              Yes — Show campus sections
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="radio" name="hasCampusDay" checked={!hasCampusDay} onChange={() => setHasCampusDay(false)} />
              No
            </label>
          </div>
        </div>

        {hasCampusDay && (
          <>
            {/* Section 12 — IT Peripherals / Equipment Support */}
            <div className="settings-card">
              <div className="form-section-title">12. IT Peripherals / Equipment Support</div>
              <div className="tbl-scroll">
                <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%', minWidth: 640 }}>
                  <thead>
                    <tr>
                      {['Equipment / Peripheral', 'Location', 'Working Status', 'Issue Reported', 'Action Taken'].map(h => <th key={h} style={TH}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {itPeripherals.map((row, i) => (
                      <tr key={i}>
                        <td style={{ ...TD, minWidth: 150 }}><span style={{ fontSize: 12, opacity: 0.85 }}>{row.equipment}</span></td>
                        <td style={{ ...TD, minWidth: 110 }}>
                          <input className="settings-form__input" style={{ minWidth: 90 }} value={row.location}
                            onChange={e => setItPeripherals(prev => prev.map((r, j) => j === i ? { ...r, location: e.target.value } : r))}
                            placeholder="Location" />
                        </td>
                        <td style={{ ...TD, minWidth: 120 }}>
                          <OtherSelect
                            style={{ minWidth: 100 }}
                            options={IT_PERIPHERAL_ROWS[i]?.statusOptions ?? []}
                            value={row.workingStatus}
                            onChange={v => setItPeripherals(prev => prev.map((r, j) => j === i ? { ...r, workingStatus: v } : r))}
                          />
                        </td>
                        <td style={{ ...TD, minWidth: 140 }}>
                          <input className="settings-form__input" style={{ minWidth: 120 }} value={row.issueReported}
                            onChange={e => setItPeripherals(prev => prev.map((r, j) => j === i ? { ...r, issueReported: e.target.value } : r))}
                            placeholder="Issue" />
                        </td>
                        <td style={{ ...TD, minWidth: 140 }}>
                          <input className="settings-form__input" style={{ minWidth: 120 }} value={row.actionTaken}
                            onChange={e => setItPeripherals(prev => prev.map((r, j) => j === i ? { ...r, actionTaken: e.target.value } : r))}
                            placeholder="Action" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 13 — Reception / Gate / Security Notification Report */}
            <div className="settings-card">
              <div className="form-section-title">13. Reception / Gate / Security Notification Report</div>
              <div className="tbl-scroll">
                <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%', minWidth: 800 }}>
                  <thead>
                    <tr>
                      {['Visitor / Company / Trainer Name', 'Purpose of Visit', 'Expected Time', 'Reception Informed', 'Gate/Security Informed', 'Parking Required', 'Remarks', ''].map(h => <th key={h} style={TH}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {receptionRows.map((row, i) => (
                      <tr key={i}>
                        <td style={{ ...TD, minWidth: 160 }}>
                          <input className="settings-form__input" style={{ minWidth: 140 }} value={row.visitorName}
                            onChange={e => setReceptionRows(prev => prev.map((r, j) => j === i ? { ...r, visitorName: e.target.value } : r))}
                            placeholder="Name" />
                        </td>
                        <td style={{ ...TD, minWidth: 120 }}>
                          <OtherSelect
                            style={{ minWidth: 100 }}
                            options={OA_RECEPTION_PURPOSES}
                            value={row.purposeOfVisit}
                            onChange={v => setReceptionRows(prev => prev.map((r, j) => j === i ? { ...r, purposeOfVisit: v } : r))}
                          />
                        </td>
                        <td style={{ ...TD, minWidth: 110 }}>
                          <input className="settings-form__input" style={{ minWidth: 90 }} value={row.expectedTime}
                            onChange={e => setReceptionRows(prev => prev.map((r, j) => j === i ? { ...r, expectedTime: e.target.value } : r))}
                            placeholder="e.g. 10:00 AM" />
                        </td>
                        <td style={{ ...TD, minWidth: 90 }}>
                          <OtherSelect
                            style={{ minWidth: 70 }}
                            options={['Yes', 'No']}
                            value={row.receptionInformed}
                            onChange={v => setReceptionRows(prev => prev.map((r, j) => j === i ? { ...r, receptionInformed: v } : r))}
                          />
                        </td>
                        <td style={{ ...TD, minWidth: 90 }}>
                          <OtherSelect
                            style={{ minWidth: 70 }}
                            options={['Yes', 'No']}
                            value={row.gateSecurityInformed}
                            onChange={v => setReceptionRows(prev => prev.map((r, j) => j === i ? { ...r, gateSecurityInformed: v } : r))}
                          />
                        </td>
                        <td style={{ ...TD, minWidth: 90 }}>
                          <OtherSelect
                            style={{ minWidth: 70 }}
                            options={['Yes', 'No']}
                            value={row.parkingRequired}
                            onChange={v => setReceptionRows(prev => prev.map((r, j) => j === i ? { ...r, parkingRequired: v } : r))}
                          />
                        </td>
                        <td style={{ ...TD, minWidth: 130 }}>
                          <input className="settings-form__input" style={{ minWidth: 110 }} value={row.remarks}
                            onChange={e => setReceptionRows(prev => prev.map((r, j) => j === i ? { ...r, remarks: e.target.value } : r))}
                            placeholder="Remarks" />
                        </td>
                        <td style={{ ...TD, width: 36 }}>
                          {receptionRows.length > 1 && (
                            <button type="button" className="btn btn--ghost btn--sm"
                              onClick={() => setReceptionRows(prev => prev.filter((_, j) => j !== i))}>
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
                onClick={() => setReceptionRows(prev => [...prev, emptyReceptionRow()])}>
                <Plus size={13} /> Add Row
              </button>
            </div>

            {/* Section 14 — Travel / Commuting / Vehicle Coordination */}
            <div className="settings-card">
              <div className="form-section-title">14. Travel / Commuting / Vehicle Coordination</div>
              <div className="tbl-scroll">
                <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%', minWidth: 800 }}>
                  <thead>
                    <tr>
                      {['Guest/Recruiter/Trainer Name', 'From', 'To', 'Pickup Time', 'Drop Time', 'Vehicle/Driver Details', 'Status', 'Remarks', ''].map(h => <th key={h} style={TH}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {travelRows.map((row, i) => (
                      <tr key={i}>
                        <td style={{ ...TD, minWidth: 140 }}>
                          <input className="settings-form__input" style={{ minWidth: 120 }} value={row.guestName}
                            onChange={e => setTravelRows(prev => prev.map((r, j) => j === i ? { ...r, guestName: e.target.value } : r))}
                            placeholder="Name" />
                        </td>
                        <td style={{ ...TD, minWidth: 130 }}>
                          <input className="settings-form__input" style={{ minWidth: 110 }} value={row.from}
                            onChange={e => setTravelRows(prev => prev.map((r, j) => j === i ? { ...r, from: e.target.value } : r))}
                            placeholder="Airport / Hotel / Station / Campus" />
                        </td>
                        <td style={{ ...TD, minWidth: 110 }}>
                          <input className="settings-form__input" style={{ minWidth: 90 }} value={row.to}
                            onChange={e => setTravelRows(prev => prev.map((r, j) => j === i ? { ...r, to: e.target.value } : r))}
                            placeholder="To" />
                        </td>
                        <td style={{ ...TD, minWidth: 100 }}>
                          <input className="settings-form__input" style={{ minWidth: 80 }} value={row.pickupTime}
                            onChange={e => setTravelRows(prev => prev.map((r, j) => j === i ? { ...r, pickupTime: e.target.value } : r))}
                            placeholder="Time" />
                        </td>
                        <td style={{ ...TD, minWidth: 100 }}>
                          <input className="settings-form__input" style={{ minWidth: 80 }} value={row.dropTime}
                            onChange={e => setTravelRows(prev => prev.map((r, j) => j === i ? { ...r, dropTime: e.target.value } : r))}
                            placeholder="Time" />
                        </td>
                        <td style={{ ...TD, minWidth: 140 }}>
                          <input className="settings-form__input" style={{ minWidth: 120 }} value={row.vehicleDriverDetails}
                            onChange={e => setTravelRows(prev => prev.map((r, j) => j === i ? { ...r, vehicleDriverDetails: e.target.value } : r))}
                            placeholder="Vehicle / Driver" />
                        </td>
                        <td style={{ ...TD, minWidth: 110 }}>
                          <OtherSelect
                            style={{ minWidth: 90 }}
                            options={['Completed', 'Pending']}
                            value={row.status}
                            onChange={v => setTravelRows(prev => prev.map((r, j) => j === i ? { ...r, status: v } : r))}
                          />
                        </td>
                        <td style={{ ...TD, minWidth: 120 }}>
                          <input className="settings-form__input" style={{ minWidth: 100 }} value={row.remarks}
                            onChange={e => setTravelRows(prev => prev.map((r, j) => j === i ? { ...r, remarks: e.target.value } : r))}
                            placeholder="Remarks" />
                        </td>
                        <td style={{ ...TD, width: 36 }}>
                          {travelRows.length > 1 && (
                            <button type="button" className="btn btn--ghost btn--sm"
                              onClick={() => setTravelRows(prev => prev.filter((_, j) => j !== i))}>
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
                onClick={() => setTravelRows(prev => [...prev, emptyTravelRow()])}>
                <Plus size={13} /> Add Row
              </button>

              <div style={{ marginTop: 20 }}>
                <div className="form-section-title" style={{ fontSize: 13 }}>Vehicle / Driver Details</div>
                <div className="form-grid form-grid--2" style={{ marginTop: 8 }}>
                  <div className="settings-form__field">
                    <label className="settings-form__label">Driver Name</label>
                    <input className="settings-form__input" value={travelDetails.driverName}
                      onChange={e => setTravelDetails(prev => ({ ...prev, driverName: e.target.value }))}
                      placeholder="Driver Name" />
                  </div>
                  <div className="settings-form__field">
                    <label className="settings-form__label">Driver Mobile No.</label>
                    <input className="settings-form__input" value={travelDetails.driverMobile}
                      onChange={e => setTravelDetails(prev => ({ ...prev, driverMobile: e.target.value }))}
                      placeholder="Mobile No." />
                  </div>
                  <div className="settings-form__field">
                    <label className="settings-form__label">Vehicle No.</label>
                    <input className="settings-form__input" value={travelDetails.vehicleNo}
                      onChange={e => setTravelDetails(prev => ({ ...prev, vehicleNo: e.target.value }))}
                      placeholder="Vehicle No." />
                  </div>
                  <div className="settings-form__field">
                    <label className="settings-form__label">Vendor / Internal Vehicle</label>
                    <input className="settings-form__input" value={travelDetails.vendorInternal}
                      onChange={e => setTravelDetails(prev => ({ ...prev, vendorInternal: e.target.value }))}
                      placeholder="Vendor / Internal" />
                  </div>
                  <div className="settings-form__field">
                    <label className="settings-form__label">Security Informed</label>
                    <OtherSelect
                      options={['Yes', 'No']}
                      value={travelDetails.securityInformed}
                      onChange={v => setTravelDetails(prev => ({ ...prev, securityInformed: v }))}
                    />
                  </div>
                  <div className="settings-form__field">
                    <label className="settings-form__label">Parking Arranged</label>
                    <OtherSelect
                      options={['Yes', 'No']}
                      value={travelDetails.parkingArranged}
                      onChange={v => setTravelDetails(prev => ({ ...prev, parkingArranged: v }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 15 — Hospitality Management Report */}
            <div className="settings-card">
              <div className="form-section-title">15. Hospitality Management Report</div>
              <div className="tbl-scroll">
                <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%', minWidth: 700 }}>
                  <thead>
                    <tr>
                      {['Guest / Company / Trainer', 'Hospitality Requirement', 'Time', 'Arranged By', 'Status', 'Remarks', ''].map(h => <th key={h} style={TH}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {hospitalityRows.map((row, i) => (
                      <tr key={i}>
                        <td style={{ ...TD, minWidth: 150 }}>
                          <input className="settings-form__input" style={{ minWidth: 130 }} value={row.guest}
                            onChange={e => setHospitalityRows(prev => prev.map((r, j) => j === i ? { ...r, guest: e.target.value } : r))}
                            placeholder="Guest / Company" />
                        </td>
                        <td style={{ ...TD, minWidth: 150 }}>
                          <OtherSelect
                            style={{ minWidth: 130 }}
                            options={OA_HOSPITALITY_REQUIREMENTS}
                            value={row.requirement}
                            onChange={v => setHospitalityRows(prev => prev.map((r, j) => j === i ? { ...r, requirement: v } : r))}
                          />
                        </td>
                        <td style={{ ...TD, minWidth: 90 }}>
                          <input className="settings-form__input" style={{ minWidth: 70 }} value={row.time}
                            onChange={e => setHospitalityRows(prev => prev.map((r, j) => j === i ? { ...r, time: e.target.value } : r))}
                            placeholder="Time" />
                        </td>
                        <td style={{ ...TD, minWidth: 110 }}>
                          <input className="settings-form__input" style={{ minWidth: 90 }} value={row.arrangedBy}
                            onChange={e => setHospitalityRows(prev => prev.map((r, j) => j === i ? { ...r, arrangedBy: e.target.value } : r))}
                            placeholder="Arranged By" />
                        </td>
                        <td style={{ ...TD, minWidth: 100 }}>
                          <OtherSelect
                            style={{ minWidth: 80 }}
                            options={['Done', 'Pending']}
                            value={row.status}
                            onChange={v => setHospitalityRows(prev => prev.map((r, j) => j === i ? { ...r, status: v } : r))}
                          />
                        </td>
                        <td style={{ ...TD, minWidth: 120 }}>
                          <input className="settings-form__input" style={{ minWidth: 100 }} value={row.remarks}
                            onChange={e => setHospitalityRows(prev => prev.map((r, j) => j === i ? { ...r, remarks: e.target.value } : r))}
                            placeholder="Remarks" />
                        </td>
                        <td style={{ ...TD, width: 36 }}>
                          {hospitalityRows.length > 1 && (
                            <button type="button" className="btn btn--ghost btn--sm"
                              onClick={() => setHospitalityRows(prev => prev.filter((_, j) => j !== i))}>
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
                onClick={() => setHospitalityRows(prev => [...prev, emptyHospitalityRow()])}>
                <Plus size={13} /> Add Row
              </button>
            </div>

            {/* Section 16 — Printing / Photocopy / Material Preparation Report */}
            <div className="settings-card">
              <div className="form-section-title">16. Printing / Photocopy / Material Preparation Report</div>
              <div className="tbl-scroll">
                <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%', minWidth: 780 }}>
                  <thead>
                    <tr>
                      {['Printed Material', 'Quantity', 'Purpose', 'Requested By', 'Completed Time', 'Status', 'Remarks'].map(h => <th key={h} style={TH}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {printingMaterial.map((row, i) => (
                      <tr key={i}>
                        <td style={{ ...TD, minWidth: 130 }}><span style={{ fontSize: 12, opacity: 0.85 }}>{row.material}</span></td>
                        <td style={{ ...TD, minWidth: 80 }}>
                          <input type="number" className="settings-form__input" style={{ minWidth: 60 }} value={row.quantity}
                            onChange={e => setPrintingMaterial(prev => prev.map((r, j) => j === i ? { ...r, quantity: e.target.value } : r))}
                            placeholder="0" min={0} />
                        </td>
                        <td style={{ ...TD, minWidth: 140 }}>
                          <input className="settings-form__input" style={{ minWidth: 120 }} value={row.purpose}
                            onChange={e => setPrintingMaterial(prev => prev.map((r, j) => j === i ? { ...r, purpose: e.target.value } : r))}
                            placeholder="Drive / Training / Assessment" />
                        </td>
                        <td style={{ ...TD, minWidth: 110 }}>
                          <input className="settings-form__input" style={{ minWidth: 90 }} value={row.requestedBy}
                            onChange={e => setPrintingMaterial(prev => prev.map((r, j) => j === i ? { ...r, requestedBy: e.target.value } : r))}
                            placeholder="Requested By" />
                        </td>
                        <td style={{ ...TD, minWidth: 110 }}>
                          <input className="settings-form__input" style={{ minWidth: 90 }} value={row.completedTime}
                            onChange={e => setPrintingMaterial(prev => prev.map((r, j) => j === i ? { ...r, completedTime: e.target.value } : r))}
                            placeholder="Time" />
                        </td>
                        <td style={{ ...TD, minWidth: 100 }}>
                          <OtherSelect
                            style={{ minWidth: 80 }}
                            options={['Done', 'Pending']}
                            value={row.status}
                            onChange={v => setPrintingMaterial(prev => prev.map((r, j) => j === i ? { ...r, status: v } : r))}
                          />
                        </td>
                        <td style={{ ...TD, minWidth: 120 }}>
                          <input className="settings-form__input" style={{ minWidth: 100 }} value={row.remarks}
                            onChange={e => setPrintingMaterial(prev => prev.map((r, j) => j === i ? { ...r, remarks: e.target.value } : r))}
                            placeholder="Remarks" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 17 — Installation / Display / Branding Readiness Report */}
            <div className="settings-card">
              <div className="form-section-title">17. Installation / Display / Branding Readiness Report</div>
              <div className="tbl-scroll">
                <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%', minWidth: 720 }}>
                  <thead>
                    <tr>
                      {['Item Installed/Displayed', 'Location', 'Installed By', 'Time Completed', 'Status', 'Remarks'].map(h => <th key={h} style={TH}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {installationDisplay.map((row, i) => (
                      <tr key={i}>
                        <td style={{ ...TD, minWidth: 140 }}><span style={{ fontSize: 12, opacity: 0.85 }}>{row.item}</span></td>
                        <td style={{ ...TD, minWidth: 160 }}>
                          <input className="settings-form__input" style={{ minWidth: 140 }} value={row.location}
                            onChange={e => setInstallationDisplay(prev => prev.map((r, j) => j === i ? { ...r, location: e.target.value } : r))}
                            placeholder={INSTALLATION_ROWS[i]?.location ?? ''} />
                        </td>
                        <td style={{ ...TD, minWidth: 110 }}>
                          <input className="settings-form__input" style={{ minWidth: 90 }} value={row.installedBy}
                            onChange={e => setInstallationDisplay(prev => prev.map((r, j) => j === i ? { ...r, installedBy: e.target.value } : r))}
                            placeholder="By" />
                        </td>
                        <td style={{ ...TD, minWidth: 110 }}>
                          <input className="settings-form__input" style={{ minWidth: 90 }} value={row.timeCompleted}
                            onChange={e => setInstallationDisplay(prev => prev.map((r, j) => j === i ? { ...r, timeCompleted: e.target.value } : r))}
                            placeholder="Time" />
                        </td>
                        <td style={{ ...TD, minWidth: 100 }}>
                          <OtherSelect
                            style={{ minWidth: 80 }}
                            options={['Done', 'Pending']}
                            value={row.status}
                            onChange={v => setInstallationDisplay(prev => prev.map((r, j) => j === i ? { ...r, status: v } : r))}
                          />
                        </td>
                        <td style={{ ...TD, minWidth: 120 }}>
                          <input className="settings-form__input" style={{ minWidth: 100 }} value={row.remarks}
                            onChange={e => setInstallationDisplay(prev => prev.map((r, j) => j === i ? { ...r, remarks: e.target.value } : r))}
                            placeholder="Remarks" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 18 — Vendor Coordination Report */}
            <div className="settings-card">
              <div className="form-section-title">18. Vendor Coordination Report</div>
              <div className="tbl-scroll">
                <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%', minWidth: 680 }}>
                  <thead>
                    <tr>
                      {['Vendor / Service Provider', 'Service Required', 'Contact Person', 'Delivery Time', 'Status', 'Remarks'].map(h => <th key={h} style={TH}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {vendorCoordination.map((row, i) => (
                      <tr key={i}>
                        <td style={{ ...TD, minWidth: 130 }}><span style={{ fontSize: 12, opacity: 0.85 }}>{row.vendor}</span></td>
                        <td style={{ ...TD, minWidth: 160 }}><span style={{ fontSize: 12, opacity: 0.75 }}>{row.serviceRequired}</span></td>
                        <td style={{ ...TD, minWidth: 120 }}>
                          <input className="settings-form__input" style={{ minWidth: 100 }} value={row.contactPerson}
                            onChange={e => setVendorCoordination(prev => prev.map((r, j) => j === i ? { ...r, contactPerson: e.target.value } : r))}
                            placeholder="Contact" />
                        </td>
                        <td style={{ ...TD, minWidth: 110 }}>
                          <input className="settings-form__input" style={{ minWidth: 90 }} value={row.deliveryTime}
                            onChange={e => setVendorCoordination(prev => prev.map((r, j) => j === i ? { ...r, deliveryTime: e.target.value } : r))}
                            placeholder="Time" />
                        </td>
                        <td style={{ ...TD, minWidth: 100 }}>
                          <OtherSelect
                            style={{ minWidth: 80 }}
                            options={['Done', 'Pending']}
                            value={row.status}
                            onChange={v => setVendorCoordination(prev => prev.map((r, j) => j === i ? { ...r, status: v } : r))}
                          />
                        </td>
                        <td style={{ ...TD, minWidth: 120 }}>
                          <input className="settings-form__input" style={{ minWidth: 100 }} value={row.remarks}
                            onChange={e => setVendorCoordination(prev => prev.map((r, j) => j === i ? { ...r, remarks: e.target.value } : r))}
                            placeholder="Remarks" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 19 — Pre-Process Readiness Checklist */}
            <div className="settings-card">
              <div className="form-section-title">19. Pre-Process Readiness Checklist</div>
              <div className="tbl-scroll">
                <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%', minWidth: 480 }}>
                  <thead>
                    <tr>
                      {['Checklist Point', 'Status', 'Remarks'].map(h => <th key={h} style={TH}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {preChecklist.map((row, i) => (
                      <tr key={i}>
                        <td style={{ ...TD, minWidth: 220 }}><span style={{ fontSize: 12, opacity: 0.85 }}>{row.point}</span></td>
                        <td style={{ ...TD, minWidth: 100 }}>
                          <OtherSelect
                            style={{ minWidth: 80 }}
                            options={['Done', 'Pending']}
                            value={row.status}
                            onChange={v => setPreChecklist(prev => prev.map((r, j) => j === i ? { ...r, status: v } : r))}
                          />
                        </td>
                        <td style={{ ...TD, minWidth: 160 }}>
                          <input className="settings-form__input" style={{ minWidth: 140 }} value={row.remarks}
                            onChange={e => setPreChecklist(prev => prev.map((r, j) => j === i ? { ...r, remarks: e.target.value } : r))}
                            placeholder="Remarks" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 20 — Post-Process Closure Checklist */}
            <div className="settings-card">
              <div className="form-section-title">20. Post-Process Closure Checklist</div>
              <div className="tbl-scroll">
                <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%', minWidth: 480 }}>
                  <thead>
                    <tr>
                      {['Checklist Point', 'Status', 'Remarks'].map(h => <th key={h} style={TH}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {postChecklist.map((row, i) => (
                      <tr key={i}>
                        <td style={{ ...TD, minWidth: 220 }}><span style={{ fontSize: 12, opacity: 0.85 }}>{row.point}</span></td>
                        <td style={{ ...TD, minWidth: 100 }}>
                          <OtherSelect
                            style={{ minWidth: 80 }}
                            options={['Done', 'Pending']}
                            value={row.status}
                            onChange={v => setPostChecklist(prev => prev.map((r, j) => j === i ? { ...r, status: v } : r))}
                          />
                        </td>
                        <td style={{ ...TD, minWidth: 160 }}>
                          <input className="settings-form__input" style={{ minWidth: 140 }} value={row.remarks}
                            onChange={e => setPostChecklist(prev => prev.map((r, j) => j === i ? { ...r, remarks: e.target.value } : r))}
                            placeholder="Remarks" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 21 — Next-Day Readiness Plan */}
            <div className="settings-card">
              <div className="form-section-title">21. Next-Day Readiness Plan</div>
              <div className="tbl-scroll">
                <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%', minWidth: 480 }}>
                  <thead>
                    <tr>
                      {['Checklist Point', 'Status', 'Remarks'].map(h => <th key={h} style={TH}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {nextDayReadiness.map((row, i) => (
                      <tr key={i}>
                        <td style={{ ...TD, minWidth: 220 }}><span style={{ fontSize: 12, opacity: 0.85 }}>{row.point}</span></td>
                        <td style={{ ...TD, minWidth: 100 }}>
                          <OtherSelect
                            style={{ minWidth: 80 }}
                            options={['Done', 'Pending']}
                            value={row.status}
                            onChange={v => setNextDayReadiness(prev => prev.map((r, j) => j === i ? { ...r, status: v } : r))}
                          />
                        </td>
                        <td style={{ ...TD, minWidth: 160 }}>
                          <input className="settings-form__input" style={{ minWidth: 140 }} value={row.remarks}
                            onChange={e => setNextDayReadiness(prev => prev.map((r, j) => j === i ? { ...r, remarks: e.target.value } : r))}
                            placeholder="Remarks" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Submit */}
        <div className="settings-card">
          <div className="settings-form__actions">
            <button type="submit" disabled={status === 'saving'} className="btn btn--primary">
              <Send size={18} />
              {status === 'saving' ? 'Submitting...' : 'Submit Report'}
            </button>
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

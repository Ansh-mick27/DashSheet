// ==========================================
// DashSheet — Placement Sourcing Report Form Page
// ==========================================
import { useState, useMemo, FormEvent } from 'react';
import { CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { submitPlacementReport } from '../../services/dataApi';
import { todayISO, isoToDDMMYYYY } from '../../lib/dateUtils';
import {
  INDUSTRY_SECTORS, COMPANY_TYPES, SOURCE_CHANNELS, MODES_OF_CONTACT,
  PLACEMENT_STATUSES, PRIORITIES, ASSIGNED_TO_OPTIONS,
  OPPORTUNITY_TYPES, ACTIVITY_STATUSES, ACTIVITY_PURPOSES, HIRING_MODES, DRIVE_YEARS
} from '../../data/constants';
import { PlacementReport, ExtraFields, HiringRound } from '../../types';
import { useFormConfig } from '../../lib/useFormConfig';
import { mergeOptions } from '../../lib/options';
import FormField from '../../components/form/FormField';
import FormSelect from '../../components/form/FormSelect';
import FormTextarea from '../../components/form/FormTextarea';
import FormRadioGroup from '../../components/form/FormRadioGroup';
import RoundsConfig from '../../components/form/RoundsConfig';
import CustomFieldsSection from '../../components/form/CustomFieldsSection';

export default function PlacementReportFormPage() {
  const { member } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [industrySector, setIndustrySector] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [hqLocation, setHqLocation] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [designation, setDesignation] = useState('');
  const [emailId, setEmailId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [sourceChannel, setSourceChannel] = useState('');
  const [dateOfFirstContact, setDateOfFirstContact] = useState(todayISO());
  const [modeOfContact, setModeOfContact] = useState('');
  const [currentStatus, setCurrentStatus] = useState('');
  const [rolesOffered, setRolesOffered] = useState('');
  const [numberOfOpenings, setNumberOfOpenings] = useState('');
  const [ctcLPA, setCtcLPA] = useState('');
  const [driveDate, setDriveDate] = useState('');
  const [studentsSelected, setStudentsSelected] = useState('');
  const [remarks, setRemarks] = useState('');
  const [priority, setPriority] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [actionRequired, setActionRequired] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [followUpDone, setFollowUpDone] = useState(false);
  const [opportunityType, setOpportunityType] = useState('');
  const [activityStatus, setActivityStatus] = useState('');
  const [activityPurpose, setActivityPurpose] = useState('');
  const [hiringMode, setHiringMode] = useState('');
  const [hiringRounds, setHiringRounds] = useState<HiringRound[]>([]);
  const [driveYear, setDriveYear] = useState('');
  const [extraFields, setExtraFields] = useState<ExtraFields>({});
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [hiringModeError, setHiringModeError] = useState('');

  const { fieldOptions, customFields } = useFormConfig('placement');
  const industrySectors = useMemo(() => mergeOptions(INDUSTRY_SECTORS, fieldOptions, 'industrySectors'), [fieldOptions]);
  const companyTypes = useMemo(() => mergeOptions(COMPANY_TYPES, fieldOptions, 'companyTypes'), [fieldOptions]);
  const sourceChannels = useMemo(() => mergeOptions(SOURCE_CHANNELS, fieldOptions, 'sourceChannels'), [fieldOptions]);
  const modesOfContact = useMemo(() => mergeOptions(MODES_OF_CONTACT, fieldOptions, 'modesOfContact'), [fieldOptions]);
  const placementStatuses = useMemo(() => mergeOptions(PLACEMENT_STATUSES, fieldOptions, 'placementStatuses'), [fieldOptions]);
  const priorities = useMemo(() => mergeOptions(PRIORITIES, fieldOptions, 'priorities'), [fieldOptions]);
  const assignedToOptions = useMemo(() => mergeOptions(ASSIGNED_TO_OPTIONS, fieldOptions, 'assignedTo'), [fieldOptions]);
  const activityPurposes = useMemo(() => mergeOptions(ACTIVITY_PURPOSES, fieldOptions, 'activityPurposes'), [fieldOptions]);

  const handleExtraChange = (key: string, value: string | number | boolean) => {
    setExtraFields(prev => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setCompanyName(''); setIndustrySector(''); setCompanyType(''); setHqLocation('');
    setContactPerson(''); setDesignation(''); setEmailId(''); setPhoneNumber('');
    setSourceChannel(''); setDateOfFirstContact(todayISO()); setModeOfContact('');
    setCurrentStatus(''); setRolesOffered(''); setNumberOfOpenings(''); setCtcLPA('');
    setDriveDate(''); setStudentsSelected(''); setRemarks(''); setPriority('');
    setNextFollowUpDate(''); setActionRequired(''); setAssignedTo(''); setFollowUpDone(false);
    setOpportunityType(''); setActivityStatus(''); setActivityPurpose('');
    setHiringMode(''); setHiringRounds([]); setDriveYear(''); setHiringModeError('');
    setExtraFields({});
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!member) return;
    if (hiringRounds.length > 0 && !hiringMode) {
      setHiringModeError('Hiring Mode is required once you add interview rounds.');
      return;
    }
    setHiringModeError('');
    setStatus('saving');
    try {
      const report: PlacementReport = {
        timestamp: new Date().toISOString(),
        staffName: member.name,
        companyName,
        industrySector: industrySector as PlacementReport['industrySector'],
        companyType: companyType as PlacementReport['companyType'],
        hqLocation,
        contactPerson,
        designation,
        emailId,
        phoneNumber,
        sourceChannel: sourceChannel as PlacementReport['sourceChannel'],
        dateOfFirstContact: isoToDDMMYYYY(dateOfFirstContact),
        modeOfContact: modeOfContact as PlacementReport['modeOfContact'],
        currentStatus: currentStatus as PlacementReport['currentStatus'],
        rolesOffered,
        numberOfOpenings: Number(numberOfOpenings) || 0,
        ctcLPA: Number(ctcLPA) || 0,
        driveDate: driveDate || 'TBD',
        studentsSelected: Number(studentsSelected) || 0,
        remarks,
        priority: priority as PlacementReport['priority'],
        nextFollowUpDate,
        actionRequired,
        assignedTo: assignedTo as PlacementReport['assignedTo'],
        followUpDone,
        opportunityType: opportunityType as PlacementReport['opportunityType'],
        activityStatus: activityStatus as PlacementReport['activityStatus'],
        activityPurpose,
        hiringMode: hiringMode as PlacementReport['hiringMode'],
        hiringRounds,
        driveYear,
        extraFields
      };
      await submitPlacementReport(report);
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
          <h2 className="page-title">CRP Process Report</h2>
          <p className="page-subtitle">Log a new company contact or CRP Process update</p>
        </div>
      </div>

      <div className="settings-card">
        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-section-title">Personal Details</div>
          <FormField label="Name" name="staffName" value={member?.name ?? ''} onChange={() => {}} readOnly />

          <div className="form-section-title">Corporate Details</div>
          <div className="form-grid form-grid--3">
            <FormField label="Company Name" name="companyName" value={companyName} onChange={setCompanyName} required />
            <FormSelect label="Industry Sector" name="industrySector" value={industrySector} onChange={setIndustrySector} options={industrySectors} required />
            <FormSelect label="Company Type" name="companyType" value={companyType} onChange={setCompanyType} options={companyTypes} required />
          </div>
          <FormField label="HQ Location" name="hqLocation" value={hqLocation} onChange={setHqLocation} />

          <div className="form-section-title">Contact Details</div>
          <div className="form-grid form-grid--3">
            <FormField label="Contact Person" name="contactPerson" value={contactPerson} onChange={setContactPerson} />
            <FormField label="Designation" name="designation" value={designation} onChange={setDesignation} />
            <FormField label="Email ID" name="emailId" type="email" value={emailId} onChange={setEmailId} />
          </div>
          <div className="form-grid">
            <FormField label="Phone Number" name="phoneNumber" value={phoneNumber} onChange={setPhoneNumber} />
            <FormSelect label="Source Channel" name="sourceChannel" value={sourceChannel} onChange={setSourceChannel} options={sourceChannels} required />
          </div>
          <div className="form-grid">
            <FormField label="Date of First Contact" name="dateOfFirstContact" type="date" value={dateOfFirstContact} onChange={setDateOfFirstContact} required />
            <FormSelect label="Mode of Contact" name="modeOfContact" value={modeOfContact} onChange={setModeOfContact} options={modesOfContact} required />
          </div>

          <div className="form-section-title">Hiring Details</div>
          <div className="form-grid">
            <FormRadioGroup label="Opportunity Type" name="opportunityType" value={opportunityType} onChange={setOpportunityType} options={OPPORTUNITY_TYPES} required />
            <FormRadioGroup label="Activity Status" name="activityStatus" value={activityStatus} onChange={setActivityStatus} options={ACTIVITY_STATUSES} required />
          </div>
          <div className="form-grid">
            <FormSelect label="Activity Purpose" name="activityPurpose" value={activityPurpose} onChange={setActivityPurpose} options={activityPurposes} />
            <FormSelect label="Current Status" name="currentStatus" value={currentStatus} onChange={setCurrentStatus} options={placementStatuses} required />
          </div>
          <div className="form-grid">
            <FormField label="Roles Offered" name="rolesOffered" value={rolesOffered} onChange={setRolesOffered} />
          </div>
          <div className="form-grid form-grid--3">
            <FormField label="Number of Openings" name="numberOfOpenings" type="number" value={numberOfOpenings} onChange={setNumberOfOpenings} min={0} />
            <FormField label="CTC (LPA)" name="ctcLPA" type="number" value={ctcLPA} onChange={setCtcLPA} min={0} step="0.1" />
            <FormField label="Students Selected" name="studentsSelected" type="number" value={studentsSelected} onChange={setStudentsSelected} min={0} />
          </div>
          <div className="form-grid">
            <FormField label="Drive Date" name="driveDate" type="date" value={driveDate} onChange={setDriveDate} />
            <FormSelect label="Drive Year" name="driveYear" value={driveYear} onChange={setDriveYear} options={DRIVE_YEARS} />
          </div>

          <div className="form-section-title">Hiring Process Configuration</div>
          <p className="form-readonly-note">Capture this once the company agrees for hiring.</p>
          <div className="form-grid">
            <FormSelect label="Hiring Mode" name="hiringMode" value={hiringMode} onChange={setHiringMode} options={HIRING_MODES} />
          </div>
          <RoundsConfig value={hiringRounds} onChange={setHiringRounds} />
          {hiringModeError && (
            <span className="settings-form__status settings-form__status--error">
              <AlertCircle size={16} /> {hiringModeError}
            </span>
          )}

          <div className="form-section-title">Follow-up</div>
          <FormTextarea label="Remarks" name="remarks" value={remarks} onChange={setRemarks} rows={2} />
          <div className="form-grid form-grid--3">
            <FormSelect label="Priority" name="priority" value={priority} onChange={setPriority} options={priorities} required />
            <FormField label="Next Follow-up Date" name="nextFollowUpDate" type="date" value={nextFollowUpDate} onChange={setNextFollowUpDate} />
            <FormSelect label="Assigned To" name="assignedTo" value={assignedTo} onChange={setAssignedTo} options={assignedToOptions} />
          </div>
          <FormTextarea label="Action Required" name="actionRequired" value={actionRequired} onChange={setActionRequired} rows={2} />
          <label className="form-checkbox form-checkbox-inline">
            <input type="checkbox" checked={followUpDone} onChange={e => setFollowUpDone(e.target.checked)} />
            <span>Follow-up done</span>
          </label>

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

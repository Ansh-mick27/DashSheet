// ==========================================
// DashSheet — Training Report Form Page
// ==========================================
import { useState, useMemo, useEffect, FormEvent } from 'react';
import { CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { submitTrainingReport } from '../../services/dataApi';
import { todayISO, isoToDDMMYYYY } from '../../lib/dateUtils';
import { COLLEGES_COURSES_SPECIALIZATIONS, DURATIONS, PARTICIPATION_LEVELS, TEACHING_METHODS, SECTIONS, ACADEMIC_YEARS, SEMESTERS } from '../../data/constants';
import { TrainingReport, ExtraFields, BranchStudentCount } from '../../types';
import { useFormConfig } from '../../lib/useFormConfig';
import { mergeOptions, mergeCollegeCourseSpecs } from '../../lib/options';
import FormField from '../../components/form/FormField';
import FormSelect from '../../components/form/FormSelect';
import FormTextarea from '../../components/form/FormTextarea';
import FormCheckboxGroup from '../../components/form/FormCheckboxGroup';
import CustomFieldsSection from '../../components/form/CustomFieldsSection';

const EMPTY_METHODS: TrainingReport['methods'] = {
  selected: [],
  other: ''
};

interface TrainingReportFormPageProps {
  branchStudentCounts: BranchStudentCount[];
}

export default function TrainingReportFormPage({ branchStudentCounts }: TrainingReportFormPageProps) {
  const { member } = useAuth();
  const [date, setDate] = useState(todayISO());
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [section, setSection] = useState('');
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [topicCovered, setTopicCovered] = useState('');
  const [learningObjectives, setLearningObjectives] = useState('');
  const [duration, setDuration] = useState('');
  const [methods, setMethods] = useState(EMPTY_METHODS);
  const [studentsPresent, setStudentsPresent] = useState('');
  const [totalEnrolled, setTotalEnrolled] = useState('');
  const [participationLevel, setParticipationLevel] = useState('');
  const [engagementObservations, setEngagementObservations] = useState('');
  const [challengesTrainer, setChallengesTrainer] = useState('');
  const [challengesStudent, setChallengesStudent] = useState('');
  const [actionPlan, setActionPlan] = useState('');
  const [feedback, setFeedback] = useState('');
  const [reviewedBy, setReviewedBy] = useState('');
  const [extraFields, setExtraFields] = useState<ExtraFields>({});
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const { fieldOptions, customFields } = useFormConfig('training');

  const collegeCourseSpecs = useMemo(
    () => mergeCollegeCourseSpecs(COLLEGES_COURSES_SPECIALIZATIONS, fieldOptions),
    [fieldOptions]
  );
  const durations = useMemo(() => mergeOptions(DURATIONS, fieldOptions, 'durations'), [fieldOptions]);
  const participationLevels = useMemo(() => mergeOptions(PARTICIPATION_LEVELS, fieldOptions, 'participationLevels'), [fieldOptions]);
  const teachingMethods = useMemo(() => mergeOptions(TEACHING_METHODS, fieldOptions, 'teachingMethods'), [fieldOptions]);

  const colleges = useMemo(
    () => Array.from(new Set(collegeCourseSpecs.map(c => c.college))),
    [collegeCourseSpecs]
  );
  const courses = useMemo(
    () => Array.from(new Set(collegeCourseSpecs.filter(c => c.college === college).map(c => c.course))),
    [collegeCourseSpecs, college]
  );
  const specializations = useMemo(
    () => collegeCourseSpecs
      .filter(c => c.college === college && c.course === course && c.specialization)
      .map(c => c.specialization),
    [collegeCourseSpecs, college, course]
  );

  const matchedBranchCount = useMemo(
    () => branchStudentCounts.find(b =>
      b.college === college && b.course === course && b.specialization === specialization &&
      b.section === section && b.year === year && b.semester === semester
    ),
    [branchStudentCounts, college, course, specialization, section, year, semester]
  );

  useEffect(() => {
    if (matchedBranchCount) setTotalEnrolled(String(matchedBranchCount.studentCount));
  }, [matchedBranchCount]);

  const handleExtraChange = (key: string, value: string | number | boolean) => {
    setExtraFields(prev => ({ ...prev, [key]: value }));
  };

  const handleCollegeChange = (value: string) => {
    setCollege(value);
    setCourse('');
    setSpecialization('');
    setSection('');
  };

  const handleCourseChange = (value: string) => {
    setCourse(value);
    setSpecialization('');
    setSection('');
  };

  const handleSpecializationChange = (value: string) => {
    setSpecialization(value);
    setSection('');
  };

  const resetForm = () => {
    setDate(todayISO());
    setCollege(''); setCourse(''); setSpecialization(''); setSection('');
    setYear(''); setSemester('');
    setTopicCovered(''); setLearningObjectives(''); setDuration('');
    setMethods(EMPTY_METHODS);
    setStudentsPresent(''); setTotalEnrolled(''); setParticipationLevel('');
    setEngagementObservations(''); setChallengesTrainer(''); setChallengesStudent('');
    setActionPlan(''); setFeedback(''); setReviewedBy('');
    setExtraFields({});
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!member) return;
    setStatus('saving');
    try {
      const report: TrainingReport = {
        timestamp: new Date().toISOString(),
        trainerName: member.name,
        date: isoToDDMMYYYY(date),
        college,
        course,
        specialization,
        section,
        year,
        semester,
        topicCovered,
        learningObjectives,
        duration,
        methods,
        studentsPresent: Number(studentsPresent) || 0,
        totalEnrolled: Number(totalEnrolled) || 0,
        participationLevel: participationLevel as TrainingReport['participationLevel'],
        engagementObservations,
        challengesTrainer,
        challengesStudent,
        actionPlan,
        feedback,
        reviewedBy,
        extraFields
      };
      await submitTrainingReport(report);
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
          <h2 className="page-title">Session Report</h2>
          <p className="page-subtitle">Log a training session you conducted</p>
        </div>
      </div>

      <div className="settings-card">
        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-grid">
            <FormField label="Trainer Name" name="trainerName" value={member?.name ?? ''} onChange={() => {}} readOnly />
            <FormField label="Date" name="date" type="date" value={date} onChange={() => {}} readOnly required />
          </div>

          <div className="form-grid form-grid--3">
            <FormSelect label="College" name="college" value={college} onChange={handleCollegeChange} options={colleges} required />
            <FormSelect label="Course" name="course" value={course} onChange={handleCourseChange} options={courses} required />
            {specializations.length > 0 && (
              <FormSelect label="Specialization" name="specialization" value={specialization} onChange={handleSpecializationChange} options={specializations} required />
            )}
          </div>

          <div className="form-grid form-grid--3">
            <FormSelect label="Section" name="section" value={section} onChange={setSection} options={SECTIONS} required />
            <FormSelect label="Year" name="year" value={year} onChange={setYear} options={ACADEMIC_YEARS} required />
            <FormSelect label="Semester" name="semester" value={semester} onChange={setSemester} options={SEMESTERS} required />
          </div>

          <div className="form-grid">
            <FormField label="Topic Covered" name="topicCovered" value={topicCovered} onChange={setTopicCovered} required />
            <FormSelect label="Session Duration" name="duration" value={duration} onChange={setDuration} options={durations} required />
          </div>

          <FormTextarea label="Learning Objectives" name="learningObjectives" value={learningObjectives} onChange={setLearningObjectives} rows={2} />

          <FormCheckboxGroup label="Teaching Methods Used" value={methods} onChange={setMethods} methods={teachingMethods} />

          <div className="form-grid form-grid--3">
            <div>
              <FormField
                label="Total Students Enrolled" name="totalEnrolled" type="number"
                value={totalEnrolled} onChange={setTotalEnrolled} required min={0}
                readOnly={!!matchedBranchCount}
              />
              {matchedBranchCount && <p className="form-readonly-note">Auto-filled from section settings</p>}
            </div>
            <FormField label="Students Present" name="studentsPresent" type="number" value={studentsPresent} onChange={setStudentsPresent} required min={0} />
            <FormSelect label="Participation Level" name="participationLevel" value={participationLevel} onChange={setParticipationLevel} options={participationLevels} required />
          </div>

          <FormTextarea label="Engagement Observations" name="engagementObservations" value={engagementObservations} onChange={setEngagementObservations} rows={2} />

          <div className="form-grid">
            <FormTextarea label="Challenges Faced (Trainer)" name="challengesTrainer" value={challengesTrainer} onChange={setChallengesTrainer} rows={2} />
            <FormTextarea label="Challenges Faced (Students)" name="challengesStudent" value={challengesStudent} onChange={setChallengesStudent} rows={2} />
          </div>

          <FormTextarea label="Action Plan for Next Session" name="actionPlan" value={actionPlan} onChange={setActionPlan} rows={2} />
          <FormTextarea label="Feedback" name="feedback" value={feedback} onChange={setFeedback} rows={2} />
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

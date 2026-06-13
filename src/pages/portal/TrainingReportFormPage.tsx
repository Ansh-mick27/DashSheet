// ==========================================
// DashSheet — Training Report Form Page
// ==========================================
import { useState, useMemo, FormEvent } from 'react';
import { CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { submitTrainingReport } from '../../services/dataApi';
import { todayISO, isoToDDMMYYYY } from '../../lib/dateUtils';
import { COLLEGES_COURSES_SPECIALIZATIONS, DURATIONS, PARTICIPATION_LEVELS } from '../../data/constants';
import { TrainingReport } from '../../types';
import FormField from '../../components/form/FormField';
import FormSelect from '../../components/form/FormSelect';
import FormTextarea from '../../components/form/FormTextarea';
import FormCheckboxGroup from '../../components/form/FormCheckboxGroup';

const EMPTY_METHODS: TrainingReport['methods'] = {
  lecture: false,
  groupDiscussion: false,
  caseStudy: false,
  rolePlay: false,
  presentation: false,
  practical: false,
  other: ''
};

export default function TrainingReportFormPage() {
  const { member } = useAuth();
  const [date, setDate] = useState(todayISO());
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
  const [specialization, setSpecialization] = useState('');
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
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const colleges = useMemo(
    () => Array.from(new Set(COLLEGES_COURSES_SPECIALIZATIONS.map(c => c.college))),
    []
  );
  const courses = useMemo(
    () => Array.from(new Set(COLLEGES_COURSES_SPECIALIZATIONS.filter(c => c.college === college).map(c => c.course))),
    [college]
  );
  const specializations = useMemo(
    () => COLLEGES_COURSES_SPECIALIZATIONS
      .filter(c => c.college === college && c.course === course && c.specialization)
      .map(c => c.specialization),
    [college, course]
  );

  const handleCollegeChange = (value: string) => {
    setCollege(value);
    setCourse('');
    setSpecialization('');
  };

  const handleCourseChange = (value: string) => {
    setCourse(value);
    setSpecialization('');
  };

  const resetForm = () => {
    setDate(todayISO());
    setCollege(''); setCourse(''); setSpecialization('');
    setTopicCovered(''); setLearningObjectives(''); setDuration('');
    setMethods(EMPTY_METHODS);
    setStudentsPresent(''); setTotalEnrolled(''); setParticipationLevel('');
    setEngagementObservations(''); setChallengesTrainer(''); setChallengesStudent('');
    setActionPlan(''); setFeedback(''); setReviewedBy('');
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
        reviewedBy
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
          <h2 className="page-title">Training Report</h2>
          <p className="page-subtitle">Log a training session you conducted</p>
        </div>
      </div>

      <div className="settings-card">
        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-grid">
            <FormField label="Trainer Name" name="trainerName" value={member?.name ?? ''} onChange={() => {}} readOnly />
            <FormField label="Date" name="date" type="date" value={date} onChange={setDate} required />
          </div>

          <div className="form-grid form-grid--3">
            <FormSelect label="College" name="college" value={college} onChange={handleCollegeChange} options={colleges} required />
            <FormSelect label="Course" name="course" value={course} onChange={handleCourseChange} options={courses} required />
            {specializations.length > 0 && (
              <FormSelect label="Specialization" name="specialization" value={specialization} onChange={setSpecialization} options={specializations} required />
            )}
          </div>

          <div className="form-grid">
            <FormField label="Topic Covered" name="topicCovered" value={topicCovered} onChange={setTopicCovered} required />
            <FormSelect label="Session Duration" name="duration" value={duration} onChange={setDuration} options={DURATIONS} required />
          </div>

          <FormTextarea label="Learning Objectives" name="learningObjectives" value={learningObjectives} onChange={setLearningObjectives} rows={2} />

          <FormCheckboxGroup label="Teaching Methods Used" value={methods} onChange={setMethods} />

          <div className="form-grid form-grid--3">
            <FormField label="Total Students Enrolled" name="totalEnrolled" type="number" value={totalEnrolled} onChange={setTotalEnrolled} required min={0} />
            <FormField label="Students Present" name="studentsPresent" type="number" value={studentsPresent} onChange={setStudentsPresent} required min={0} />
            <FormSelect label="Participation Level" name="participationLevel" value={participationLevel} onChange={setParticipationLevel} options={PARTICIPATION_LEVELS} required />
          </div>

          <FormTextarea label="Engagement Observations" name="engagementObservations" value={engagementObservations} onChange={setEngagementObservations} rows={2} />

          <div className="form-grid">
            <FormTextarea label="Challenges Faced (Trainer)" name="challengesTrainer" value={challengesTrainer} onChange={setChallengesTrainer} rows={2} />
            <FormTextarea label="Challenges Faced (Students)" name="challengesStudent" value={challengesStudent} onChange={setChallengesStudent} rows={2} />
          </div>

          <FormTextarea label="Action Plan for Next Session" name="actionPlan" value={actionPlan} onChange={setActionPlan} rows={2} />
          <FormTextarea label="Feedback" name="feedback" value={feedback} onChange={setFeedback} rows={2} />
          <FormField label="Reviewed By (optional)" name="reviewedBy" value={reviewedBy} onChange={setReviewedBy} />

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

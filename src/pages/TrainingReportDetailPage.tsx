// ==========================================
// DashSheet — Training Report Detail Page
// ==========================================
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { TrainingReport } from '../types';
import { getSelectedMethods } from '../lib/options';

interface Props { reports: TrainingReport[]; }

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="settings-form__field">
    <label className="settings-form__label">{label}</label>
    <div className="settings-form__input" style={{ minHeight: 36, display: 'flex', alignItems: 'center' }}>
      {value || '—'}
    </div>
  </div>
);

export default function TrainingReportDetailPage({ reports }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const report = reports.find(r => encodeURIComponent(r.timestamp) === id);

  if (!report) {
    return (
      <div className="settings-page">
        <div className="page-header">
          <h2 className="page-title">Report not found</h2>
        </div>
      </div>
    );
  }

  const attendancePct = report.totalEnrolled > 0
    ? Math.round((report.studentsPresent / report.totalEnrolled) * 100)
    : 0;

  const methodsList = getSelectedMethods(report.methods).join(', ') || '—';

  return (
    <div className="settings-page">
      <div className="page-header">
        <div style={{ marginBottom: 8 }}>
          <button className="btn btn--ghost btn--sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>
        <h2 className="page-title">Session Report — {report.trainerName}</h2>
        <p className="page-subtitle">{report.date} · {report.college} · {report.course} {report.specialization}</p>
      </div>

      {/* Info grid */}
      <div className="settings-card">
        <div className="form-section-title">Session Info</div>
        <div className="form-grid form-grid--3">
          <Field label="College" value={report.college} />
          <Field label="Course" value={report.course} />
          <Field label="Specialization" value={report.specialization} />
          <Field label="Section" value={report.section} />
          <Field label="Year" value={report.year} />
          <Field label="Semester" value={report.semester} />
          <Field label="Duration" value={report.duration} />
          <Field label="Participation Level" value={report.participationLevel} />
          <Field
            label="Attendance"
            value={`${report.studentsPresent} / ${report.totalEnrolled} = ${attendancePct}%`}
          />
        </div>
      </div>

      {/* Section 1: Session Details */}
      <div className="settings-card">
        <div className="form-section-title">1. Session Details</div>
        <div className="form-grid form-grid--3">
          <div className="settings-form__field" style={{ gridColumn: '1 / -1' }}>
            <label className="settings-form__label">Topic Covered</label>
            <div className="settings-form__input" style={{ minHeight: 36, display: 'flex', alignItems: 'center' }}>
              {report.topicCovered || '—'}
            </div>
          </div>
          <Field label="Teaching Methods" value={methodsList} />
        </div>
      </div>

      {/* Section 2: Observations & Feedback */}
      <div className="settings-card">
        <div className="form-section-title">2. Observations & Feedback</div>
        <div className="settings-form__field">
          <label className="settings-form__label">Learning Objectives</label>
          <div className="settings-form__input" style={{ minHeight: 60, padding: '10px 14px', whiteSpace: 'pre-wrap' }}>
            {report.learningObjectives || '—'}
          </div>
        </div>
        <div className="settings-form__field">
          <label className="settings-form__label">Engagement Observations</label>
          <div className="settings-form__input" style={{ minHeight: 60, padding: '10px 14px', whiteSpace: 'pre-wrap' }}>
            {report.engagementObservations || '—'}
          </div>
        </div>
        <div className="settings-form__field">
          <label className="settings-form__label">Challenges (Trainer perspective)</label>
          <div className="settings-form__input" style={{ minHeight: 60, padding: '10px 14px', whiteSpace: 'pre-wrap' }}>
            {report.challengesTrainer || '—'}
          </div>
        </div>
        <div className="settings-form__field">
          <label className="settings-form__label">Challenges (Student perspective)</label>
          <div className="settings-form__input" style={{ minHeight: 60, padding: '10px 14px', whiteSpace: 'pre-wrap' }}>
            {report.challengesStudent || '—'}
          </div>
        </div>
        <div className="settings-form__field">
          <label className="settings-form__label">Action Plan</label>
          <div className="settings-form__input" style={{ minHeight: 60, padding: '10px 14px', whiteSpace: 'pre-wrap' }}>
            {report.actionPlan || '—'}
          </div>
        </div>
        <div className="settings-form__field">
          <label className="settings-form__label">Feedback / Comments</label>
          <div className="settings-form__input" style={{ minHeight: 60, padding: '10px 14px', whiteSpace: 'pre-wrap' }}>
            {report.feedback || '—'}
          </div>
        </div>
        <div className="settings-form__field">
          <label className="settings-form__label">Reviewed By</label>
          <div className="settings-form__input" style={{ minHeight: 36, display: 'flex', alignItems: 'center' }}>
            {report.reviewedBy || '—'}
          </div>
        </div>
      </div>
    </div>
  );
}

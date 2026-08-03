// ==========================================
// DashSheet — Work Report Detail Page
// ==========================================
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { WorkReport } from '../types';

interface Props { reports: WorkReport[]; }

const TH: React.CSSProperties = {
  padding: '6px 10px',
  background: 'var(--bg-card)',
  fontWeight: 600,
  fontSize: 12,
  textAlign: 'left',
  borderBottom: '1px solid var(--border-color)',
  whiteSpace: 'nowrap',
};
const TD: React.CSSProperties = {
  padding: '5px 10px',
  fontSize: 13,
  borderBottom: '1px solid var(--border-color)',
  verticalAlign: 'top',
};

export default function WorkReportDetailPage({ reports }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const report = reports.find(r => r.timestamp === id);

  if (!report) {
    return (
      <div className="settings-page">
        <div className="page-header">
          <h2 className="page-title">Report not found</h2>
        </div>
      </div>
    );
  }

  const em = (v: string | undefined | null) => v || '—';

  return (
    <div className="settings-page">
      <div className="page-header">
        <div style={{ marginBottom: 8 }}>
          <button className="btn btn--ghost btn--sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>
        <h2 className="page-title">Daily Work Report — {report.trainerName}</h2>
        <p className="page-subtitle">{report.date} · {report.department} · Batch: {report.batch}</p>
      </div>

      {/* Section 1: Time Slot Schedule */}
      {(report.timeSlots || []).length > 0 && (
        <div className="settings-card">
          <div className="form-section-title">1. Time Slot Schedule</div>
          <div className="tbl-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={TH}>Time Slot</th>
                  <th style={TH}>Task</th>
                  <th style={TH}>Status</th>
                  <th style={TH}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {(report.timeSlots || []).map((row, i) => (
                  <tr key={i}>
                    <td style={TD}>{em(row.timeSlot)}</td>
                    <td style={TD}>{em(row.task)}</td>
                    <td style={TD}>
                      {row.status ? (
                        <span className={`badge badge--${row.status.toLowerCase()}`}>{row.status}</span>
                      ) : (
                        <span className="badge badge--low">Not Set</span>
                      )}
                    </td>
                    <td style={TD}>{em(row.remarks)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section 2: Key Accomplishments */}
      <div className="settings-card">
        <div className="form-section-title">2. Key Accomplishments</div>
        <div className="settings-form__input" style={{ minHeight: 60, padding: '10px 14px', whiteSpace: 'pre-wrap' }}>
          {report.keyAccomplishments || 'None recorded.'}
        </div>
      </div>

      {/* Section 3: Challenges & Solutions */}
      <div className="settings-card">
        <div className="form-section-title">3. Challenges & Solutions</div>
        <div className="settings-form__input" style={{ minHeight: 60, padding: '10px 14px', whiteSpace: 'pre-wrap' }}>
          {report.challengesSolutions || '—'}
        </div>
      </div>

      {/* Section 4: Pending Work */}
      <div className="settings-card">
        <div className="form-section-title">4. Pending Work</div>
        <div className="settings-form__input" style={{ minHeight: 60, padding: '10px 14px', whiteSpace: 'pre-wrap' }}>
          {report.pendingWork || '—'}
        </div>
      </div>

      {/* Section 5: Additional Notes */}
      <div className="settings-card">
        <div className="form-section-title">5. Additional Notes</div>
        <div className="settings-form__input" style={{ minHeight: 60, padding: '10px 14px', whiteSpace: 'pre-wrap' }}>
          {report.additionalNotes || '—'}
        </div>
      </div>

      {/* Section 6: Placement Drive Updates */}
      {(report.placementDriveUpdate || []).length > 0 && (
        <div className="settings-card">
          <div className="form-section-title">6. Placement Drive Updates</div>
          <div className="tbl-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={TH}>Company</th>
                  <th style={TH}>Profile</th>
                  <th style={TH}>CTC</th>
                  <th style={TH}>Location</th>
                  <th style={TH}>Eligible</th>
                  <th style={TH}>Applied</th>
                  <th style={TH}>Appeared</th>
                  <th style={TH}>Test Status</th>
                  <th style={TH}>Interview Status</th>
                  <th style={TH}>Remark</th>
                </tr>
              </thead>
              <tbody>
                {(report.placementDriveUpdate || []).map((row, i) => (
                  <tr key={i}>
                    <td style={TD}>{em(row.companyName)}</td>
                    <td style={TD}>{em(row.profile)}</td>
                    <td style={TD}>{em(row.ctc)}</td>
                    <td style={TD}>{em(row.location)}</td>
                    <td style={TD}>{em(row.eligibleStudents)}</td>
                    <td style={TD}>{em(row.applied)}</td>
                    <td style={TD}>{em(row.appear)}</td>
                    <td style={TD}>{em(row.testStatus)}</td>
                    <td style={TD}>{em(row.interviewStatus)}</td>
                    <td style={TD}>{em(row.remark)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section 7: Internship Coordination */}
      {(report.internshipCoordination || []).length > 0 && (
        <div className="settings-card">
          <div className="form-section-title">7. Internship Coordination</div>
          <div className="tbl-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={TH}>Activity</th>
                  <th style={TH}>Batch / Dept</th>
                  <th style={TH}>Students</th>
                  <th style={TH}>Trainer / Company</th>
                  <th style={TH}>Status</th>
                  <th style={TH}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {(report.internshipCoordination || []).map((row, i) => (
                  <tr key={i}>
                    <td style={TD}>{em(row.activity)}</td>
                    <td style={TD}>{em(row.batchDept)}</td>
                    <td style={TD}>{em(row.noStudents)}</td>
                    <td style={TD}>{em(row.trainerCompany)}</td>
                    <td style={TD}>{em(row.status)}</td>
                    <td style={TD}>{em(row.remarks)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

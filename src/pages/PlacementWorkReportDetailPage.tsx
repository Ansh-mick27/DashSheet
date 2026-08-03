// ==========================================
// DashSheet — Placement Work Report Detail Page
// ==========================================
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  PlacementWorkReport,
} from '../types';

interface Props { reports: PlacementWorkReport[]; }

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

export default function PlacementWorkReportDetailPage({ reports }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const report = reports.find(r => encodeURIComponent(r.id ?? r.timestamp) === id);

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
        <h2 className="page-title">Placement Daily Report — {report.staffName}</h2>
        <p className="page-subtitle">{report.date} · {report.department}</p>
      </div>

      {/* Summary stats */}
      <div className="stats-grid">
        <div className="settings-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>{report.totalCompaniesContacted}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Companies Contacted</div>
        </div>
        <div className="settings-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>{report.newCompaniesApproached}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>New Approached</div>
        </div>
        <div className="settings-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>{report.totalStudentsInteracted}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Students Interacted</div>
        </div>
        <div className="settings-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>{report.confirmedOpportunities}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Confirmed Drives</div>
        </div>
      </div>

      {/* Section 1: Work Log */}
      {(report.workLog || []).length > 0 && (
        <div className="settings-card">
          <div className="form-section-title">1. Work Log</div>
          <div className="tbl-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={TH}>Time Slot</th>
                  <th style={TH}>Activity</th>
                  <th style={TH}>Status</th>
                  <th style={TH}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {(report.workLog || []).map((row, i) => (
                  <tr key={i}>
                    <td style={TD}>{em(row.timeSlot)}</td>
                    <td style={TD}>{em(row.activity)}</td>
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

      {/* Section 2: Company Engagement */}
      <div className="settings-card">
        <div className="form-section-title">2. Company Engagement</div>
        {(report.companyEngagement || []).length > 0 ? (
          <div className="tbl-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={TH}>Company</th>
                  <th style={TH}>HR Contact</th>
                  <th style={TH}>Location</th>
                  <th style={TH}>Purpose</th>
                  <th style={TH}>Mode</th>
                  <th style={TH}>Outcome</th>
                  <th style={TH}>Remark</th>
                </tr>
              </thead>
              <tbody>
                {(report.companyEngagement || []).map((row, i) => (
                  <tr key={i}>
                    <td style={TD}>{em(row.companyName)}</td>
                    <td style={TD}>{em(row.hrContact)}</td>
                    <td style={TD}>{em(row.location)}</td>
                    <td style={TD}>{em(row.purpose)}</td>
                    <td style={TD}>{em(row.mode)}</td>
                    <td style={TD}>{em(row.outcome)}</td>
                    <td style={TD}>{em(row.remark)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No company engagement logged.</p>
        )}
      </div>

      {/* Section 3: Student Engagement */}
      <div className="settings-card">
        <div className="form-section-title">3. Student Engagement</div>
        {(report.studentEngagement || []).length > 0 ? (
          <div className="tbl-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={TH}>Student Name</th>
                  <th style={TH}>Purpose</th>
                  <th style={TH}>Issue Identified</th>
                  <th style={TH}>Action Taken</th>
                  <th style={TH}>Status</th>
                </tr>
              </thead>
              <tbody>
                {(report.studentEngagement || []).map((row, i) => (
                  <tr key={i}>
                    <td style={TD}>{em(row.studentName)}</td>
                    <td style={TD}>{em(row.purpose)}</td>
                    <td style={TD}>{em(row.issueIdentified)}</td>
                    <td style={TD}>{em(row.actionTaken)}</td>
                    <td style={TD}>{em(row.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No student engagement logged.</p>
        )}
      </div>

      {/* Section 4: Placement Drive Updates */}
      <div className="settings-card">
        <div className="form-section-title">4. Placement Drive Updates</div>
        {(report.placementDriveUpdate || []).length > 0 ? (
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
        ) : (
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No drive updates.</p>
        )}
      </div>

      {/* Section 5: Internship Coordination */}
      <div className="settings-card">
        <div className="form-section-title">5. Internship Coordination</div>
        {(report.internshipCoordination || []).length > 0 ? (
          <div className="tbl-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={TH}>Activity</th>
                  <th style={TH}>Batch / Dept</th>
                  <th style={TH}>No. Students</th>
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
        ) : (
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No internship coordination.</p>
        )}
      </div>

      {/* Section 6: Achievements */}
      <div className="settings-card">
        <div className="form-section-title">6. Achievements</div>
        {(report.achievements || []).length > 0 ? (
          <ul style={{ margin: '8px 0 0 18px', padding: 0, fontSize: 14, lineHeight: '1.7' }}>
            {(report.achievements || []).map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        ) : (
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No achievements logged.</p>
        )}
      </div>

      {/* Section 7: Pending Work */}
      <div className="settings-card">
        <div className="form-section-title">7. Pending Work</div>
        {(report.pendingWork || []).length > 0 ? (
          <div className="tbl-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={TH}>Pending Task</th>
                  <th style={TH}>Person Concerned</th>
                  <th style={TH}>Target Date</th>
                  <th style={TH}>Priority</th>
                </tr>
              </thead>
              <tbody>
                {(report.pendingWork || []).map((row, i) => (
                  <tr key={i}>
                    <td style={TD}>{em(row.pendingTask)}</td>
                    <td style={TD}>{em(row.personConcerned)}</td>
                    <td style={TD}>{em(row.targetDate)}</td>
                    <td style={TD}>{em(row.priority)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No pending work.</p>
        )}
      </div>
    </div>
  );
}

// ==========================================
// DashSheet — Office Admin Daily Report Detail Page
// ==========================================
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  OfficeAdminDailyReport,
} from '../types';

interface Props { reports: OfficeAdminDailyReport[]; }

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

export default function OfficeDailyReportDetailPage({ reports }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const report = reports.find(r => (r.id ?? r.timestamp) === id);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <button className="btn btn--ghost btn--sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Back
          </button>
          {report.hasCampusDay && <span className="badge badge--high">Campus Day</span>}
        </div>
        <h2 className="page-title">Office Admin Daily Report — {report.staffName}</h2>
        <p className="page-subtitle">{report.date} · {report.department}</p>
      </div>

      {/* Section 1: Time Slot Task Log */}
      {(report.timeSlotLog || []).length > 0 && (
        <div className="settings-card">
          <div className="form-section-title">1. Time Slot Task Log</div>
          <div className="tbl-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={TH}>Time Slot</th>
                  <th style={TH}>Task / Activity</th>
                  <th style={TH}>Related Area</th>
                  <th style={TH}>Status</th>
                  <th style={TH}>Remark</th>
                </tr>
              </thead>
              <tbody>
                {(report.timeSlotLog || []).map((row, i) => (
                  <tr key={i}>
                    <td style={TD}>{em(row.timeSlot)}</td>
                    <td style={TD}>{row.taskActivity?.join(', ') || '—'}</td>
                    <td style={TD}>{em(row.relatedArea)}</td>
                    <td style={TD}>{em(row.status)}</td>
                    <td style={TD}>{em(row.remark)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section 2: Key Work Completed */}
      <div className="settings-card">
        <div className="form-section-title">2. Key Work Completed</div>
        {(report.keyWorkCompleted || []).length > 0 ? (
          <ul style={{ margin: '8px 0 0 18px', padding: 0, fontSize: 14, lineHeight: '1.7' }}>
            {(report.keyWorkCompleted || []).map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        ) : (
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>None logged.</p>
        )}
      </div>

      {/* Section 3: Student Data Support */}
      {(report.studentSupport || []).length > 0 && (
        <div className="settings-card">
          <div className="form-section-title">3. Student Data Support</div>
          <div className="tbl-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={TH}>Particular</th>
                  <th style={TH}>Count / Status</th>
                  <th style={TH}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {(report.studentSupport || []).map((row, i) => (
                  <tr key={i}>
                    <td style={TD}>{em(row.particular)}</td>
                    <td style={TD}>{em(row.countStatus)}</td>
                    <td style={TD}>{em(row.remarks)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section 4: Housekeeping */}
      {(report.housekeeping || []).length > 0 && (
        <div className="settings-card">
          <div className="form-section-title">4. Housekeeping</div>
          <div className="tbl-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={TH}>Area</th>
                  <th style={TH}>Status</th>
                  <th style={TH}>Issue Found</th>
                  <th style={TH}>Action Taken</th>
                  <th style={TH}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {(report.housekeeping || []).map((row, i) => (
                  <tr key={i}>
                    <td style={TD}>{em(row.area)}</td>
                    <td style={TD}>{em(row.status)}</td>
                    <td style={TD}>{em(row.issueFound)}</td>
                    <td style={TD}>{em(row.actionTaken)}</td>
                    <td style={TD}>{em(row.remarks)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section 5: File & Documentation */}
      {(report.fileDocumentation || []).length > 0 && (
        <div className="settings-card">
          <div className="form-section-title">5. File & Documentation</div>
          <div className="tbl-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={TH}>File Type</th>
                  <th style={TH}>Purpose</th>
                  <th style={TH}>Prepared / Updated</th>
                  <th style={TH}>Physical File</th>
                  <th style={TH}>Digital Folder</th>
                  <th style={TH}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {(report.fileDocumentation || []).map((row, i) => (
                  <tr key={i}>
                    <td style={TD}>{em(row.fileType)}</td>
                    <td style={TD}>{em(row.purpose)}</td>
                    <td style={TD}>{em(row.preparedUpdated)}</td>
                    <td style={TD}>{em(row.physicalFile)}</td>
                    <td style={TD}>{em(row.digitalFolder)}</td>
                    <td style={TD}>{em(row.remarks)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section 6: Infrastructure */}
      {(report.infrastructure || []).length > 0 && (
        <div className="settings-card">
          <div className="form-section-title">6. Infrastructure</div>
          <div className="tbl-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={TH}>Utility</th>
                  <th style={TH}>Location</th>
                  <th style={TH}>Status</th>
                  <th style={TH}>Issue Found</th>
                  <th style={TH}>Action Taken</th>
                </tr>
              </thead>
              <tbody>
                {(report.infrastructure || []).map((row, i) => (
                  <tr key={i}>
                    <td style={TD}>{em(row.utility)}</td>
                    <td style={TD}>{em(row.location)}</td>
                    <td style={TD}>{em(row.status)}</td>
                    <td style={TD}>{em(row.issueFound)}</td>
                    <td style={TD}>{em(row.actionTaken)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section 7: MIS & Records */}
      {(report.misRecords || []).length > 0 && (
        <div className="settings-card">
          <div className="form-section-title">7. MIS & Records</div>
          <div className="tbl-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={TH}>Record Type</th>
                  <th style={TH}>Updated</th>
                  <th style={TH}>Pending</th>
                  <th style={TH}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {(report.misRecords || []).map((row, i) => (
                  <tr key={i}>
                    <td style={TD}>{em(row.recordType)}</td>
                    <td style={TD}>{em(row.updated)}</td>
                    <td style={TD}>{em(row.pending)}</td>
                    <td style={TD}>{em(row.remarks)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section 8: Issues Reported */}
      <div className="settings-card">
        <div className="form-section-title">8. Issues Reported</div>
        {(report.issues || []).length > 0 ? (
          <div className="tbl-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={TH}>Issue</th>
                  <th style={TH}>Related Area</th>
                  <th style={TH}>Reported To</th>
                  <th style={TH}>Priority</th>
                  <th style={TH}>Action Required</th>
                </tr>
              </thead>
              <tbody>
                {(report.issues || []).map((row, i) => (
                  <tr key={i}>
                    <td style={TD}>{em(row.issue)}</td>
                    <td style={TD}>{em(row.relatedArea)}</td>
                    <td style={TD}>{em(row.reportedTo)}</td>
                    <td style={TD}>{em(row.priority)}</td>
                    <td style={TD}>{em(row.actionRequired)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No issues reported.</p>
        )}
      </div>

      {/* Section 9: Pending Work */}
      <div className="settings-card">
        <div className="form-section-title">9. Pending Work</div>
        {(report.pendingWork || []).length > 0 ? (
          <div className="tbl-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={TH}>Pending Task</th>
                  <th style={TH}>Concerned Person</th>
                  <th style={TH}>Target Date</th>
                  <th style={TH}>Priority</th>
                </tr>
              </thead>
              <tbody>
                {(report.pendingWork || []).map((row, i) => (
                  <tr key={i}>
                    <td style={TD}>{em(row.pendingTask)}</td>
                    <td style={TD}>{em(row.concernedPerson)}</td>
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

      {/* Campus Day Sections */}
      {report.hasCampusDay && (
        <>
          {/* Section 10: Campus Process */}
          {(report.campusProcess || []).length > 0 && (
            <div className="settings-card">
              <div className="form-section-title">10. Campus Process</div>
              <div className="tbl-scroll">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={TH}>Process</th>
                      <th style={TH}>Venue</th>
                      <th style={TH}>Support Provided</th>
                      <th style={TH}>Students / Guests</th>
                      <th style={TH}>Status</th>
                      <th style={TH}>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(report.campusProcess || []).map((row, i) => (
                      <tr key={i}>
                        <td style={TD}>{em(row.process)}</td>
                        <td style={TD}>{em(row.venue)}</td>
                        <td style={TD}>{em(row.supportProvided)}</td>
                        <td style={TD}>{em(row.noOfStudentsGuests)}</td>
                        <td style={TD}>{em(row.status)}</td>
                        <td style={TD}>{em(row.remarks)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 11: IT Peripherals */}
          {(report.itPeripherals || []).length > 0 && (
            <div className="settings-card">
              <div className="form-section-title">11. IT Peripherals</div>
              <div className="tbl-scroll">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={TH}>Equipment</th>
                      <th style={TH}>Location</th>
                      <th style={TH}>Working Status</th>
                      <th style={TH}>Issue Reported</th>
                      <th style={TH}>Action Taken</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(report.itPeripherals || []).map((row, i) => (
                      <tr key={i}>
                        <td style={TD}>{em(row.equipment)}</td>
                        <td style={TD}>{em(row.location)}</td>
                        <td style={TD}>{em(row.workingStatus)}</td>
                        <td style={TD}>{em(row.issueReported)}</td>
                        <td style={TD}>{em(row.actionTaken)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

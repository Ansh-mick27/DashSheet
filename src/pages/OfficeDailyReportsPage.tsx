// ==========================================
// DashSheet — Office Admin Daily Reports Admin View
// ==========================================
import { useMemo } from 'react';
import { ClipboardList } from 'lucide-react';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import { OfficeAdminDailyReport } from '../types';

interface OfficeDailyReportsPageProps {
  reports: OfficeAdminDailyReport[];
}

export default function OfficeDailyReportsPage({ reports }: OfficeDailyReportsPageProps) {
  const columns = useMemo(() => [
    { key: 'staffName', header: 'Staff Name', sortable: true, width: '140px' },
    { key: 'date', header: 'Date', sortable: true, width: '100px' },
    { key: 'department', header: 'Department', sortable: true, width: '180px' },
    {
      key: 'hasCampusDay',
      header: 'Campus Day',
      sortable: true,
      width: '100px',
      render: (r: OfficeAdminDailyReport) => r.hasCampusDay ? 'Yes' : 'No',
    },
    {
      key: 'keyWorkCompleted',
      header: 'Key Work',
      width: '260px',
      render: (r: OfficeAdminDailyReport) => {
        const first = r.keyWorkCompleted?.[0] ?? '';
        return first ? (first.length > 60 ? first.slice(0, 60) + '…' : first) : '—';
      },
    },
  ], []);

  if (reports.length === 0) {
    return (
      <div className="settings-page">
        <div className="page-header">
          <h2 className="page-title">Office Admin Daily Reports</h2>
          <p className="page-subtitle">Daily task reports from Office Admin staff</p>
        </div>
        <EmptyState
          icon={ClipboardList}
          title="No office admin daily reports yet"
          description="Office Admin staff can submit daily task reports via the Member Portal."
        />
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <h2 className="page-title">Office Admin Daily Reports</h2>
        <p className="page-subtitle">{reports.length} report{reports.length !== 1 ? 's' : ''} submitted</p>
      </div>

      <div className="settings-card" style={{ padding: 0 }}>
        <DataTable
          columns={columns}
          data={reports}
          rowKey={(r, i) => r.id ?? String(i)}
          pageSize={15}
          exportFilename="office_admin_daily_reports"
          emptyMessage="No reports found"
        />
      </div>
    </div>
  );
}

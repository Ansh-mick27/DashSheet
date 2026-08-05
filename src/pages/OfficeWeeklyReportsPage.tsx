// ==========================================
// DashSheet — Office Admin Weekly Reports Admin View
// ==========================================
import { useState } from 'react';
import { ClipboardList, Trash2 } from 'lucide-react';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import { OfficeAdminWeeklyReport } from '../types';
import { deleteOfficeWeeklyReport } from '../services/dataApi';

interface OfficeWeeklyReportsPageProps {
  reports: OfficeAdminWeeklyReport[];
  isSuperAdmin?: boolean;
  onDelete?: (id: string) => void;
}

export default function OfficeWeeklyReportsPage({ reports, isSuperAdmin, onDelete }: OfficeWeeklyReportsPageProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this report permanently? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await deleteOfficeWeeklyReport(id);
      onDelete?.(id);
    } catch {
      alert('Failed to delete report. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const columns = [
    ...(isSuperAdmin ? [{
      key: '_delete', header: '', width: '40px',
      render: (r: OfficeAdminWeeklyReport) => (
        <button
          className="btn btn--ghost btn--sm"
          style={{ color: '#ef4444', display: 'inline-flex', alignItems: 'center' }}
          disabled={deleting === (r.id ?? r.timestamp)}
          onClick={() => handleDelete(r.id ?? r.timestamp)}
          title="Delete permanently"
        >
          <Trash2 size={14} />
        </button>
      )
    }] : []),
    { key: 'staffName', header: 'Staff Name', sortable: true, width: '140px' },
    { key: 'date', header: 'Date', sortable: true, width: '100px' },
    { key: 'department', header: 'Department', sortable: true, width: '200px' },
  ];

  if (reports.length === 0) {
    return (
      <div className="settings-page">
        <div className="page-header">
          <h2 className="page-title">Office Admin Weekly Reports</h2>
          <p className="page-subtitle">Weekly reports from Office Admin staff</p>
        </div>
        <EmptyState
          icon={ClipboardList}
          title="No office admin weekly reports yet"
          description="Office Admin staff can submit weekly reports via the Member Portal."
        />
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <h2 className="page-title">Office Admin Weekly Reports</h2>
        <p className="page-subtitle">{reports.length} report{reports.length !== 1 ? 's' : ''} submitted</p>
      </div>

      <div className="settings-card" style={{ padding: 0 }}>
        <DataTable
          columns={columns}
          data={reports}
          rowKey={(r, i) => r.id ?? String(i)}
          pageSize={15}
          exportFilename="office_admin_weekly_reports"
          emptyMessage="No reports found"
        />
      </div>
    </div>
  );
}

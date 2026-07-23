// ==========================================
// DashSheet — Placement Work Reports Admin View
// ==========================================
import { useMemo } from 'react';
import { ClipboardList } from 'lucide-react';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import { PlacementWorkReport } from '../types';

interface PlacementWorkReportsPageProps {
  reports: PlacementWorkReport[];
}

export default function PlacementWorkReportsPage({ reports }: PlacementWorkReportsPageProps) {
  const columns = useMemo(() => [
    { key: 'staffName', header: 'Staff Name', sortable: true, width: '140px' },
    { key: 'date', header: 'Date', sortable: true, width: '100px' },
    { key: 'department', header: 'Department', sortable: true, width: '140px' },
    { key: 'reportingTo', header: 'Reporting To', sortable: true, width: '130px' },
    {
      key: 'totalCompaniesContacted',
      header: 'Companies',
      sortable: true,
      width: '90px',
      render: (r: PlacementWorkReport) => r.totalCompaniesContacted || '—',
    },
    {
      key: 'totalStudentsInteracted',
      header: 'Students',
      sortable: true,
      width: '90px',
      render: (r: PlacementWorkReport) => r.totalStudentsInteracted || '—',
    },
    {
      key: 'confirmedOpportunities',
      header: 'Confirmed Drives',
      sortable: true,
      width: '110px',
      render: (r: PlacementWorkReport) => r.confirmedOpportunities || '—',
    },
    {
      key: 'achievement1',
      header: 'Key Achievement',
      width: '220px',
      render: (r: PlacementWorkReport) => r.achievement1
        ? (r.achievement1.length > 60 ? r.achievement1.slice(0, 60) + '…' : r.achievement1)
        : '—',
    },
  ], []);

  if (reports.length === 0) {
    return (
      <div className="settings-page">
        <div className="page-header">
          <h2 className="page-title">Placement Work Reports</h2>
          <p className="page-subtitle">Daily task reports submitted by Placement Officers</p>
        </div>
        <EmptyState
          icon={ClipboardList}
          title="No placement work reports yet"
          description="Placement Officers can submit daily task reports via the Member Portal."
        />
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <h2 className="page-title">Placement Work Reports</h2>
        <p className="page-subtitle">{reports.length} report{reports.length !== 1 ? 's' : ''} submitted</p>
      </div>

      <div className="settings-card" style={{ padding: 0 }}>
        <DataTable
          columns={columns}
          data={reports}
          rowKey={(r, i) => r.id ?? String(i)}
          pageSize={15}
          exportFilename="placement_work_reports"
          emptyMessage="No reports found"
        />
      </div>
    </div>
  );
}

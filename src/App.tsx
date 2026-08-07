// ==========================================
// DashSheet — Main Application
// ==========================================
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import FilterBar from './components/FilterBar';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { DashboardSkeleton } from './components/Skeleton';
import LoginPage from './pages/LoginPage';
import OverviewPage from './pages/OverviewPage';
import TrainingReportsPage from './pages/TrainingReportsPage';
import WorkReportsPage from './pages/WorkReportsPage';
import MembersPage from './pages/MembersPage';
import MemberDetailPage from './pages/MemberDetailPage';
import SettingsPage from './pages/SettingsPage';
import SuperAdminPage from './pages/SuperAdminPage';
import OfficeAdminPage from './pages/OfficeAdminPage';
import PlacementPage from './pages/PlacementPage';
import PortalHomePage from './pages/portal/PortalHomePage';
import TrainingReportFormPage from './pages/portal/TrainingReportFormPage';
import WorkReportFormPage from './pages/portal/WorkReportFormPage';
import InventoryReportFormPage from './pages/portal/InventoryReportFormPage';
import PlacementReportFormPage from './pages/portal/PlacementReportFormPage';
import PlacementWorkReportFormPage from './pages/portal/PlacementWorkReportFormPage';
import PlacementWorkReportsPage from './pages/PlacementWorkReportsPage';
import OfficeAdminDailyReportFormPage from './pages/portal/OfficeAdminDailyReportFormPage';
import OfficeAdminWeeklyReportFormPage from './pages/portal/OfficeAdminWeeklyReportFormPage';
import OfficeDailyReportsPage from './pages/OfficeDailyReportsPage';
import OfficeWeeklyReportsPage from './pages/OfficeWeeklyReportsPage';
import InventoryStockPage from './pages/InventoryStockPage';
import OfficeDailyReportDetailPage from './pages/OfficeDailyReportDetailPage';
import PlacementWorkReportDetailPage from './pages/PlacementWorkReportDetailPage';
import TrainingReportDetailPage from './pages/TrainingReportDetailPage';
import WorkReportDetailPage from './pages/WorkReportDetailPage';
import { useAuth } from './contexts/AuthContext';
import { fetchSheetData, refreshData, parseDate, generateNotifications, fetchOfficeAdminDailyReports, fetchOfficeAdminWeeklyReports, fetchInventoryStock, deleteTrainingReport, deleteWorkReport, deleteOfficeAdminReport, deletePlacementReport, deletePlacementWorkReport, deleteOfficeDailyReport, deleteOfficeWeeklyReport } from './services/dataApi';
import { getAdminAccess } from './config/adminAccess';
import {
  Member, TrainingReport, WorkReport, OfficeAdminReport,
  PlacementReport, PlacementWorkReport, DashboardFilters, Notification, BranchStudentCount,
  OfficeAdminDailyReport, OfficeAdminWeeklyReport, InventoryStock
} from './types';

function DashboardLayout() {
  const { member } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [trainingReports, setTrainingReports] = useState<TrainingReport[]>([]);
  const [workReports, setWorkReports] = useState<WorkReport[]>([]);
  const [officeAdminReports, setOfficeAdminReports] = useState<OfficeAdminReport[]>([]);
  const [placementReports, setPlacementReports] = useState<PlacementReport[]>([]);
  const [placementWorkReports, setPlacementWorkReports] = useState<PlacementWorkReport[]>([]);
  const [officeDailyReports, setOfficeDailyReports] = useState<OfficeAdminDailyReport[]>([]);
  const [officeWeeklyReports, setOfficeWeeklyReports] = useState<OfficeAdminWeeklyReport[]>([]);
  const [branchStudentCounts, setBranchStudentCounts] = useState<BranchStudentCount[]>([]);
  const [inventoryStock, setInventoryStock] = useState<InventoryStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [autoRefreshMins, setAutoRefreshMins] = useState(0);
  const autoRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [filters, setFilters] = useState<DashboardFilters>({
    trainer: '', dateFrom: '', dateTo: '', batch: '', department: '', role: ''
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [data, officeDailyData, officeWeeklyData, stockData] = await Promise.all([
        fetchSheetData(),
        fetchOfficeAdminDailyReports().catch(() => [] as OfficeAdminDailyReport[]),
        fetchOfficeAdminWeeklyReports().catch(() => [] as OfficeAdminWeeklyReport[]),
        fetchInventoryStock().catch(() => [] as InventoryStock[]),
      ]);
      setMembers(data.members);
      setTrainingReports(data.trainingReports);
      setWorkReports(data.workReports);
      setOfficeAdminReports(data.officeAdminReports);
      setPlacementReports(data.placementReports);
      setPlacementWorkReports(data.placementWorkReports);
      setBranchStudentCounts(data.branchStudentCounts);
      setOfficeDailyReports(officeDailyData);
      setOfficeWeeklyReports(officeWeeklyData);
      setInventoryStock(stockData);
      setNotifications(generateNotifications(data.workReports, data.trainingReports));
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Auto-refresh polling
  useEffect(() => {
    if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
    if (autoRefreshMins > 0) {
      autoRefreshRef.current = setInterval(() => {
        refreshData();
        loadData();
      }, autoRefreshMins * 60 * 1000);
    }
    return () => { if (autoRefreshRef.current) clearInterval(autoRefreshRef.current); };
  }, [autoRefreshMins, loadData]);

  const handleRefresh = useCallback(() => {
    refreshData();
    loadData();
  }, [loadData]);

  // Per-admin access config
  const accessConfig = useMemo(() => {
    if (!member || member.role === 'SuperAdmin') return null;
    return getAdminAccess(member.name);
  }, [member]);

  const isSuperAdmin = member?.role === 'SuperAdmin';

  // Members visible to the logged-in admin (used for filtering all report data)
  const accessVisibleMembers = useMemo(() => {
    if (!member || member.role === 'SuperAdmin') return members;
    if (!accessConfig) {
      // Default Admin: all except SuperAdmin
      return members.filter(m => m.role !== 'SuperAdmin');
    }
    const included = new Set((accessConfig.includedMembers || []).map(n => n.toLowerCase()));
    const excluded = new Set((accessConfig.excludedMembers || []).map(n => n.toLowerCase()));
    return members.filter(m => {
      const nameLow = m.name.toLowerCase();
      if (excluded.has(nameLow)) return false;
      if (included.has(nameLow)) return true;
      if (!(accessConfig.visibleRoles as string[]).includes(m.role)) return false;
      if (accessConfig.visibleDepartments?.length) {
        if (!accessConfig.visibleDepartments.includes(m.department)) return false;
      }
      return true;
    });
  }, [members, member, accessConfig]);

  const accessVisibleNames = useMemo(
    () => new Set(accessVisibleMembers.map(m => m.name)),
    [accessVisibleMembers]
  );

  // Filter helpers
  const inDateRange = useCallback((dateStr: string) => {
    if (!filters.dateFrom && !filters.dateTo) return true;
    try {
      const d = parseDate(dateStr);
      if (filters.dateFrom && d < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && d > new Date(filters.dateTo)) return false;
    } catch { return false; }
    return true;
  }, [filters.dateFrom, filters.dateTo]);

  const filteredTraining = useMemo(() => {
    return trainingReports.filter(r => {
      if (!accessVisibleNames.has(r.trainerName)) return false;
      if (filters.trainer && r.trainerName !== filters.trainer) return false;
      if (!inDateRange(r.date)) return false;
      return true;
    });
  }, [trainingReports, filters, inDateRange, accessVisibleNames]);

  const filteredWork = useMemo(() => {
    return workReports.filter(r => {
      if (!accessVisibleNames.has(r.trainerName)) return false;
      if (filters.trainer && r.trainerName !== filters.trainer) return false;
      if (filters.batch && r.batch !== filters.batch) return false;
      if (filters.department && r.department !== filters.department) return false;
      if (!inDateRange(r.date)) return false;
      return true;
    });
  }, [workReports, filters, inDateRange, accessVisibleNames]);

  const filteredMembers = useMemo(() => {
    return accessVisibleMembers.filter(m => {
      if (filters.department && m.department !== filters.department) return false;
      if (filters.batch && m.batch !== filters.batch) return false;
      if (filters.role && m.role !== filters.role) return false;
      return true;
    });
  }, [accessVisibleMembers, filters]);

  const filteredOfficeAdmin = useMemo(() => {
    return officeAdminReports.filter(r => {
      if (!accessVisibleNames.has(r.staffName)) return false;
      if (filters.trainer && r.staffName !== filters.trainer) return false;
      if (!inDateRange(r.date)) return false;
      return true;
    });
  }, [officeAdminReports, filters, inDateRange, accessVisibleNames]);

  const filteredPlacement = useMemo(() => {
    return placementReports.filter(r => {
      if (!accessVisibleNames.has(r.staffName)) return false;
      if (filters.trainer && r.staffName !== filters.trainer) return false;
      if (!inDateRange(r.dateOfFirstContact)) return false;
      return true;
    });
  }, [placementReports, filters, inDateRange, accessVisibleNames]);

  const filteredPlacementWork = useMemo(() => {
    return placementWorkReports.filter(r => accessVisibleNames.has(r.staffName));
  }, [placementWorkReports, accessVisibleNames]);

  const filteredOfficeDaily = useMemo(() => {
    return officeDailyReports.filter(r => accessVisibleNames.has(r.staffName));
  }, [officeDailyReports, accessVisibleNames]);

  const filteredOfficeWeekly = useMemo(() => {
    return officeWeeklyReports.filter(r => accessVisibleNames.has(r.staffName));
  }, [officeWeeklyReports, accessVisibleNames]);

  const handleDeleteTraining = useCallback((timestamp: string) => {
    setTrainingReports(prev => prev.filter(r => r.timestamp !== timestamp));
  }, []);

  const handleDeleteWork = useCallback((timestamp: string) => {
    setWorkReports(prev => prev.filter(r => r.timestamp !== timestamp));
  }, []);

  const handleDeleteOfficeAdmin = useCallback((timestamp: string) => {
    setOfficeAdminReports(prev => prev.filter(r => r.timestamp !== timestamp));
  }, []);

  const handleDeletePlacement = useCallback((timestamp: string) => {
    setPlacementReports(prev => prev.filter(r => r.timestamp !== timestamp));
  }, []);

  const handleDeletePlacementWork = useCallback((id: string) => {
    setPlacementWorkReports(prev => prev.filter(r => r.id !== id));
  }, []);

  const handleDeleteOfficeDaily = useCallback((id: string) => {
    setOfficeDailyReports(prev => prev.filter(r => r.id !== id));
  }, []);

  const handleDeleteOfficeWeekly = useCallback((id: string) => {
    setOfficeWeeklyReports(prev => prev.filter(r => r.id !== id));
  }, []);

  if (loading) {
    return (
      <div className="dashboard-layout">
        <aside className="sidebar"><div className="sidebar__header" /></aside>
        <main className="dashboard-main">
          <div className="dashboard-content">
            <DashboardSkeleton />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        {(member?.role === 'Admin' || member?.role === 'SuperAdmin') && (
          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            members={accessVisibleMembers}
            onRefresh={handleRefresh}
            notifications={notifications}
            autoRefreshInterval={autoRefreshMins}
            onAutoRefreshChange={setAutoRefreshMins}
          />
        )}
        <div className="dashboard-content">
          <Routes>
            <Route path="/" element={
              member?.role !== 'Admin' && member?.role !== 'SuperAdmin' ? (
                <Navigate to="/portal" replace />
              ) : (
                <ErrorBoundary>
                  <OverviewPage
                    trainingReports={filteredTraining}
                    workReports={filteredWork}
                    members={filteredMembers}
                    officeAdminReports={filteredOfficeAdmin}
                    placementReports={filteredPlacement}
                  />
                </ErrorBoundary>
              )
            } />
            <Route path="/portal" element={
              <ErrorBoundary><PortalHomePage /></ErrorBoundary>
            } />
            <Route path="/portal/training" element={
              <ErrorBoundary><TrainingReportFormPage branchStudentCounts={branchStudentCounts} /></ErrorBoundary>
            } />
            <Route path="/portal/work" element={
              <ErrorBoundary><WorkReportFormPage /></ErrorBoundary>
            } />
            <Route path="/portal/inventory" element={
              <ErrorBoundary><InventoryReportFormPage members={members} /></ErrorBoundary>
            } />
            <Route path="/portal/placement" element={
              <ErrorBoundary><PlacementReportFormPage /></ErrorBoundary>
            } />
            <Route path="/portal/placement-work" element={
              <ErrorBoundary><PlacementWorkReportFormPage /></ErrorBoundary>
            } />
            <Route path="/portal/office-daily" element={
              <ErrorBoundary><OfficeAdminDailyReportFormPage /></ErrorBoundary>
            } />
            <Route path="/portal/office-weekly" element={
              <ErrorBoundary><OfficeAdminWeeklyReportFormPage /></ErrorBoundary>
            } />
            <Route path="/portal/inventory-stock" element={
              <ErrorBoundary><InventoryStockPage reports={filteredOfficeAdmin} memberName={member?.name} /></ErrorBoundary>
            } />
            <Route path="/admin/work-report" element={
              member?.role !== 'SuperAdmin' ? <Navigate to="/" replace /> : (
                <ErrorBoundary><WorkReportFormPage adminMembers={members} /></ErrorBoundary>
              )
            } />
            <Route path="/admin/placement-work-report" element={
              member?.role !== 'SuperAdmin' ? <Navigate to="/" replace /> : (
                <ErrorBoundary><PlacementWorkReportFormPage adminMembers={members} /></ErrorBoundary>
              )
            } />
            <Route path="/admin/office-daily-report" element={
              member?.role !== 'SuperAdmin' ? <Navigate to="/" replace /> :
              <ErrorBoundary><OfficeAdminDailyReportFormPage adminMembers={members} /></ErrorBoundary>
            } />
            <Route path="/admin/office-weekly-report" element={
              member?.role !== 'SuperAdmin' ? <Navigate to="/" replace /> :
              <ErrorBoundary><OfficeAdminWeeklyReportFormPage adminMembers={members} /></ErrorBoundary>
            } />
            <Route path="/training" element={
              <ErrorBoundary><TrainingReportsPage reports={filteredTraining} isSuperAdmin={isSuperAdmin} onDelete={handleDeleteTraining} /></ErrorBoundary>
            } />
            <Route path="/training/:id" element={
              <ErrorBoundary><TrainingReportDetailPage reports={trainingReports} /></ErrorBoundary>
            } />
            <Route path="/work" element={
              <ErrorBoundary><WorkReportsPage reports={filteredWork} isSuperAdmin={isSuperAdmin} onDelete={handleDeleteWork} /></ErrorBoundary>
            } />
            <Route path="/work/:id" element={
              <ErrorBoundary><WorkReportDetailPage reports={workReports} /></ErrorBoundary>
            } />
            <Route path="/members" element={
              <ErrorBoundary>
                <MembersPage
                  members={filteredMembers}
                  trainingReports={filteredTraining}
                  workReports={filteredWork}
                  officeAdminReports={filteredOfficeAdmin}
                  placementReports={filteredPlacement}
                />
              </ErrorBoundary>
            } />
            <Route path="/member/:name" element={
              <ErrorBoundary>
                <MemberDetailPage
                  members={members}
                  trainingReports={trainingReports}
                  workReports={workReports}
                  officeAdminReports={officeAdminReports}
                  placementReports={placementReports}
                  placementWorkReports={placementWorkReports}
                  officeDailyReports={officeDailyReports}
                  officeWeeklyReports={officeWeeklyReports}
                />
              </ErrorBoundary>
            } />
            <Route path="/inventory" element={
              <ErrorBoundary><OfficeAdminPage reports={filteredOfficeAdmin} isSuperAdmin={isSuperAdmin} onDelete={handleDeleteOfficeAdmin} /></ErrorBoundary>
            } />
            <Route path="/inventory-stock" element={
              <ErrorBoundary><InventoryStockPage reports={filteredOfficeAdmin} /></ErrorBoundary>
            } />
            <Route path="/placement" element={
              <ErrorBoundary><PlacementPage reports={filteredPlacement} isSuperAdmin={isSuperAdmin} onDelete={handleDeletePlacement} /></ErrorBoundary>
            } />
            <Route path="/placement-work" element={
              <ErrorBoundary><PlacementWorkReportsPage reports={filteredPlacementWork} isSuperAdmin={isSuperAdmin} onDelete={handleDeletePlacementWork} /></ErrorBoundary>
            } />
            <Route path="/placement-work/:id" element={
              <ErrorBoundary><PlacementWorkReportDetailPage reports={filteredPlacementWork} /></ErrorBoundary>
            } />
            <Route path="/office-daily" element={
              <ErrorBoundary><OfficeDailyReportsPage reports={filteredOfficeDaily} isSuperAdmin={isSuperAdmin} onDelete={handleDeleteOfficeDaily} /></ErrorBoundary>
            } />
            <Route path="/office-daily/:id" element={
              <ErrorBoundary><OfficeDailyReportDetailPage reports={filteredOfficeDaily} /></ErrorBoundary>
            } />
            <Route path="/office-weekly" element={
              <ErrorBoundary><OfficeWeeklyReportsPage reports={filteredOfficeWeekly} isSuperAdmin={isSuperAdmin} onDelete={handleDeleteOfficeWeekly} /></ErrorBoundary>
            } />
            <Route path="/settings" element={
              <ErrorBoundary><SettingsPage /></ErrorBoundary>
            } />
            <Route path="/admin" element={
              member?.role !== 'SuperAdmin' ? (
                <Navigate to="/" replace />
              ) : (
                <ErrorBoundary><SuperAdminPage /></ErrorBoundary>
              )
            } />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

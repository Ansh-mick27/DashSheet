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
import { useAuth } from './contexts/AuthContext';
import { fetchSheetData, refreshData, parseDate, generateNotifications } from './services/dataApi';
import {
  Member, TrainingReport, WorkReport, OfficeAdminReport,
  PlacementReport, DashboardFilters, Notification
} from './types';

function DashboardLayout() {
  const { member } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [trainingReports, setTrainingReports] = useState<TrainingReport[]>([]);
  const [workReports, setWorkReports] = useState<WorkReport[]>([]);
  const [officeAdminReports, setOfficeAdminReports] = useState<OfficeAdminReport[]>([]);
  const [placementReports, setPlacementReports] = useState<PlacementReport[]>([]);
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
      const data = await fetchSheetData();
      setMembers(data.members);
      setTrainingReports(data.trainingReports);
      setWorkReports(data.workReports);
      setOfficeAdminReports(data.officeAdminReports);
      setPlacementReports(data.placementReports);
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
      if (filters.trainer && r.trainerName !== filters.trainer) return false;
      if (!inDateRange(r.date)) return false;
      return true;
    });
  }, [trainingReports, filters, inDateRange]);

  const filteredWork = useMemo(() => {
    return workReports.filter(r => {
      if (filters.trainer && r.trainerName !== filters.trainer) return false;
      if (filters.batch && r.batch !== filters.batch) return false;
      if (filters.department && r.department !== filters.department) return false;
      if (!inDateRange(r.date)) return false;
      return true;
    });
  }, [workReports, filters, inDateRange]);

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      if (filters.department && m.department !== filters.department) return false;
      if (filters.batch && m.batch !== filters.batch) return false;
      if (filters.role && m.role !== filters.role) return false;
      return true;
    });
  }, [members, filters]);

  const filteredOfficeAdmin = useMemo(() => {
    return officeAdminReports.filter(r => {
      if (filters.trainer && r.staffName !== filters.trainer) return false;
      if (!inDateRange(r.date)) return false;
      return true;
    });
  }, [officeAdminReports, filters, inDateRange]);

  const filteredPlacement = useMemo(() => {
    return placementReports.filter(r => {
      if (filters.trainer && r.staffName !== filters.trainer) return false;
      if (!inDateRange(r.dateOfFirstContact)) return false;
      return true;
    });
  }, [placementReports, filters, inDateRange]);

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
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          members={members}
          onRefresh={handleRefresh}
          notifications={notifications}
          autoRefreshInterval={autoRefreshMins}
          onAutoRefreshChange={setAutoRefreshMins}
        />
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
              <ErrorBoundary><TrainingReportFormPage /></ErrorBoundary>
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
            <Route path="/training" element={
              <ErrorBoundary><TrainingReportsPage reports={filteredTraining} /></ErrorBoundary>
            } />
            <Route path="/work" element={
              <ErrorBoundary><WorkReportsPage reports={filteredWork} /></ErrorBoundary>
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
                />
              </ErrorBoundary>
            } />
            <Route path="/inventory" element={
              <ErrorBoundary><OfficeAdminPage reports={filteredOfficeAdmin} /></ErrorBoundary>
            } />
            <Route path="/placement" element={
              <ErrorBoundary><PlacementPage reports={filteredPlacement} /></ErrorBoundary>
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

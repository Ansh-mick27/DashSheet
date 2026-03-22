// ==========================================
// DashSheet — Main Application
// ==========================================
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import FilterBar from './components/FilterBar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import OverviewPage from './pages/OverviewPage';
import TrainingReportsPage from './pages/TrainingReportsPage';
import WorkReportsPage from './pages/WorkReportsPage';
import MembersPage from './pages/MembersPage';
import MemberDetailPage from './pages/MemberDetailPage';
import SettingsPage from './pages/SettingsPage';
import { useAuth } from './contexts/AuthContext';
import { fetchSheetData, refreshData, parseDate } from './services/sheetsApi';
import { Member, TrainingReport, WorkReport, DashboardFilters } from './types';
import { Loader2 } from 'lucide-react';

function DashboardLayout() {
  const [members, setMembers] = useState<Member[]>([]);
  const [trainingReports, setTrainingReports] = useState<TrainingReport[]>([]);
  const [workReports, setWorkReports] = useState<WorkReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<DashboardFilters>({
    trainer: '',
    dateFrom: '',
    dateTo: '',
    batch: '',
    department: ''
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSheetData();
      setMembers(data.members);
      setTrainingReports(data.trainingReports);
      setWorkReports(data.workReports);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(() => {
    refreshData();
    loadData();
  }, [loadData]);

  // Apply filters
  const filteredTraining = useMemo(() => {
    return trainingReports.filter(r => {
      if (filters.trainer && r.trainerName !== filters.trainer) return false;
      if (filters.batch && r.batch !== filters.batch) return false;
      if (filters.dateFrom) {
        const reportDate = parseDate(r.date);
        if (reportDate < new Date(filters.dateFrom)) return false;
      }
      if (filters.dateTo) {
        const reportDate = parseDate(r.date);
        if (reportDate > new Date(filters.dateTo)) return false;
      }
      return true;
    });
  }, [trainingReports, filters]);

  const filteredWork = useMemo(() => {
    return workReports.filter(r => {
      if (filters.trainer && r.trainerName !== filters.trainer) return false;
      if (filters.batch && r.batch !== filters.batch) return false;
      if (filters.department && r.department !== filters.department) return false;
      if (filters.dateFrom) {
        const reportDate = parseDate(r.date);
        if (reportDate < new Date(filters.dateFrom)) return false;
      }
      if (filters.dateTo) {
        const reportDate = parseDate(r.date);
        if (reportDate > new Date(filters.dateTo)) return false;
      }
      return true;
    });
  }, [workReports, filters]);

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      if (filters.department && m.department !== filters.department) return false;
      if (filters.batch && m.batch !== filters.batch) return false;
      return true;
    });
  }, [members, filters]);

  if (loading) {
    return (
      <div className="loading-screen">
        <Loader2 size={40} className="loading-spinner" />
        <p>Loading dashboard data...</p>
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
        />
        <div className="dashboard-content">
          <Routes>
            <Route
              path="/"
              element={
                <OverviewPage
                  trainingReports={filteredTraining}
                  workReports={filteredWork}
                  members={filteredMembers}
                />
              }
            />
            <Route
              path="/training"
              element={<TrainingReportsPage reports={filteredTraining} />}
            />
            <Route
              path="/work"
              element={<WorkReportsPage reports={filteredWork} />}
            />
            <Route
              path="/members"
              element={
                <MembersPage
                  members={filteredMembers}
                  trainingReports={filteredTraining}
                  workReports={filteredWork}
                />
              }
            />
            <Route
              path="/member/:name"
              element={
                <MemberDetailPage
                  members={members}
                  trainingReports={trainingReports}
                  workReports={workReports}
                />
              }
            />
            <Route
              path="/settings"
              element={<SettingsPage />}
            />
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

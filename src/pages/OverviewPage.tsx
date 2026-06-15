// ==========================================
// DashSheet — Overview Page
// ==========================================
import { useMemo } from 'react';
import {
  Users, CheckCircle2, Clock, BookOpen,
  TrendingUp, AlertTriangle, BarChart3, Target,
  Package, Briefcase
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  Legend, AreaChart, Area
} from 'recharts';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import { TrainingReport, WorkReport, Member, OfficeAdminReport, PlacementReport } from '../types';
import { getCompletionRate, getAttendanceRate, parseDate } from '../services/dataApi';
import { getSelectedMethods } from '../lib/options';

interface OverviewPageProps {
  trainingReports: TrainingReport[];
  workReports: WorkReport[];
  members: Member[];
  officeAdminReports: OfficeAdminReport[];
  placementReports: PlacementReport[];
}

const PIE_COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6'];

const PARTICIPATION_COLORS: Record<string, string> = { High: '#10b981', Moderate: '#f59e0b', Low: '#ef4444' };

const TOOLTIP_STYLE = {
  background: 'rgba(15,23,42,0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: '#e2e8f0'
};

export default function OverviewPage({
  trainingReports, workReports, members, officeAdminReports, placementReports
}: OverviewPageProps) {
  const completionRate = useMemo(() => getCompletionRate(workReports), [workReports]);
  const attendanceRate = useMemo(() => getAttendanceRate(trainingReports), [trainingReports]);

  const todayStr = new Date().toLocaleDateString('en-GB');
  const reportsToday = useMemo(() => {
    return trainingReports.filter(r => r.date === todayStr).length
      + workReports.filter(r => r.date === todayStr).length
      + officeAdminReports.filter(r => r.date === todayStr).length
      + placementReports.filter(r => r.dateOfFirstContact === todayStr).length;
  }, [trainingReports, workReports, officeAdminReports, placementReports, todayStr]);

  const pendingTasks = useMemo(() => {
    let c = 0;
    workReports.forEach(r => r.timeSlots.forEach(ts => { if (ts.status === 'Pending') c++; }));
    return c;
  }, [workReports]);

  const completedTasks = useMemo(() => {
    let c = 0;
    workReports.forEach(r => r.timeSlots.forEach(ts => { if (ts.status === 'Completed') c++; }));
    return c;
  }, [workReports]);

  const totalStudentsPlaced = useMemo(
    () => placementReports.reduce((s, r) => s + r.studentsSelected, 0), [placementReports]
  );

  // Participation level distribution
  const participationData = useMemo(() => {
    const counts = { High: 0, Moderate: 0, Low: 0 };
    trainingReports.forEach(r => { counts[r.participationLevel]++; });
    return Object.entries(counts)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [trainingReports]);

  // Tasks by department
  const deptData = useMemo(() => {
    const map: Record<string, { completed: number; pending: number }> = {};
    workReports.forEach(r => {
      if (!map[r.department]) map[r.department] = { completed: 0, pending: 0 };
      r.timeSlots.forEach(ts => {
        if (ts.status === 'Completed') map[r.department].completed++;
        if (ts.status === 'Pending') map[r.department].pending++;
      });
    });
    return Object.entries(map).map(([dept, s]) => ({
      department: dept.length > 12 ? dept.substring(0, 12) + '...' : dept,
      Completed: s.completed,
      Pending: s.pending
    }));
  }, [workReports]);

  // Reports over last 14 days
  const timelineData = useMemo(() => {
    const dayMap: Record<string, { training: number; work: number; placement: number }> = {};
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      dayMap[d.toLocaleDateString('en-GB')] = { training: 0, work: 0, placement: 0 };
    }
    trainingReports.forEach(r => { if (dayMap[r.date] !== undefined) dayMap[r.date].training++; });
    workReports.forEach(r => { if (dayMap[r.date] !== undefined) dayMap[r.date].work++; });
    placementReports.forEach(r => { if (dayMap[r.dateOfFirstContact] !== undefined) dayMap[r.dateOfFirstContact].placement++; });
    return Object.entries(dayMap).map(([date, c]) => ({
      date: date.substring(0, 5),
      Training: c.training,
      Work: c.work,
      Placement: c.placement
    }));
  }, [trainingReports, workReports, placementReports]);

  // Top performers
  const topPerformers = useMemo(() => {
    const map: Record<string, { completed: number; total: number }> = {};
    workReports.forEach(r => {
      if (!map[r.trainerName]) map[r.trainerName] = { completed: 0, total: 0 };
      r.timeSlots.forEach(ts => {
        if (ts.status) {
          map[r.trainerName].total++;
          if (ts.status === 'Completed') map[r.trainerName].completed++;
        }
      });
    });
    return Object.entries(map)
      .map(([name, s]) => ({ name: name.split(' ')[0], rate: s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0 }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 8);
  }, [workReports]);

  // Teaching methods
  const methodsData = useMemo(() => {
    const counts: Record<string, number> = {};
    trainingReports.forEach(r => {
      getSelectedMethods(r.methods).forEach(method => {
        counts[method] = (counts[method] || 0) + 1;
      });
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [trainingReports]);

  // Role breakdown
  const roleData = useMemo(() => {
    const map: Record<string, number> = {};
    members.forEach(m => { map[m.role] = (map[m.role] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [members]);

  return (
    <div className="overview-page">
      <div className="page-header">
        <h2 className="page-title">Dashboard Overview</h2>
        <p className="page-subtitle">Real-time insights across all staff and departments</p>
      </div>

      <div className="stats-grid">
        <StatCard title="Total Staff" value={members.length} icon={Users} color="blue" subtitle="All roles" />
        <StatCard title="Reports Today" value={reportsToday} icon={BookOpen} color="cyan" subtitle="Combined submissions" />
        <StatCard title="Completion Rate" value={`${completionRate}%`} icon={CheckCircle2} color="green"
          trend={completionRate >= 75 ? 'up' : 'down'} trendValue={completionRate >= 75 ? 'On track' : 'Needs attention'} />
        <StatCard title="Attendance Rate" value={`${attendanceRate}%`} icon={Target} color="purple"
          trend={attendanceRate >= 80 ? 'up' : 'down'} trendValue="Avg across sessions" />
        <StatCard title="Completed Tasks" value={completedTasks} icon={TrendingUp} color="green" subtitle="All time" />
        <StatCard title="Pending Tasks" value={pendingTasks} icon={AlertTriangle} color="orange" subtitle="Awaiting completion" />
        <StatCard title="Students Placed" value={totalStudentsPlaced} icon={Briefcase} color="cyan" subtitle="Via placement cell" />
        <StatCard title="Inventory Logs" value={officeAdminReports.length} icon={Package} color="orange" subtitle="Items tracked" />
      </div>

      <div className="charts-grid charts-grid--2">
        <ChartCard title="Daily Activity" subtitle="Reports submitted over last 14 days">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="gradT" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradW" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#e2e8f0' }} />
              <Legend />
              <Area type="monotone" dataKey="Training" stroke="#6366f1" fill="url(#gradT)" strokeWidth={2} />
              <Area type="monotone" dataKey="Work" stroke="#22d3ee" fill="url(#gradW)" strokeWidth={2} />
              <Area type="monotone" dataKey="Placement" stroke="#10b981" fill="url(#gradP)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Participation Levels" subtitle="Student engagement distribution">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={participationData} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                labelLine={false}>
                {participationData.map((entry) => (
                  <Cell key={entry.name} fill={PARTICIPATION_COLORS[entry.name as keyof typeof PARTICIPATION_COLORS]} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="charts-grid charts-grid--2">
        <ChartCard title="Tasks by Department" subtitle="Completed vs Pending">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="department" stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#e2e8f0' }} />
              <Legend />
              <Bar dataKey="Completed" fill="#10b981" radius={[4,4,0,0]} />
              <Bar dataKey="Pending" fill="#f59e0b" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Performers" subtitle="Highest task completion rates">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topPerformers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" domain={[0, 100]} stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.4)" fontSize={11} width={60} />
              <Tooltip formatter={(v: number) => `${v}%`} contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#e2e8f0' }} />
              <Bar dataKey="rate" fill="#6366f1" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="charts-grid charts-grid--2">
        <ChartCard title="Teaching Methods" subtitle="Frequency of each method used">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={methodsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#e2e8f0' }} />
              <Bar dataKey="value" radius={[4,4,0,0]}>
                {methodsData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Staff by Role" subtitle="Distribution across all roles">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={roleData} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                label={({ name, value }) => `${name === 'OfficeAdmin' ? 'Office Admin' : name} (${value})`}
                labelLine={false}>
                {roleData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

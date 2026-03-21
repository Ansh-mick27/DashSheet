// ==========================================
// DashSheet — Overview Page
// ==========================================
import { useMemo } from 'react';
import {
  Users, CheckCircle2, Clock, BookOpen,
  TrendingUp, AlertTriangle, BarChart3, Target
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import { TrainingReport, WorkReport, Member } from '../types';
import { getCompletionRate, getAttendanceRate, parseDate } from '../services/sheetsApi';

interface OverviewPageProps {
  trainingReports: TrainingReport[];
  workReports: WorkReport[];
  members: Member[];
}

const PIE_COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6'];

export default function OverviewPage({ trainingReports, workReports, members }: OverviewPageProps) {
  const completionRate = useMemo(() => getCompletionRate(workReports), [workReports]);
  const attendanceRate = useMemo(() => getAttendanceRate(trainingReports), [trainingReports]);

  const todayStr = new Date().toLocaleDateString('en-GB');
  const reportsToday = useMemo(() => {
    return trainingReports.filter(r => r.date === todayStr).length +
           workReports.filter(r => r.date === todayStr).length;
  }, [trainingReports, workReports, todayStr]);

  const pendingTasks = useMemo(() => {
    let count = 0;
    workReports.forEach(r => r.timeSlots.forEach(ts => {
      if (ts.status === 'Pending') count++;
    }));
    return count;
  }, [workReports]);

  const completedTasks = useMemo(() => {
    let count = 0;
    workReports.forEach(r => r.timeSlots.forEach(ts => {
      if (ts.status === 'Completed') count++;
    }));
    return count;
  }, [workReports]);

  // Participation level distribution
  const participationData = useMemo(() => {
    const counts = { High: 0, Moderate: 0, Low: 0 };
    trainingReports.forEach(r => {
      counts[r.participationLevel]++;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [trainingReports]);

  // Task completion by department
  const deptData = useMemo(() => {
    const deptMap: Record<string, { completed: number; pending: number }> = {};
    workReports.forEach(r => {
      if (!deptMap[r.department]) deptMap[r.department] = { completed: 0, pending: 0 };
      r.timeSlots.forEach(ts => {
        if (ts.status === 'Completed') deptMap[r.department].completed++;
        if (ts.status === 'Pending') deptMap[r.department].pending++;
      });
    });
    return Object.entries(deptMap).map(([dept, stats]) => ({
      department: dept.length > 12 ? dept.substring(0, 12) + '...' : dept,
      Completed: stats.completed,
      Pending: stats.pending
    }));
  }, [workReports]);

  // Reports over time (last 14 days)
  const timelineData = useMemo(() => {
    const dayMap: Record<string, { training: number; work: number }> = {};
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-GB');
      dayMap[key] = { training: 0, work: 0 };
    }
    trainingReports.forEach(r => {
      if (dayMap[r.date] !== undefined) dayMap[r.date].training++;
    });
    workReports.forEach(r => {
      if (dayMap[r.date] !== undefined) dayMap[r.date].work++;
    });
    return Object.entries(dayMap).map(([date, counts]) => ({
      date: date.substring(0, 5),
      Training: counts.training,
      Work: counts.work
    }));
  }, [trainingReports, workReports]);

  // Top performers by completion rate
  const topPerformers = useMemo(() => {
    const trainerMap: Record<string, { completed: number; total: number }> = {};
    workReports.forEach(r => {
      if (!trainerMap[r.trainerName]) trainerMap[r.trainerName] = { completed: 0, total: 0 };
      r.timeSlots.forEach(ts => {
        if (ts.status) {
          trainerMap[r.trainerName].total++;
          if (ts.status === 'Completed') trainerMap[r.trainerName].completed++;
        }
      });
    });
    return Object.entries(trainerMap)
      .map(([name, stats]) => ({
        name: name.split(' ')[0],
        rate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 8);
  }, [workReports]);

  // Teaching methods distribution
  const methodsData = useMemo(() => {
    const counts: Record<string, number> = {
      Lecture: 0, 'Group Discussion': 0, 'Case Study': 0,
      'Role Play': 0, Presentation: 0, Practical: 0
    };
    trainingReports.forEach(r => {
      if (r.methods.lecture) counts['Lecture']++;
      if (r.methods.groupDiscussion) counts['Group Discussion']++;
      if (r.methods.caseStudy) counts['Case Study']++;
      if (r.methods.rolePlay) counts['Role Play']++;
      if (r.methods.presentation) counts['Presentation']++;
      if (r.methods.practical) counts['Practical']++;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [trainingReports]);

  return (
    <div className="overview-page">
      <div className="page-header">
        <h2 className="page-title">Dashboard Overview</h2>
        <p className="page-subtitle">Real-time insights across all trainers and departments</p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Trainers"
          value={members.length}
          icon={Users}
          color="blue"
          subtitle="Active members"
        />
        <StatCard
          title="Reports Today"
          value={reportsToday}
          icon={BookOpen}
          color="cyan"
          subtitle="Combined submissions"
        />
        <StatCard
          title="Completion Rate"
          value={`${completionRate}%`}
          icon={CheckCircle2}
          color="green"
          trend={completionRate >= 75 ? 'up' : 'down'}
          trendValue={completionRate >= 75 ? 'On track' : 'Needs attention'}
        />
        <StatCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          icon={Target}
          color="purple"
          trend={attendanceRate >= 80 ? 'up' : 'down'}
          trendValue={`Avg. across sessions`}
        />
        <StatCard
          title="Completed Tasks"
          value={completedTasks}
          icon={TrendingUp}
          color="green"
          subtitle="All time"
        />
        <StatCard
          title="Pending Tasks"
          value={pendingTasks}
          icon={AlertTriangle}
          color="orange"
          subtitle="Awaiting completion"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="charts-grid charts-grid--2">
        <ChartCard title="Report Submissions" subtitle="Training & Work reports over last 14 days">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="gradTraining" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradWork" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(15,23,42,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }}
              />
              <Legend />
              <Area type="monotone" dataKey="Training" stroke="#6366f1" fill="url(#gradTraining)" strokeWidth={2} />
              <Area type="monotone" dataKey="Work" stroke="#22d3ee" fill="url(#gradWork)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Participation Levels" subtitle="Student engagement distribution">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={participationData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {participationData.map((_, i) => (
                  <Cell key={i} fill={['#10b981', '#f59e0b', '#ef4444'][i]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'rgba(15,23,42,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="charts-grid charts-grid--2">
        <ChartCard title="Tasks by Department" subtitle="Completed vs Pending">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="department" stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(15,23,42,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }}
              />
              <Legend />
              <Bar dataKey="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Performers" subtitle="Highest task completion rates">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topPerformers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" domain={[0, 100]} stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.4)" fontSize={11} width={60} />
              <Tooltip
                formatter={(value: number) => `${value}%`}
                contentStyle={{
                  background: 'rgba(15,23,42,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }}
              />
              <Bar dataKey="rate" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 3 */}
      <div className="charts-grid charts-grid--1">
        <ChartCard title="Teaching Methods Distribution" subtitle="Frequency of each teaching method used">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={methodsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(15,23,42,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {methodsData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

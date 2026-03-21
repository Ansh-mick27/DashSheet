// ==========================================
// DashSheet — Training Reports Page
// ==========================================
import { useMemo } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, Legend
} from 'recharts';
import ChartCard from '../components/ChartCard';
import DataTable from '../components/DataTable';
import { TrainingReport } from '../types';
import { getAttendanceRate } from '../services/sheetsApi';

interface TrainingReportsPageProps {
  reports: TrainingReport[];
}

const LEVEL_COLORS: Record<string, string> = {
  High: '#10b981',
  Moderate: '#f59e0b',
  Low: '#ef4444'
};

export default function TrainingReportsPage({ reports }: TrainingReportsPageProps) {
  const attendanceRate = useMemo(() => getAttendanceRate(reports), [reports]);

  // Attendance over time
  const attendanceTimeline = useMemo(() => {
    const dateMap: Record<string, { present: number; total: number; count: number }> = {};
    reports.forEach(r => {
      if (!dateMap[r.date]) dateMap[r.date] = { present: 0, total: 0, count: 0 };
      dateMap[r.date].present += r.studentsPresent;
      dateMap[r.date].total += r.totalEnrolled;
      dateMap[r.date].count++;
    });
    return Object.entries(dateMap)
      .sort(([a], [b]) => {
        const [da, ma, ya] = a.split('/').map(Number);
        const [db, mb, yb] = b.split('/').map(Number);
        return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime();
      })
      .slice(-14)
      .map(([date, stats]) => ({
        date: date.substring(0, 5),
        rate: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0
      }));
  }, [reports]);

  // Participation breakdown
  const participationData = useMemo(() => {
    const counts: Record<string, number> = { High: 0, Moderate: 0, Low: 0 };
    reports.forEach(r => counts[r.participationLevel]++);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [reports]);

  // Methods usage
  const methodsData = useMemo(() => {
    const counts: Record<string, number> = {
      Lecture: 0, 'Group Discussion': 0, 'Case Study': 0,
      'Role Play': 0, Presentation: 0, Practical: 0
    };
    reports.forEach(r => {
      if (r.methods.lecture) counts['Lecture']++;
      if (r.methods.groupDiscussion) counts['Group Discussion']++;
      if (r.methods.caseStudy) counts['Case Study']++;
      if (r.methods.rolePlay) counts['Role Play']++;
      if (r.methods.presentation) counts['Presentation']++;
      if (r.methods.practical) counts['Practical']++;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [reports]);

  // Course distribution
  const courseData = useMemo(() => {
    const counts: Record<string, number> = {};
    reports.forEach(r => {
      counts[r.course] = (counts[r.course] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, value]) => ({
        name: name.length > 15 ? name.substring(0, 15) + '...' : name,
        sessions: value
      }));
  }, [reports]);

  const CHART_COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6'];

  const columns = [
    { key: 'date', header: 'Date', sortable: true, width: '90px' },
    { key: 'trainerName', header: 'Trainer', sortable: true, width: '140px' },
    { key: 'batch', header: 'Batch', sortable: true, width: '80px' },
    { key: 'course', header: 'Course', sortable: true },
    { key: 'topicCovered', header: 'Topic' },
    {
      key: 'attendance', header: 'Attendance', width: '100px',
      render: (r: TrainingReport) => `${r.studentsPresent}/${r.totalEnrolled}`
    },
    {
      key: 'participationLevel', header: 'Participation', sortable: true, width: '110px',
      render: (r: TrainingReport) => (
        <span className={`badge badge--${r.participationLevel.toLowerCase()}`}>
          {r.participationLevel}
        </span>
      )
    }
  ];

  return (
    <div className="training-page">
      <div className="page-header">
        <h2 className="page-title">Training Reports</h2>
        <p className="page-subtitle">
          {reports.length} reports · Avg attendance: {attendanceRate}%
        </p>
      </div>

      <div className="charts-grid charts-grid--2">
        <ChartCard title="Attendance Trend" subtitle="Average attendance % over last 14 days">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={attendanceTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <Tooltip
                formatter={(v: number) => `${v}%`}
                contentStyle={{
                  background: 'rgba(15,23,42,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }}
              />
              <Line type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Participation Levels" subtitle="Engagement distribution">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={participationData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {participationData.map((entry) => (
                  <Cell key={entry.name} fill={LEVEL_COLORS[entry.name]} />
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

      <div className="charts-grid charts-grid--2">
        <ChartCard title="Teaching Methods" subtitle="Usage frequency">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={methodsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} angle={-20} />
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
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Courses" subtitle="Most delivered courses">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={courseData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.4)" fontSize={10} width={100} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(15,23,42,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }}
              />
              <Bar dataKey="sessions" fill="#22d3ee" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="All Training Reports" className="mt-24">
        <DataTable
          columns={columns}
          data={reports}
          rowKey={(r, i) => `${r.trainerName}-${r.date}-${i}`}
          pageSize={12}
        />
      </ChartCard>
    </div>
  );
}

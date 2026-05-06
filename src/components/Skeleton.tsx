// ==========================================
// DashSheet — Skeleton Loading Components
// ==========================================

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton--title" />
      <div className="skeleton skeleton--value" />
      <div className="skeleton skeleton--sub" />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="skeleton-chart">
      <div className="skeleton skeleton--chart-title" />
      <div className="skeleton skeleton--chart-body" />
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="skeleton-table">
      <div className="skeleton skeleton--table-header" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton skeleton--table-row" />
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton">
      <div className="stats-grid">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
      <div className="charts-grid charts-grid--2">
        <SkeletonChart />
        <SkeletonChart />
      </div>
      <SkeletonTable />
    </div>
  );
}

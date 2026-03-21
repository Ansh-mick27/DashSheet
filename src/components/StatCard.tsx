// ==========================================
// DashSheet — Stat Card Component
// ==========================================
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'cyan';
}

export default function StatCard({
  title, value, subtitle, icon: Icon, trend, trendValue, color = 'blue'
}: StatCardProps) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-card__header">
        <span className="stat-card__title">{title}</span>
        <div className={`stat-card__icon stat-card__icon--${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__footer">
        {trend && trendValue && (
          <span className={`stat-card__trend stat-card__trend--${trend}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
          </span>
        )}
        {subtitle && <span className="stat-card__subtitle">{subtitle}</span>}
      </div>
    </div>
  );
}

// ==========================================
// DashSheet — Filter Bar
// ==========================================
import { useEffect } from 'react';
import { Search, RefreshCw, Calendar, X } from 'lucide-react';
import { DashboardFilters, Member } from '../types';
import NotificationPanel from './NotificationPanel';
import { Notification } from '../types';

interface FilterBarProps {
  filters: DashboardFilters;
  onFilterChange: (filters: DashboardFilters) => void;
  members: Member[];
  onRefresh: () => void;
  notifications?: Notification[];
  autoRefreshInterval?: number;
  onAutoRefreshChange?: (minutes: number) => void;
}

const STORAGE_KEY = 'dashsheet_filters';

export default function FilterBar({
  filters, onFilterChange, members, onRefresh,
  notifications = [], autoRefreshInterval = 0, onAutoRefreshChange
}: FilterBarProps) {
  const uniqueDepartments = [...new Set(members.map(m => m.department))].filter(d => d !== '-');
  const uniqueBatches = [...new Set(members.map(m => m.batch))].filter(b => b !== '-');
  const roles = ['Trainer', 'Admin', 'OfficeAdmin', 'Placement'];

  // Restore persisted filters on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        onFilterChange(JSON.parse(saved));
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (key: keyof DashboardFilters, value: string) => {
    const next = { ...filters, [key]: value };
    onFilterChange(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const clearAll = () => {
    const empty: DashboardFilters = { trainer: '', dateFrom: '', dateTo: '', batch: '', department: '', role: '' };
    onFilterChange(empty);
    localStorage.removeItem(STORAGE_KEY);
  };

  const hasFilters = Object.values(filters).some(v => v !== '');

  const trainersByRole = members.filter(m =>
    !filters.role || m.role === filters.role
  );

  return (
    <div className="filter-bar">
      <div className="filter-bar__group">
        <div className="filter-bar__field">
          <select
            value={filters.role}
            onChange={e => update('role', e.target.value)}
            className="filter-bar__select"
          >
            <option value="">All Roles</option>
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className="filter-bar__field">
          <Search size={16} className="filter-bar__icon" />
          <select
            value={filters.trainer}
            onChange={e => update('trainer', e.target.value)}
            className="filter-bar__select"
          >
            <option value="">All Members</option>
            {trainersByRole.map(m => (
              <option key={m.name} value={m.name}>{m.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-bar__field">
          <select
            value={filters.department}
            onChange={e => update('department', e.target.value)}
            className="filter-bar__select"
          >
            <option value="">All Departments</option>
            {uniqueDepartments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="filter-bar__field">
          <select
            value={filters.batch}
            onChange={e => update('batch', e.target.value)}
            className="filter-bar__select"
          >
            <option value="">All Batches</option>
            {uniqueBatches.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div className="filter-bar__field">
          <Calendar size={16} className="filter-bar__icon" />
          <input
            type="date"
            value={filters.dateFrom}
            onChange={e => update('dateFrom', e.target.value)}
            className="filter-bar__input"
            title="From date"
          />
        </div>

        <div className="filter-bar__field filter-bar__field--to">
          <span className="filter-bar__sep">to</span>
          <input
            type="date"
            value={filters.dateTo}
            onChange={e => update('dateTo', e.target.value)}
            className="filter-bar__input"
            title="To date"
          />
        </div>

        {hasFilters && (
          <button className="filter-bar__clear" onClick={clearAll} title="Clear all filters">
            <X size={14} /> Clear
          </button>
        )}
      </div>

      <div className="filter-bar__actions">
        {onAutoRefreshChange && (
          <select
            className="filter-bar__select filter-bar__select--sm"
            value={autoRefreshInterval}
            onChange={e => onAutoRefreshChange(Number(e.target.value))}
            title="Auto-refresh interval"
          >
            <option value={0}>Manual refresh</option>
            <option value={5}>Auto: 5 min</option>
            <option value={10}>Auto: 10 min</option>
            <option value={30}>Auto: 30 min</option>
          </select>
        )}
        <NotificationPanel notifications={notifications} />
        <button className="filter-bar__refresh" onClick={onRefresh} aria-label="Refresh data">
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
}

// ==========================================
// DashSheet — Filter Bar
// ==========================================
import { Search, RefreshCw, Calendar } from 'lucide-react';
import { DashboardFilters, Member } from '../types';

interface FilterBarProps {
  filters: DashboardFilters;
  onFilterChange: (filters: DashboardFilters) => void;
  members: Member[];
  onRefresh: () => void;
}

export default function FilterBar({ filters, onFilterChange, members, onRefresh }: FilterBarProps) {
  const uniqueDepartments = [...new Set(members.map(m => m.department))];
  const uniqueBatches = [...new Set(members.map(m => m.batch))];

  const update = (key: keyof DashboardFilters, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="filter-bar">
      <div className="filter-bar__group">
        <div className="filter-bar__field">
          <Search size={16} className="filter-bar__icon" />
          <select
            id="filter-trainer"
            value={filters.trainer}
            onChange={e => update('trainer', e.target.value)}
            className="filter-bar__select"
          >
            <option value="">All Trainers</option>
            {members.map(m => (
              <option key={m.name} value={m.name}>{m.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-bar__field">
          <select
            id="filter-department"
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
            id="filter-batch"
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
            id="filter-date-from"
            type="date"
            value={filters.dateFrom}
            onChange={e => update('dateFrom', e.target.value)}
            className="filter-bar__input"
            placeholder="From"
          />
        </div>

        <div className="filter-bar__field">
          <Calendar size={16} className="filter-bar__icon" />
          <input
            id="filter-date-to"
            type="date"
            value={filters.dateTo}
            onChange={e => update('dateTo', e.target.value)}
            className="filter-bar__input"
            placeholder="To"
          />
        </div>
      </div>

      <button className="filter-bar__refresh" onClick={onRefresh} aria-label="Refresh data">
        <RefreshCw size={16} />
        <span>Refresh</span>
      </button>
    </div>
  );
}

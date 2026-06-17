// ==========================================
// DashSheet — Data Table Component
// ==========================================
import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Download, Search } from 'lucide-react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  csvValue?: (item: T) => string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (item: T, index: number) => string;
  pageSize?: number;
  emptyMessage?: string;
  exportFilename?: string;
  searchKeys?: (keyof T)[];
}

export default function DataTable<T>({
  columns, data, rowKey, pageSize = 10,
  emptyMessage = 'No data found', exportFilename, searchKeys
}: DataTableProps<T>) {
  const [sortCol, setSortCol] = useState<string>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  const searchedData = useMemo(() => {
    if (!searchKeys || !search.trim()) return data;
    const q = search.trim().toLowerCase();
    return data.filter(item =>
      searchKeys.some(key => String((item as Record<string, unknown>)[key as string] ?? '').toLowerCase().includes(q))
    );
  }, [data, searchKeys, search]);

  const sortedData = useMemo(() => {
    if (!sortCol) return searchedData;
    return [...searchedData].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortCol];
      const bVal = (b as Record<string, unknown>)[sortCol];
      const cmp = String(aVal ?? '').localeCompare(String(bVal ?? ''), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [searchedData, sortCol, sortDir]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const pagedData = sortedData.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (colKey: string) => {
    if (sortCol === colKey) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(colKey);
      setSortDir('asc');
    }
  };

  const exportCSV = () => {
    const headers = columns.map(c => `"${c.header}"`).join(',');
    const rows = sortedData.map(item =>
      columns.map(col => {
        const raw = col.csvValue
          ? col.csvValue(item)
          : String((item as Record<string, unknown>)[col.key] ?? '');
        return `"${raw.replace(/"/g, '""')}"`;
      }).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportFilename || 'export'}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="data-table-wrapper">
      {(searchKeys || exportFilename) && (
        <div className="data-table__toolbar">
          {searchKeys && (
            <div className="data-table__search">
              <Search size={14} className="data-table__search-icon" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(0); }}
                placeholder="Search..."
                className="data-table__search-input"
              />
            </div>
          )}
          {exportFilename && (
            <button className="btn btn--ghost btn--sm" onClick={exportCSV} title="Export to CSV">
              <Download size={14} /> Export CSV
            </button>
          )}
        </div>
      )}
      <div className="data-table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className={col.sortable ? 'data-table__th--sortable' : ''}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="data-table__th-content">
                    {col.header}
                    {col.sortable && sortCol === col.key && (
                      sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="data-table__empty">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pagedData.map((item, index) => (
                <tr key={rowKey(item, page * pageSize + index)}>
                  {columns.map(col => (
                    <td key={col.key}>
                      {col.render
                        ? col.render(item)
                        : String((item as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="data-table__pagination">
          <span className="data-table__page-info">
            Page {page + 1} of {totalPages} ({sortedData.length} records)
          </span>
          <div className="data-table__page-buttons">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="data-table__page-btn">
              Previous
            </button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="data-table__page-btn">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

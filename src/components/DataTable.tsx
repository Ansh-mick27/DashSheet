// ==========================================
// DashSheet — Data Table Component
// ==========================================
import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Download } from 'lucide-react';

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
}

export default function DataTable<T>({
  columns, data, rowKey, pageSize = 10,
  emptyMessage = 'No data found', exportFilename
}: DataTableProps<T>) {
  const [sortCol, setSortCol] = useState<string>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);

  const sortedData = useMemo(() => {
    if (!sortCol) return data;
    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortCol];
      const bVal = (b as Record<string, unknown>)[sortCol];
      const cmp = String(aVal ?? '').localeCompare(String(bVal ?? ''), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortCol, sortDir]);

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
      {exportFilename && (
        <div className="data-table__toolbar">
          <button className="btn btn--ghost btn--sm" onClick={exportCSV} title="Export to CSV">
            <Download size={14} /> Export CSV
          </button>
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

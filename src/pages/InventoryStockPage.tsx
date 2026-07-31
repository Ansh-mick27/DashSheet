// ==========================================
// DashSheet — Inventory Stock Page
// ==========================================
import { useState, useEffect, useMemo } from 'react';
import { Save, Package } from 'lucide-react';
import { fetchInventoryStock, upsertInventoryStock } from '../services/dataApi';
import { INVENTORY_ITEMS } from '../data/constants';
import { OfficeAdminReport, InventoryStock } from '../types';
import DataTable from '../components/DataTable';

interface InventoryStockPageProps {
  reports: OfficeAdminReport[];
  memberName?: string;
}

interface StockEntry {
  currentStock: number;
  notes: string;
  lastUpdated: string;
  updatedBy: string;
}

const TH: React.CSSProperties = {
  padding: '6px 8px',
  background: 'var(--bg-card)',
  fontWeight: 600,
  fontSize: 12,
  textAlign: 'left',
  borderBottom: '1px solid var(--border-color)',
};

const TD: React.CSSProperties = {
  padding: '4px 6px',
  verticalAlign: 'top',
  borderBottom: '1px solid var(--border-color)',
};

export default function InventoryStockPage({ reports, memberName }: InventoryStockPageProps) {
  // All items to display (INVENTORY_ITEMS minus "Other", plus any extras from reports)
  const baseItems = useMemo(() => {
    const base = INVENTORY_ITEMS.filter(i => i !== 'Other');
    const fromReports = reports.map(r => r.itemName).filter(n => n && !base.includes(n));
    return [...base, ...Array.from(new Set(fromReports))];
  }, [reports]);

  const [stockMap, setStockMap] = useState<Record<string, StockEntry>>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    fetchInventoryStock().then((dbRows: InventoryStock[]) => {
      const map: Record<string, StockEntry> = {};
      // Initialize all base items
      baseItems.forEach(item => {
        map[item] = { currentStock: 0, notes: '', lastUpdated: '', updatedBy: '' };
      });
      // Overlay DB data
      dbRows.forEach(row => {
        map[row.itemName] = {
          currentStock: row.currentStock,
          notes: row.notes,
          lastUpdated: row.lastUpdated,
          updatedBy: row.updatedBy,
        };
        // Ensure DB items are in the list even if not in baseItems
        if (!map[row.itemName]) {
          map[row.itemName] = {
            currentStock: row.currentStock,
            notes: row.notes,
            lastUpdated: row.lastUpdated,
            updatedBy: row.updatedBy,
          };
        }
      });
      setStockMap(map);
    });
  }, [baseItems]);

  const updateStock = (item: string, field: 'currentStock' | 'notes', value: string | number) => {
    setStockMap(prev => ({
      ...prev,
      [item]: { ...prev[item], [field]: value },
    }));
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    setSaveError('');
    try {
      // Save rows where currentStock > 0 OR already has a lastUpdated (exists in DB)
      const toSave = Object.entries(stockMap)
        .filter(([, entry]) => entry.currentStock > 0 || entry.lastUpdated !== '')
        .map(([itemName, entry]) => ({
          itemName,
          currentStock: entry.currentStock,
          updatedBy: memberName ?? '',
          notes: entry.notes,
        }));
      await upsertInventoryStock(toSave);
      // Refresh from DB to get updated timestamps
      const dbRows = await fetchInventoryStock();
      setStockMap(prev => {
        const next = { ...prev };
        dbRows.forEach(row => {
          if (next[row.itemName]) {
            next[row.itemName] = {
              ...next[row.itemName],
              lastUpdated: row.lastUpdated,
              updatedBy: row.updatedBy,
            };
          }
        });
        return next;
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err: unknown) {
      console.error(err);
      setSaveError(err instanceof Error ? err.message : 'Save failed');
      setSaveStatus('error');
    }
  };

  // Allocation log: reports where actionTaken === 'Assigned' and assignedTo is non-empty
  const allocationLog = useMemo(() => {
    return reports
      .filter(r => r.actionTaken === 'Assigned' && r.assignedTo)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [reports]);

  const allocationColumns = [
    { key: 'date', header: 'Date', sortable: true },
    { key: 'itemName', header: 'Item Name', sortable: true },
    { key: 'quantity', header: 'Qty', sortable: false, render: (r: OfficeAdminReport) => String(r.quantity) },
    { key: 'assignedTo', header: 'Assigned To', sortable: true },
    { key: 'staffName', header: 'Logged By', sortable: true },
    { key: 'notes', header: 'Notes', sortable: false },
  ];

  const formatDate = (iso: string) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return iso;
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Stock Overview</h2>
          <p className="page-subtitle">Manage current stock counts and view allocation history</p>
        </div>
      </div>

      {/* Section 1: Stock Table */}
      <div className="settings-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 className="form-section-title" style={{ margin: 0 }}>
            <Package size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Current Stock
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {saveStatus === 'success' && (
              <span style={{ color: 'var(--color-success, #22c55e)', fontSize: 13 }}>Saved!</span>
            )}
            {saveStatus === 'error' && (
              <span style={{ color: 'var(--color-error, #ef4444)', fontSize: 13 }}>{saveError}</span>
            )}
            <button
              className="btn btn--primary"
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
            >
              <Save size={16} />
              {saveStatus === 'saving' ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        </div>

        <div className="tbl-scroll" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr>
                <th style={TH}>Item Name</th>
                <th style={{ ...TH, width: 120 }}>Current Stock</th>
                <th style={TH}>Notes</th>
                <th style={{ ...TH, width: 160 }}>Last Updated</th>
                <th style={{ ...TH, width: 140 }}>Updated By</th>
              </tr>
            </thead>
            <tbody>
              {baseItems.map(item => {
                const entry = stockMap[item] ?? { currentStock: 0, notes: '', lastUpdated: '', updatedBy: '' };
                return (
                  <tr key={item}>
                    <td style={TD}>{item}</td>
                    <td style={TD}>
                      <input
                        className="settings-form__input"
                        type="number"
                        min={0}
                        value={entry.currentStock}
                        onChange={e => updateStock(item, 'currentStock', Number(e.target.value))}
                        style={{ width: 90 }}
                      />
                    </td>
                    <td style={TD}>
                      <input
                        className="settings-form__input"
                        type="text"
                        value={entry.notes}
                        onChange={e => updateStock(item, 'notes', e.target.value)}
                        style={{ minWidth: 140 }}
                      />
                    </td>
                    <td style={{ ...TD, fontSize: 12, color: 'var(--text-secondary)' }}>
                      {entry.lastUpdated ? formatDate(entry.lastUpdated) : '—'}
                    </td>
                    <td style={{ ...TD, fontSize: 12, color: 'var(--text-secondary)' }}>
                      {entry.updatedBy || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Allocation Log */}
      <div className="settings-card" style={{ marginTop: 24 }}>
        <h3 className="form-section-title">Allocation Log</h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
          All items logged as Assigned
        </p>
        <DataTable
          columns={allocationColumns}
          data={allocationLog}
          rowKey={(r, i) => `${r.timestamp}-${i}`}
          pageSize={15}
          emptyMessage="No allocation records found."
          exportFilename="allocation-log"
        />
      </div>
    </div>
  );
}

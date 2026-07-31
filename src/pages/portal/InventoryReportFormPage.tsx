// ==========================================
// DashSheet — Inventory Report Form Page (Multi-row)
// ==========================================
import { useState, FormEvent } from 'react';
import { CheckCircle2, AlertCircle, Send, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { submitOfficeAdminReport } from '../../services/dataApi';
import { todayISO, isoToDDMMYYYY } from '../../lib/dateUtils';
import { INVENTORY_ITEMS, ITEM_CONDITIONS } from '../../data/constants';
import { Member, OfficeAdminReport } from '../../types';

interface InventoryReportFormPageProps {
  members: Member[];
}

interface InventoryRow {
  itemName: string;
  itemNameOther: string;
  quantity: string;
  actionTaken: string;
  condition: string;
  assignedTo: string;
  assignedToOther: string;
  notes: string;
}

const ACTION_OPTIONS = ['Added', 'Removed', 'Assigned', 'Returned', 'Audited', 'Maintenance'];

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

function emptyRow(): InventoryRow {
  return { itemName: '', itemNameOther: '', quantity: '1', actionTaken: '', condition: '', assignedTo: '', assignedToOther: '', notes: '' };
}

export default function InventoryReportFormPage({ members }: InventoryReportFormPageProps) {
  const { member } = useAuth();
  const [date, setDate] = useState(todayISO());
  const [rows, setRows] = useState<InventoryRow[]>([emptyRow()]);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const memberNames = members.map(m => m.name);

  const updateRow = (index: number, field: keyof InventoryRow, value: string) => {
    setRows(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
  };

  const addRow = () => setRows(prev => [...prev, emptyRow()]);

  const removeRow = (index: number) => {
    if (rows.length === 1) return;
    setRows(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!member) return;
    setStatus('saving');
    setErrorMsg('');
    try {
      for (const row of rows) {
        const resolvedItem = row.itemName === 'Other' ? row.itemNameOther : row.itemName;
        const resolvedAssignedTo = row.assignedTo === 'Other...' ? row.assignedToOther : row.assignedTo;
        const report: OfficeAdminReport = {
          timestamp: new Date().toISOString(),
          staffName: member.name,
          date: isoToDDMMYYYY(date),
          itemName: resolvedItem,
          itemCode: '',
          itemCategory: 'Stationery',
          quantity: Number(row.quantity) || 1,
          condition: (row.condition as OfficeAdminReport['condition']) || 'Good',
          actionTaken: row.actionTaken as OfficeAdminReport['actionTaken'],
          location: '',
          notes: row.notes,
          assignedTo: resolvedAssignedTo,
          extraFields: {},
        };
        await submitOfficeAdminReport(report);
      }
      setStatus('success');
      setRows([emptyRow()]);
      setDate(todayISO());
      setTimeout(() => setStatus('idle'), 4000);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Inventory Report</h2>
          <p className="page-subtitle">Log multiple inventory items in one submission</p>
        </div>
      </div>

      <div className="settings-card">
        <form onSubmit={handleSubmit} className="settings-form">
          {/* Header row */}
          <div className="form-grid">
            <div className="settings-form__group">
              <label className="settings-form__label">Member Name</label>
              <input className="settings-form__input" value={member?.name ?? ''} readOnly />
            </div>
            <div className="settings-form__group">
              <label className="settings-form__label">Date</label>
              <input
                className="settings-form__input"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Multi-row table */}
          <div style={{ overflowX: 'auto', marginTop: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
              <thead>
                <tr>
                  <th style={TH}>Item Name</th>
                  <th style={{ ...TH, width: 70 }}>Qty</th>
                  <th style={TH}>Action</th>
                  <th style={TH}>Condition</th>
                  <th style={TH}>Assigned To</th>
                  <th style={TH}>Notes</th>
                  <th style={{ ...TH, width: 36 }}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx}>
                    {/* Item Name */}
                    <td style={TD}>
                      <select
                        className="settings-form__input"
                        value={row.itemName}
                        onChange={e => updateRow(idx, 'itemName', e.target.value)}
                        required
                        style={{ minWidth: 180 }}
                      >
                        <option value="">— Select —</option>
                        {INVENTORY_ITEMS.map(item => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </select>
                      {row.itemName === 'Other' && (
                        <input
                          className="settings-form__input"
                          style={{ marginTop: 4 }}
                          placeholder="Specify item..."
                          value={row.itemNameOther}
                          onChange={e => updateRow(idx, 'itemNameOther', e.target.value)}
                          required
                        />
                      )}
                    </td>

                    {/* Qty */}
                    <td style={TD}>
                      <input
                        className="settings-form__input"
                        type="number"
                        min={1}
                        value={row.quantity}
                        onChange={e => updateRow(idx, 'quantity', e.target.value)}
                        required
                        style={{ width: 64 }}
                      />
                    </td>

                    {/* Action */}
                    <td style={TD}>
                      <select
                        className="settings-form__input"
                        value={row.actionTaken}
                        onChange={e => updateRow(idx, 'actionTaken', e.target.value)}
                        required
                        style={{ minWidth: 110 }}
                      >
                        <option value="">— Select —</option>
                        {ACTION_OPTIONS.map(a => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    </td>

                    {/* Condition */}
                    <td style={TD}>
                      <select
                        className="settings-form__input"
                        value={row.condition}
                        onChange={e => updateRow(idx, 'condition', e.target.value)}
                        style={{ minWidth: 90 }}
                      >
                        <option value="">— Optional —</option>
                        {ITEM_CONDITIONS.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </td>

                    {/* Assigned To */}
                    <td style={TD}>
                      <select
                        className="settings-form__input"
                        value={row.assignedTo}
                        onChange={e => updateRow(idx, 'assignedTo', e.target.value)}
                        style={{ minWidth: 130 }}
                      >
                        <option value="">— None —</option>
                        {memberNames.map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                        <option value="Other...">Other...</option>
                      </select>
                      {row.assignedTo === 'Other...' && (
                        <input
                          className="settings-form__input"
                          style={{ marginTop: 4 }}
                          placeholder="Specify name..."
                          value={row.assignedToOther}
                          onChange={e => updateRow(idx, 'assignedToOther', e.target.value)}
                        />
                      )}
                    </td>

                    {/* Notes */}
                    <td style={TD}>
                      <input
                        className="settings-form__input"
                        type="text"
                        value={row.notes}
                        onChange={e => updateRow(idx, 'notes', e.target.value)}
                        style={{ minWidth: 120 }}
                      />
                    </td>

                    {/* Delete */}
                    <td style={TD}>
                      {rows.length > 1 && (
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => removeRow(idx)}
                          title="Remove row"
                          style={{ color: 'var(--color-error, #ef4444)', padding: '4px 6px' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 12 }}>
            <button type="button" className="btn btn--ghost btn--sm" onClick={addRow}>
              <Plus size={15} /> Add Row
            </button>
          </div>

          <div className="settings-form__actions" style={{ marginTop: 20 }}>
            <button type="submit" disabled={status === 'saving'} className="btn btn--primary">
              <Send size={18} />
              {status === 'saving' ? 'Submitting...' : 'Submit Report'}
            </button>

            {status === 'success' && (
              <span className="settings-form__status settings-form__status--success">
                <CheckCircle2 size={18} /> Report submitted successfully!
              </span>
            )}
            {status === 'error' && (
              <span className="settings-form__status settings-form__status--error">
                <AlertCircle size={18} /> Failed to submit. {errorMsg}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// DashSheet — Office Admin Weekly Report Form
// ==========================================
import { useState, FormEvent } from 'react';
import { CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { submitOfficeAdminWeeklyReport } from '../../services/dataApi';
import { todayISO, isoToDDMMYYYY } from '../../lib/dateUtils';
import { Member, OAInventoryRow, OAInfrastructureRow, OfficeAdminWeeklyReport } from '../../types';
import FormField from '../../components/form/FormField';

const TH: React.CSSProperties = { padding: '6px 8px', background: 'var(--color-surface)', fontWeight: 600, fontSize: 12, textAlign: 'left', whiteSpace: 'nowrap', borderBottom: '1px solid var(--color-border)' };
const TD: React.CSSProperties = { padding: '4px 6px', verticalAlign: 'top', borderBottom: '1px solid var(--color-border)' };

const INFRA_ROWS = [
  { utility: 'Electricity', statusOptions: ['Available', 'Issue'] },
  { utility: 'AC / Fans', statusOptions: ['Working', 'Not Working'] },
  { utility: 'Lighting', statusOptions: ['Proper', 'Poor'] },
  { utility: 'Drinking Water', statusOptions: ['Available', 'Not Available'] },
  { utility: 'Internet / Wi-Fi', statusOptions: ['Working', 'Not Working'] },
  { utility: 'Power Backup', statusOptions: ['Available', 'Not Available'] },
  { utility: 'Seating Arrangement', statusOptions: ['Done', 'Pending'] },
  { utility: 'Cleanliness', statusOptions: ['Done', 'Pending'] },
];

const INVENTORY_ITEMS = [
  'A4 Paper', 'Pens', 'Markers', 'Files / Folders', 'Envelopes',
  'ID Cards / Tags', 'Attendance Sheets', 'Certificates', 'Printing Material', 'Banners / Standees',
];

function initInventoryStock(): OAInventoryRow[] {
  return INVENTORY_ITEMS.map(itemName => ({ itemName, openingStock: '', usedToday: '', balanceStock: '', reorderRequired: '', remarks: '' }));
}

function initInfrastructure(): OAInfrastructureRow[] {
  return INFRA_ROWS.map(r => ({ utility: r.utility, location: '', status: '', issueFound: '', actionTaken: '' }));
}

interface Props { adminMembers?: Member[]; }

export default function OfficeAdminWeeklyReportFormPage({ adminMembers }: Props = {}) {
  const { member } = useAuth();
  const isAdminMode = Boolean(adminMembers);
  const [adminSelectedMember, setAdminSelectedMember] = useState<Member | null>(null);
  const activeMember = isAdminMode ? adminSelectedMember : member;
  const [date, setDate] = useState(todayISO());

  const [inventoryStock, setInventoryStock] = useState<OAInventoryRow[]>(initInventoryStock);
  const [infrastructure, setInfrastructure] = useState<OAInfrastructureRow[]>(initInfrastructure);

  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const resetForm = () => {
    setDate(todayISO());
    setInventoryStock(initInventoryStock());
    setInfrastructure(initInfrastructure());
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeMember) return;
    setStatus('saving');
    try {
      const report: OfficeAdminWeeklyReport = {
        timestamp: new Date().toISOString(),
        staffName: activeMember.name,
        date: isoToDDMMYYYY(date),
        department: 'Career Development Center',
        inventoryStock,
        infrastructure,
      };
      await submitOfficeAdminWeeklyReport(report);
      setStatus('success');
      resetForm();
      setTimeout(() => setStatus('idle'), 4000);
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="page-header">
          <div>
            <h2 className="page-title">Office Admin Weekly Report</h2>
          </div>
        </div>
        <div className="settings-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <CheckCircle2 size={48} style={{ color: 'var(--color-success)', margin: '0 auto 16px' }} />
          <h3 style={{ marginBottom: 8 }}>Report Submitted Successfully!</h3>
          <p className="settings-card__desc">Your weekly report has been recorded.</p>
          <button className="btn btn--primary" style={{ marginTop: 20 }} onClick={() => setStatus('idle')}>
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">Office Admin Weekly Report</h2>
          <p className="page-subtitle">Weekly inventory and infrastructure readiness report</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {isAdminMode && (
          <div className="settings-card">
            <div className="form-section-title" style={{ marginBottom: 12 }}>Select Office Admin &amp; Date</div>
            <div className="form-grid form-grid--2">
              <div className="settings-form__field">
                <label className="settings-form__label">Office Admin</label>
                <select className="settings-form__input" value={adminSelectedMember?.id ?? ''}
                  onChange={e => {
                    const m = adminMembers!.find(m => m.id === e.target.value) ?? null;
                    setAdminSelectedMember(m);
                  }}>
                  <option value="">— Select office admin —</option>
                  {adminMembers!.filter(m => m.role === 'OfficeAdmin' || m.role === 'SuperAdmin').map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.department})</option>
                  ))}
                </select>
              </div>
              <div className="settings-form__field">
                <label className="settings-form__label">Date</label>
                <input type="date" className="settings-form__input" value={date} onChange={e => setDate(e.target.value)} required />
              </div>
            </div>
          </div>
        )}

        {/* Header Fields */}
        <div className="settings-card">
          <div className="form-grid form-grid--3">
            <FormField label="Name" name="staffName" value={activeMember?.name ?? ''} onChange={() => {}} readOnly />
            <FormField label="Date" name="date" type="date" value={date} onChange={isAdminMode ? setDate : () => {}} readOnly={!isAdminMode} required />
            <FormField label="Department" name="department" value="Career Development Center" onChange={() => {}} readOnly />
          </div>
        </div>

        {/* Section 2 — Inventory / Stock / Stationery Report */}
        <div className="settings-card">
          <div className="form-section-title">2. Inventory / Stock / Stationery Report</div>
          <div className="tbl-scroll">
            <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%', minWidth: 640 }}>
              <thead>
                <tr>
                  {['Item Name', 'Opening Stock', 'Used Today', 'Balance Stock', 'Reorder Required', 'Remarks'].map(h => <th key={h} style={TH}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {inventoryStock.map((row, i) => (
                  <tr key={i}>
                    <td style={{ ...TD, minWidth: 150 }}><span style={{ fontSize: 12, opacity: 0.85 }}>{row.itemName}</span></td>
                    <td style={{ ...TD, minWidth: 100 }}>
                      <input type="number" className="settings-form__input" style={{ minWidth: 80 }} value={row.openingStock}
                        onChange={e => setInventoryStock(prev => prev.map((r, j) => j === i ? { ...r, openingStock: e.target.value } : r))}
                        placeholder="0" min={0} />
                    </td>
                    <td style={{ ...TD, minWidth: 90 }}>
                      <input type="number" className="settings-form__input" style={{ minWidth: 70 }} value={row.usedToday}
                        onChange={e => setInventoryStock(prev => prev.map((r, j) => j === i ? { ...r, usedToday: e.target.value } : r))}
                        placeholder="0" min={0} />
                    </td>
                    <td style={{ ...TD, minWidth: 100 }}>
                      <input type="number" className="settings-form__input" style={{ minWidth: 80 }} value={row.balanceStock}
                        onChange={e => setInventoryStock(prev => prev.map((r, j) => j === i ? { ...r, balanceStock: e.target.value } : r))}
                        placeholder="0" min={0} />
                    </td>
                    <td style={{ ...TD, minWidth: 110 }}>
                      <select className="settings-form__input" style={{ minWidth: 90 }} value={row.reorderRequired}
                        onChange={e => setInventoryStock(prev => prev.map((r, j) => j === i ? { ...r, reorderRequired: e.target.value } : r))}>
                        <option value="">Select...</option>
                        <option>Yes</option>
                        <option>No</option>
                      </select>
                    </td>
                    <td style={{ ...TD, minWidth: 150 }}>
                      <input className="settings-form__input" style={{ minWidth: 130 }} value={row.remarks}
                        onChange={e => setInventoryStock(prev => prev.map((r, j) => j === i ? { ...r, remarks: e.target.value } : r))}
                        placeholder="Remarks" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3 — Infrastructure / Utilities Readiness Report */}
        <div className="settings-card">
          <div className="form-section-title">3. Infrastructure / Utilities Readiness Report</div>
          <div className="tbl-scroll">
            <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%', minWidth: 620 }}>
              <thead>
                <tr>
                  {['Utility / Facility', 'Location', 'Status', 'Issue Found', 'Action Taken'].map(h => <th key={h} style={TH}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {infrastructure.map((row, i) => (
                  <tr key={i}>
                    <td style={{ ...TD, minWidth: 140 }}><span style={{ fontSize: 12, opacity: 0.85 }}>{row.utility}</span></td>
                    <td style={{ ...TD, minWidth: 120 }}>
                      <input className="settings-form__input" style={{ minWidth: 100 }} value={row.location}
                        onChange={e => setInfrastructure(prev => prev.map((r, j) => j === i ? { ...r, location: e.target.value } : r))}
                        placeholder="Location" />
                    </td>
                    <td style={{ ...TD, minWidth: 120 }}>
                      <select className="settings-form__input" style={{ minWidth: 100 }} value={row.status}
                        onChange={e => setInfrastructure(prev => prev.map((r, j) => j === i ? { ...r, status: e.target.value } : r))}>
                        <option value=""></option>
                        {INFRA_ROWS[i]?.statusOptions.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </td>
                    <td style={{ ...TD, minWidth: 140 }}>
                      <input className="settings-form__input" style={{ minWidth: 120 }} value={row.issueFound}
                        onChange={e => setInfrastructure(prev => prev.map((r, j) => j === i ? { ...r, issueFound: e.target.value } : r))}
                        placeholder="Issue" />
                    </td>
                    <td style={{ ...TD, minWidth: 140 }}>
                      <input className="settings-form__input" style={{ minWidth: 120 }} value={row.actionTaken}
                        onChange={e => setInfrastructure(prev => prev.map((r, j) => j === i ? { ...r, actionTaken: e.target.value } : r))}
                        placeholder="Action" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Submit */}
        <div className="settings-card">
          <div className="settings-form__actions">
            <button type="submit" disabled={status === 'saving'} className="btn btn--primary">
              <Send size={18} />
              {status === 'saving' ? 'Submitting...' : 'Submit Report'}
            </button>
            {status === 'error' && (
              <span className="settings-form__status settings-form__status--error">
                <AlertCircle size={18} /> Failed to submit. Please try again.
              </span>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

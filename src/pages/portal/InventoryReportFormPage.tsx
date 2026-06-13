// ==========================================
// DashSheet — Inventory Report Form Page
// ==========================================
import { useState, FormEvent } from 'react';
import { CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { submitOfficeAdminReport } from '../../services/dataApi';
import { todayISO, isoToDDMMYYYY } from '../../lib/dateUtils';
import { INVENTORY_ITEMS, ITEM_CATEGORIES, ITEM_CONDITIONS, ACTIONS_TAKEN } from '../../data/constants';
import { OfficeAdminReport } from '../../types';
import FormField from '../../components/form/FormField';
import FormSelect from '../../components/form/FormSelect';
import FormTextarea from '../../components/form/FormTextarea';

export default function InventoryReportFormPage() {
  const { member } = useAuth();
  const [date, setDate] = useState(todayISO());
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [condition, setCondition] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const resetForm = () => {
    setDate(todayISO());
    setItemName(''); setItemCategory(''); setQuantity('');
    setCondition(''); setActionTaken(''); setLocation(''); setNotes('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!member) return;
    setStatus('saving');
    try {
      const report: OfficeAdminReport = {
        timestamp: new Date().toISOString(),
        staffName: member.name,
        date: isoToDDMMYYYY(date),
        itemName,
        itemCategory: itemCategory as OfficeAdminReport['itemCategory'],
        quantity: Number(quantity) || 0,
        condition: condition as OfficeAdminReport['condition'],
        actionTaken: actionTaken as OfficeAdminReport['actionTaken'],
        location,
        notes
      };
      await submitOfficeAdminReport(report);
      setStatus('success');
      resetForm();
      setTimeout(() => setStatus('idle'), 4000);
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Inventory Report</h2>
          <p className="page-subtitle">Log an inventory item update</p>
        </div>
      </div>

      <div className="settings-card">
        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-grid">
            <FormField label="Staff Name" name="staffName" value={member?.name ?? ''} onChange={() => {}} readOnly />
            <FormField label="Date" name="date" type="date" value={date} onChange={setDate} required />
          </div>

          <div className="form-grid">
            <FormSelect label="Item Name" name="itemName" value={itemName} onChange={setItemName} options={INVENTORY_ITEMS} required />
            <FormSelect label="Item Category" name="itemCategory" value={itemCategory} onChange={setItemCategory} options={ITEM_CATEGORIES} required />
          </div>

          <div className="form-grid form-grid--3">
            <FormField label="Quantity" name="quantity" type="number" value={quantity} onChange={setQuantity} required min={0} />
            <FormSelect label="Condition" name="condition" value={condition} onChange={setCondition} options={ITEM_CONDITIONS} required />
            <FormSelect label="Action Taken" name="actionTaken" value={actionTaken} onChange={setActionTaken} options={ACTIONS_TAKEN} required />
          </div>

          <FormField label="Location" name="location" value={location} onChange={setLocation} required />
          <FormTextarea label="Notes" name="notes" value={notes} onChange={setNotes} rows={3} />

          <div className="settings-form__actions">
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
                <AlertCircle size={18} /> Failed to submit report. Please try again.
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// DashSheet — SuperAdmin Customization Page
// Manage dropdown options, custom form fields,
// and staff members
// ==========================================
import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import {
  fetchFieldOptions, fetchCustomFields, fetchSheetData,
  addFieldOption, updateFieldOption, deleteFieldOption,
  upsertCustomField, deleteCustomField,
  upsertMember, deleteMember
} from '../services/dataApi';
import {
  FieldOption, CustomField, CustomFieldType, CustomFieldFormType,
  Member, MemberRole
} from '../types';
import {
  OPTION_CATEGORIES, COLLEGE_OPTION_CATEGORY, CollegeCourseSpec, mergeOptions,
  mergeOptionsDetailed, mergeCollegeCourseSpecsDetailed, hiddenCategory,
  OptionItem, CollegeCourseSpecItem
} from '../lib/options';
import { DEPARTMENTS, BATCHES, COLLEGES_COURSES_SPECIALIZATIONS } from '../data/constants';
import FormField from '../components/form/FormField';
import FormSelect from '../components/form/FormSelect';

type Tab = 'options' | 'fields' | 'members';

const FIELD_TYPES: CustomFieldType[] = ['text', 'number', 'textarea', 'select', 'checkbox', 'date'];
const FORM_TYPES: CustomFieldFormType[] = ['training', 'work', 'inventory', 'placement'];
const FORM_TYPE_LABELS: Record<CustomFieldFormType, string> = {
  training: 'Training Report',
  work: 'Work Report',
  inventory: 'Inventory Report',
  placement: 'Placement Sourcing Report'
};
const ROLES: MemberRole[] = ['Trainer', 'Admin', 'OfficeAdmin', 'Placement', 'SuperAdmin'];

const ALL_OPTION_CATEGORIES = [
  ...OPTION_CATEGORIES,
  { key: COLLEGE_OPTION_CATEGORY, label: 'College / Course / Specialization' }
];

const EMPTY_MEMBER_FORM = {
  id: undefined as string | undefined,
  name: '', department: '', batch: '', email: '',
  role: 'Trainer' as MemberRole, username: '', password: ''
};

export default function SuperAdminPage() {
  const [tab, setTab] = useState<Tab>('options');
  const [fieldOptions, setFieldOptions] = useState<FieldOption[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    const [opts, fields, data] = await Promise.all([
      fetchFieldOptions(), fetchCustomFields(), fetchSheetData()
    ]);
    setFieldOptions(opts);
    setCustomFields(fields);
    setMembers(data.members);
    setLoading(false);
  };

  useEffect(() => { reload(); }, []);

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">SuperAdmin Customization</h2>
          <p className="page-subtitle">Manage dropdown options, custom form fields, and staff accounts</p>
        </div>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'options' ? 'admin-tab--active' : ''}`} onClick={() => setTab('options')}>
          Dropdown Options
        </button>
        <button className={`admin-tab ${tab === 'fields' ? 'admin-tab--active' : ''}`} onClick={() => setTab('fields')}>
          Custom Form Fields
        </button>
        <button className={`admin-tab ${tab === 'members' ? 'admin-tab--active' : ''}`} onClick={() => setTab('members')}>
          Staff Members
        </button>
      </div>

      {loading ? (
        <div className="settings-card"><p className="settings-card__desc">Loading...</p></div>
      ) : (
        <>
          {tab === 'options' && <OptionsTab fieldOptions={fieldOptions} onChange={reload} />}
          {tab === 'fields' && <FieldsTab customFields={customFields} onChange={reload} />}
          {tab === 'members' && <MembersTab members={members} fieldOptions={fieldOptions} onChange={reload} />}
        </>
      )}
    </div>
  );
}

// ==========================================
// Dropdown Options Tab
// ==========================================
function OptionsTab({ fieldOptions, onChange }: { fieldOptions: FieldOption[]; onChange: () => void }) {
  const [category, setCategory] = useState(ALL_OPTION_CATEGORIES[0].key);
  const [label, setLabel] = useState('');
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [saving, setSaving] = useState(false);

  // Inline editing state — simple categories (single label)
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Inline editing state — college/course/specialization
  const [editCollege, setEditCollege] = useState('');
  const [editCourse, setEditCourse] = useState('');
  const [editSpecialization, setEditSpecialization] = useState('');

  const isCollege = category === COLLEGE_OPTION_CATEGORY;
  const categoryLabel = ALL_OPTION_CATEGORIES.find(c => c.key === category)?.label ?? '';

  const items = isCollege ? [] : mergeOptionsDetailed(category, fieldOptions);
  const collegeItems = isCollege ? mergeCollegeCourseSpecsDetailed(COLLEGES_COURSES_SPECIALIZATIONS, fieldOptions) : [];

  const changeCategory = (v: string) => {
    const match = ALL_OPTION_CATEGORIES.find(c => c.label === v);
    if (match) setCategory(match.key);
    setEditingKey(null);
  };

  const handleAdd = async () => {
    setSaving(true);
    try {
      if (isCollege) {
        if (!college || !course) return;
        const spec: CollegeCourseSpec = { college, course, specialization };
        const display = `${college} — ${course}${specialization ? ` (${specialization})` : ''}`;
        await addFieldOption(category, JSON.stringify(spec), display);
        setCollege(''); setCourse(''); setSpecialization('');
      } else {
        if (!label.trim()) return;
        await addFieldOption(category, label.trim(), label.trim());
        setLabel('');
      }
      await onChange();
    } finally {
      setSaving(false);
    }
  };

  // --- Simple (single-label) categories ---

  const startEdit = (item: OptionItem) => {
    setEditingKey(item.key);
    setEditValue(item.label);
  };

  const cancelEdit = () => setEditingKey(null);

  const saveEdit = async (item: OptionItem) => {
    const newLabel = editValue.trim();
    if (!newLabel) return;
    setSaving(true);
    try {
      if (item.isStatic) {
        if (newLabel !== item.value) {
          await addFieldOption(hiddenCategory(category), item.value, item.value);
          await addFieldOption(category, newLabel, newLabel);
        }
      } else if (item.id && newLabel !== item.label) {
        await updateFieldOption(item.id, newLabel, newLabel);
      }
      setEditingKey(null);
      await onChange();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (item: OptionItem) => {
    setSaving(true);
    try {
      if (item.isStatic) {
        await addFieldOption(hiddenCategory(category), item.value, item.value);
      } else if (item.id) {
        await deleteFieldOption(item.id);
      }
      await onChange();
    } finally {
      setSaving(false);
    }
  };

  // --- College / Course / Specialization category ---

  const startEditCollege = (item: CollegeCourseSpecItem) => {
    setEditingKey(item.key);
    setEditCollege(item.spec.college);
    setEditCourse(item.spec.course);
    setEditSpecialization(item.spec.specialization);
  };

  const saveEditCollege = async (item: CollegeCourseSpecItem) => {
    if (!editCollege.trim() || !editCourse.trim()) return;
    const newSpec: CollegeCourseSpec = { college: editCollege.trim(), course: editCourse.trim(), specialization: editSpecialization.trim() };
    const display = `${newSpec.college} — ${newSpec.course}${newSpec.specialization ? ` (${newSpec.specialization})` : ''}`;
    setSaving(true);
    try {
      if (item.isStatic) {
        const oldKey = JSON.stringify(item.spec);
        await addFieldOption(hiddenCategory(COLLEGE_OPTION_CATEGORY), oldKey, oldKey);
        await addFieldOption(COLLEGE_OPTION_CATEGORY, JSON.stringify(newSpec), display);
      } else if (item.id) {
        await updateFieldOption(item.id, JSON.stringify(newSpec), display);
      }
      setEditingKey(null);
      await onChange();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCollegeItem = async (item: CollegeCourseSpecItem) => {
    setSaving(true);
    try {
      if (item.isStatic) {
        const key = JSON.stringify(item.spec);
        await addFieldOption(hiddenCategory(COLLEGE_OPTION_CATEGORY), key, key);
      } else if (item.id) {
        await deleteFieldOption(item.id);
      }
      await onChange();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-card">
      <h3>Dropdown Options</h3>
      <p className="settings-card__desc">
        Add, edit, or remove choices for dropdown menus used across the portal forms — including
        the built-in defaults. Changes appear in the forms immediately.
      </p>

      <div className="form-grid" style={{ marginBottom: 16 }}>
        <FormSelect
          label="Category"
          name="category"
          value={categoryLabel}
          onChange={changeCategory}
          options={ALL_OPTION_CATEGORIES.map(c => c.label)}
        />
      </div>

      {isCollege ? (
        <div className="form-grid form-grid--3" style={{ marginBottom: 16 }}>
          <FormField label="College" name="college" value={college} onChange={setCollege} placeholder="College name" />
          <FormField label="Course" name="course" value={course} onChange={setCourse} placeholder="e.g. B. Tech." />
          <FormField label="Specialization (optional)" name="specialization" value={specialization} onChange={setSpecialization} placeholder="e.g. CSE" />
        </div>
      ) : (
        <div className="form-grid" style={{ marginBottom: 16 }}>
          <FormField label="New Option" name="label" value={label} onChange={setLabel} placeholder="Enter new option value" />
        </div>
      )}

      <button className="btn btn--primary" onClick={handleAdd} disabled={saving}>
        <Plus size={16} /> Add Option
      </button>

      <div className="admin-list">
        {isCollege ? (
          <>
            {collegeItems.length === 0 && <p className="settings-card__desc" style={{ marginTop: 16 }}>No options available for this category.</p>}
            {collegeItems.map(item => (
              <div className="admin-list__row" key={item.key}>
                {editingKey === item.key ? (
                  <>
                    <div className="form-grid form-grid--3" style={{ flex: 1 }}>
                      <FormField label="College" name="editCollege" value={editCollege} onChange={setEditCollege} />
                      <FormField label="Course" name="editCourse" value={editCourse} onChange={setEditCourse} />
                      <FormField label="Specialization" name="editSpecialization" value={editSpecialization} onChange={setEditSpecialization} />
                    </div>
                    <div className="admin-list__actions">
                      <button className="btn btn--ghost btn--sm" onClick={() => saveEditCollege(item)} disabled={saving} aria-label="Save option">
                        <Check size={14} />
                      </button>
                      <button className="btn btn--ghost btn--sm" onClick={cancelEdit} aria-label="Cancel edit">
                        <X size={14} />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span>
                      {item.spec.college} — {item.spec.course}{item.spec.specialization ? ` (${item.spec.specialization})` : ''}
                      {item.isStatic && <em style={{ opacity: 0.6 }}> (default)</em>}
                    </span>
                    <div className="admin-list__actions">
                      <button className="btn btn--ghost btn--sm" onClick={() => startEditCollege(item)} aria-label="Edit option">
                        <Pencil size={14} />
                      </button>
                      <button className="btn btn--ghost btn--sm" onClick={() => handleDeleteCollegeItem(item)} aria-label="Delete option">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </>
        ) : (
          <>
            {items.length === 0 && <p className="settings-card__desc" style={{ marginTop: 16 }}>No options available for this category.</p>}
            {items.map(item => (
              <div className="admin-list__row" key={item.key}>
                {editingKey === item.key ? (
                  <>
                    <input
                      className="settings-form__input"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <div className="admin-list__actions">
                      <button className="btn btn--ghost btn--sm" onClick={() => saveEdit(item)} disabled={saving} aria-label="Save option">
                        <Check size={14} />
                      </button>
                      <button className="btn btn--ghost btn--sm" onClick={cancelEdit} aria-label="Cancel edit">
                        <X size={14} />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span>
                      {item.label}
                      {item.isStatic && <em style={{ opacity: 0.6 }}> (default)</em>}
                    </span>
                    <div className="admin-list__actions">
                      <button className="btn btn--ghost btn--sm" onClick={() => startEdit(item)} aria-label="Edit option">
                        <Pencil size={14} />
                      </button>
                      <button className="btn btn--ghost btn--sm" onClick={() => handleDeleteItem(item)} aria-label="Delete option">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ==========================================
// Custom Form Fields Tab
// ==========================================
const EMPTY_FIELD_FORM = {
  id: undefined as string | undefined,
  formType: 'training' as CustomFieldFormType,
  fieldKey: '',
  label: '',
  fieldType: 'text' as CustomFieldType,
  optionsText: '',
  required: false
};

function FieldsTab({ customFields, onChange }: { customFields: CustomField[]; onChange: () => void }) {
  const [formType, setFormType] = useState<CustomFieldFormType>('training');
  const [form, setForm] = useState(EMPTY_FIELD_FORM);
  const [saving, setSaving] = useState(false);

  const filtered = customFields.filter(f => f.formType === formType);

  const startEdit = (field: CustomField) => {
    setForm({
      id: field.id,
      formType: field.formType,
      fieldKey: field.fieldKey,
      label: field.label,
      fieldType: field.fieldType,
      optionsText: field.options.join(', '),
      required: field.required
    });
    setFormType(field.formType);
  };

  const resetForm = () => setForm({ ...EMPTY_FIELD_FORM, formType });

  const handleSave = async () => {
    if (!form.label.trim()) return;
    const fieldKey = form.fieldKey.trim() || form.label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    setSaving(true);
    try {
      await upsertCustomField({
        id: form.id,
        formType,
        fieldKey,
        label: form.label.trim(),
        fieldType: form.fieldType,
        options: form.fieldType === 'select'
          ? form.optionsText.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        required: form.required
      });
      resetForm();
      await onChange();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteCustomField(id);
    if (form.id === id) resetForm();
    await onChange();
  };

  return (
    <div className="settings-card">
      <h3>Custom Form Fields</h3>
      <p className="settings-card__desc">
        Add brand-new fields to any of the 4 portal report forms. They will appear under an
        "Additional Fields" section and their values are saved with each submission.
      </p>

      <div className="form-grid" style={{ marginBottom: 16 }}>
        <FormSelect
          label="Form"
          name="formType"
          value={FORM_TYPE_LABELS[formType]}
          onChange={v => {
            const match = (Object.entries(FORM_TYPE_LABELS) as [CustomFieldFormType, string][]).find(([, label]) => label === v);
            if (match) { setFormType(match[0]); setForm(f => ({ ...f, formType: match[0] })); }
          }}
          options={FORM_TYPES.map(ft => FORM_TYPE_LABELS[ft])}
        />
      </div>

      <div className="form-grid form-grid--3" style={{ marginBottom: 16 }}>
        <FormField label="Field Label" name="label" value={form.label} onChange={v => setForm(f => ({ ...f, label: v }))} placeholder="e.g. Trainer Mood" />
        <FormSelect
          label="Field Type"
          name="fieldType"
          value={form.fieldType}
          onChange={v => setForm(f => ({ ...f, fieldType: v as CustomFieldType }))}
          options={FIELD_TYPES}
        />
        <FormField label="Field Key (optional)" name="fieldKey" value={form.fieldKey} onChange={v => setForm(f => ({ ...f, fieldKey: v }))} placeholder="auto-generated if blank" />
      </div>

      {form.fieldType === 'select' && (
        <div className="form-grid" style={{ marginBottom: 16 }}>
          <FormField label="Options (comma-separated)" name="optionsText" value={form.optionsText} onChange={v => setForm(f => ({ ...f, optionsText: v }))} placeholder="Option A, Option B, Option C" />
        </div>
      )}

      <label className="form-checkbox-inline" style={{ marginBottom: 16, display: 'inline-flex' }}>
        <input type="checkbox" checked={form.required} onChange={e => setForm(f => ({ ...f, required: e.target.checked }))} />
        Required field
      </label>

      <div className="settings-form__actions" style={{ marginBottom: 8 }}>
        <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
          {form.id ? <Pencil size={16} /> : <Plus size={16} />}
          {form.id ? 'Update Field' : 'Add Field'}
        </button>
        {form.id && (
          <button className="btn btn--ghost" onClick={resetForm}>
            <X size={16} /> Cancel
          </button>
        )}
      </div>

      <div className="admin-list">
        {filtered.length === 0 && <p className="settings-card__desc" style={{ marginTop: 16 }}>No custom fields added yet for {FORM_TYPE_LABELS[formType]}.</p>}
        {filtered.map(f => (
          <div className="admin-list__row" key={f.id}>
            <span>
              {f.label} <span className="admin-list__meta">({f.fieldType}{f.required ? ', required' : ''})</span>
            </span>
            <div className="admin-list__actions">
              <button className="btn btn--ghost btn--sm" onClick={() => startEdit(f)} aria-label="Edit field">
                <Pencil size={14} />
              </button>
              <button className="btn btn--ghost btn--sm" onClick={() => handleDelete(f.id)} aria-label="Delete field">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// Staff Members Tab
// ==========================================
function MembersTab({ members, fieldOptions, onChange }: { members: Member[]; fieldOptions: FieldOption[]; onChange: () => void }) {
  const [form, setForm] = useState(EMPTY_MEMBER_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const departments = [...mergeOptions(DEPARTMENTS, fieldOptions, 'departments'), '-'];
  const batches = [...mergeOptions(BATCHES, fieldOptions, 'batches'), '-'];

  const startEdit = (m: Member) => {
    setForm({ id: m.id, name: m.name, department: m.department, batch: m.batch, email: m.email, role: m.role, username: m.username, password: '' });
    setError('');
  };

  const resetForm = () => { setForm(EMPTY_MEMBER_FORM); setError(''); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.username.trim() || !form.email.trim()) {
      setError('Name, email, and username are required.');
      return;
    }
    if (!form.id && !form.password.trim()) {
      setError('Password is required for new members.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await upsertMember({
        id: form.id,
        name: form.name.trim(),
        department: form.department.trim() || '-',
        batch: form.batch.trim() || '-',
        email: form.email.trim(),
        role: form.role,
        username: form.username.trim(),
        password: form.password.trim() || undefined
      });
      resetForm();
      await onChange();
    } catch (err: any) {
      setError(err?.message || 'Failed to save member.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteMember(id);
    if (form.id === id) resetForm();
    await onChange();
  };

  return (
    <div className="settings-card">
      <h3>Staff Members</h3>
      <p className="settings-card__desc">
        Add, edit, or remove staff accounts. Leave password blank when editing to keep the
        existing password.
      </p>

      <div className="form-grid form-grid--3" style={{ marginBottom: 12 }}>
        <FormField label="Full Name" name="name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} required />
        <FormField label="Email" name="email" type="email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} required />
        <FormSelect label="Role" name="role" value={form.role} onChange={v => setForm(f => ({ ...f, role: v as MemberRole }))} options={ROLES} />
      </div>
      <div className="form-grid form-grid--3" style={{ marginBottom: 12 }}>
        <FormSelect label="Department" name="department" value={form.department} onChange={v => setForm(f => ({ ...f, department: v }))} options={departments} />
        <FormSelect label="Batch" name="batch" value={form.batch} onChange={v => setForm(f => ({ ...f, batch: v }))} options={batches} />
        <FormField label="Username" name="username" value={form.username} onChange={v => setForm(f => ({ ...f, username: v }))} required />
      </div>
      <div className="form-grid" style={{ marginBottom: 16 }}>
        <FormField label={form.id ? 'New Password (optional)' : 'Password'} name="password" type="password" value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))} />
      </div>

      {error && <p className="settings-form__status settings-form__status--error" style={{ marginBottom: 12 }}>{error}</p>}

      <div className="settings-form__actions" style={{ marginBottom: 16 }}>
        <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
          {form.id ? <Pencil size={16} /> : <Plus size={16} />}
          {form.id ? 'Update Member' : 'Add Member'}
        </button>
        {form.id && (
          <button className="btn btn--ghost" onClick={resetForm}>
            <X size={16} /> Cancel
          </button>
        )}
      </div>

      <div className="admin-list">
        {members.map(m => (
          <div className="admin-list__row" key={m.id}>
            <span>
              {m.name} <span className="admin-list__meta">— {m.username} · {m.role} · {m.department} / {m.batch}</span>
            </span>
            <div className="admin-list__actions">
              <button className="btn btn--ghost btn--sm" onClick={() => startEdit(m)} aria-label="Edit member">
                <Pencil size={14} />
              </button>
              <button className="btn btn--ghost btn--sm" onClick={() => handleDelete(m.id)} aria-label="Delete member">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

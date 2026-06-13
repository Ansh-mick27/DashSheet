// ==========================================
// DashSheet — Hook to load SuperAdmin-managed
// field options and custom fields for a form
// ==========================================
import { useEffect, useState } from 'react';
import { fetchFieldOptions, fetchCustomFields } from '../services/dataApi';
import { FieldOption, CustomField, CustomFieldFormType } from '../types';

export function useFormConfig(formType?: CustomFieldFormType) {
  const [fieldOptions, setFieldOptions] = useState<FieldOption[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([fetchFieldOptions(), fetchCustomFields()]).then(([opts, fields]) => {
      if (!active) return;
      setFieldOptions(opts);
      setCustomFields(formType ? fields.filter(f => f.formType === formType) : fields);
      setLoading(false);
    });
    return () => { active = false; };
  }, [formType]);

  return { fieldOptions, customFields, loading };
}

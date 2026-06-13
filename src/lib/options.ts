// ==========================================
// DashSheet — Dynamic option helpers
// Merges static constants with SuperAdmin-added field_options
// ==========================================
import { FieldOption } from '../types';

export interface CollegeCourseSpec {
  college: string;
  course: string;
  specialization: string;
}

export const OPTION_CATEGORIES: { key: string; label: string }[] = [
  { key: 'departments', label: 'Departments' },
  { key: 'batches', label: 'Batches' },
  { key: 'durations', label: 'Training Durations' },
  { key: 'participationLevels', label: 'Participation Levels' },
  { key: 'tasks', label: 'Work Report Tasks' },
  { key: 'inventoryItems', label: 'Inventory Items' },
  { key: 'itemCategories', label: 'Inventory Categories' },
  { key: 'itemConditions', label: 'Inventory Conditions' },
  { key: 'actionsTaken', label: 'Inventory Actions Taken' },
  { key: 'industrySectors', label: 'Industry Sectors' },
  { key: 'companyTypes', label: 'Company Types' },
  { key: 'sourceChannels', label: 'Sourcing Channels' },
  { key: 'modesOfContact', label: 'Modes of Contact' },
  { key: 'placementStatuses', label: 'Placement Statuses' },
  { key: 'priorities', label: 'Priorities' },
  { key: 'assignedTo', label: 'Assigned To Options' }
];

export const COLLEGE_OPTION_CATEGORY = 'collegeCourseSpec';

export function mergeOptions(staticOptions: string[], fieldOptions: FieldOption[], category: string): string[] {
  const combined = [...staticOptions];
  fieldOptions
    .filter(f => f.category === category)
    .forEach(f => { if (f.label && !combined.includes(f.label)) combined.push(f.label); });
  return combined;
}

export function mergeCollegeCourseSpecs(staticList: CollegeCourseSpec[], fieldOptions: FieldOption[]): CollegeCourseSpec[] {
  const extras = fieldOptions
    .filter(f => f.category === COLLEGE_OPTION_CATEGORY)
    .map(f => {
      try {
        return JSON.parse(f.value) as CollegeCourseSpec;
      } catch {
        return null;
      }
    })
    .filter((x): x is CollegeCourseSpec => !!x);
  return [...staticList, ...extras];
}

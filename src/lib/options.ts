// ==========================================
// DashSheet — Dynamic option helpers
// Merges static constants with SuperAdmin-added field_options
// ==========================================
import { FieldOption } from '../types';
import {
  DEPARTMENTS, BATCHES, DURATIONS, PARTICIPATION_LEVELS, TEACHING_METHODS,
  TIME_SLOTS, TASKS, TASK_STATUSES, INVENTORY_ITEMS, ITEM_CATEGORIES,
  ITEM_CONDITIONS, ACTIONS_TAKEN, INDUSTRY_SECTORS, COMPANY_TYPES,
  SOURCE_CHANNELS, MODES_OF_CONTACT, PLACEMENT_STATUSES, PRIORITIES,
  ASSIGNED_TO_OPTIONS
} from '../data/constants';

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
  { key: 'teachingMethods', label: 'Training Report Teaching Methods' },
  { key: 'timeSlots', label: 'Work Report Time Slots' },
  { key: 'tasks', label: 'Work Report Tasks' },
  { key: 'taskStatuses', label: 'Work Report Task Statuses' },
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

// Static defaults for each category, keyed the same as OPTION_CATEGORIES[].key.
export const STATIC_OPTIONS_MAP: Record<string, string[]> = {
  departments: DEPARTMENTS,
  batches: BATCHES,
  durations: DURATIONS,
  participationLevels: PARTICIPATION_LEVELS,
  teachingMethods: TEACHING_METHODS,
  timeSlots: TIME_SLOTS,
  tasks: TASKS,
  taskStatuses: TASK_STATUSES,
  inventoryItems: INVENTORY_ITEMS,
  itemCategories: ITEM_CATEGORIES,
  itemConditions: ITEM_CONDITIONS,
  actionsTaken: ACTIONS_TAKEN,
  industrySectors: INDUSTRY_SECTORS,
  companyTypes: COMPANY_TYPES,
  sourceChannels: SOURCE_CHANNELS,
  modesOfContact: MODES_OF_CONTACT,
  placementStatuses: PLACEMENT_STATUSES,
  priorities: PRIORITIES,
  assignedTo: ASSIGNED_TO_OPTIONS
};

export const COLLEGE_OPTION_CATEGORY = 'collegeCourseSpec';

// A "hidden" category (e.g. "timeSlots__hidden") stores labels/values of
// built-in static options that the SuperAdmin has removed or renamed.
export function hiddenCategory(category: string): string {
  return `${category}__hidden`;
}

function getHiddenValues(fieldOptions: FieldOption[], category: string): Set<string> {
  const hidden = hiddenCategory(category);
  return new Set(fieldOptions.filter(f => f.category === hidden).map(f => f.value));
}

export function mergeOptions(staticOptions: string[], fieldOptions: FieldOption[], category: string): string[] {
  const hidden = getHiddenValues(fieldOptions, category);
  const combined = staticOptions.filter(o => !hidden.has(o));
  fieldOptions
    .filter(f => f.category === category)
    .forEach(f => { if (f.label && !combined.includes(f.label)) combined.push(f.label); });
  return combined;
}

export interface OptionItem {
  // Stable key for React lists.
  key: string;
  value: string;
  label: string;
  // Present for SuperAdmin-added options; undefined for built-in defaults.
  id?: string;
  isStatic: boolean;
}

// Like mergeOptions, but returns metadata needed to edit/delete each entry
// (including built-in defaults, which can be hidden/renamed via field_options).
export function mergeOptionsDetailed(category: string, fieldOptions: FieldOption[]): OptionItem[] {
  const staticOptions = STATIC_OPTIONS_MAP[category] ?? [];
  const hidden = getHiddenValues(fieldOptions, category);
  const items: OptionItem[] = staticOptions
    .filter(o => !hidden.has(o))
    .map(o => ({ key: `static:${o}`, value: o, label: o, isStatic: true }));
  fieldOptions
    .filter(f => f.category === category)
    .forEach(f => items.push({ key: `field:${f.id}`, value: f.value, label: f.label, id: f.id, isStatic: false }));
  return items;
}

export function mergeCollegeCourseSpecs(staticList: CollegeCourseSpec[], fieldOptions: FieldOption[]): CollegeCourseSpec[] {
  const hidden = getHiddenValues(fieldOptions, COLLEGE_OPTION_CATEGORY);
  const visible = staticList.filter(s => !hidden.has(JSON.stringify(s)));
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
  return [...visible, ...extras];
}

export interface CollegeCourseSpecItem {
  key: string;
  spec: CollegeCourseSpec;
  id?: string;
  isStatic: boolean;
}

export function mergeCollegeCourseSpecsDetailed(staticList: CollegeCourseSpec[], fieldOptions: FieldOption[]): CollegeCourseSpecItem[] {
  const hidden = getHiddenValues(fieldOptions, COLLEGE_OPTION_CATEGORY);
  const items: CollegeCourseSpecItem[] = staticList
    .filter(s => !hidden.has(JSON.stringify(s)))
    .map(s => ({ key: `static:${JSON.stringify(s)}`, spec: s, isStatic: true }));
  fieldOptions
    .filter(f => f.category === COLLEGE_OPTION_CATEGORY)
    .forEach(f => {
      try {
        const spec = JSON.parse(f.value) as CollegeCourseSpec;
        items.push({ key: `field:${f.id}`, spec, id: f.id, isStatic: false });
      } catch { /* ignore malformed entries */ }
    });
  return items;
}

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
  ASSIGNED_TO_OPTIONS, ACTIVITY_PURPOSES
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
  { key: 'teachingMethods', label: 'Session Report Teaching Methods' },
  { key: 'timeSlots', label: 'Daily Work Report Time Slots' },
  { key: 'tasks', label: 'Daily Work Report Tasks' },
  { key: 'taskStatuses', label: 'Daily Work Report Task Statuses' },
  { key: 'inventoryItems', label: 'Inventory Items' },
  { key: 'itemCategories', label: 'Inventory Categories' },
  { key: 'itemConditions', label: 'Inventory Conditions' },
  { key: 'actionsTaken', label: 'Inventory Actions Taken' },
  { key: 'industrySectors', label: 'Industry Sectors' },
  { key: 'companyTypes', label: 'Company Types' },
  { key: 'sourceChannels', label: 'Sourcing Channels' },
  { key: 'modesOfContact', label: 'Modes of Contact' },
  { key: 'placementStatuses', label: 'CRP Process Statuses' },
  { key: 'priorities', label: 'Priorities' },
  { key: 'assignedTo', label: 'Assigned To Options' },
  { key: 'activityPurposes', label: 'CRP Process Activity Purposes' }
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
  assignedTo: ASSIGNED_TO_OPTIONS,
  activityPurposes: ACTIVITY_PURPOSES
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

export interface OptionItem {
  // Stable key for React lists.
  key: string;
  value: string;
  label: string;
  // Present for SuperAdmin-added options; undefined for built-in defaults.
  id?: string;
  isStatic: boolean;
  // Position in the merged list. Built-in defaults keep their original index
  // so a renamed default stays in its original slot rather than moving to the end.
  sortOrder: number;
}

// Like mergeOptions, but returns metadata needed to edit/delete each entry
// (including built-in defaults, which can be hidden/renamed via field_options),
// sorted into a stable display/usage order.
export function mergeOptionsDetailed(category: string, fieldOptions: FieldOption[]): OptionItem[] {
  const staticOptions = STATIC_OPTIONS_MAP[category] ?? [];
  const hidden = getHiddenValues(fieldOptions, category);
  const items: OptionItem[] = [];
  staticOptions.forEach((o, i) => {
    if (!hidden.has(o)) items.push({ key: `static:${o}`, value: o, label: o, isStatic: true, sortOrder: i });
  });
  fieldOptions
    .filter(f => f.category === category)
    .forEach(f => items.push({ key: `field:${f.id}`, value: f.value, label: f.label, id: f.id, isStatic: false, sortOrder: f.sortOrder }));
  items.sort((a, b) => a.sortOrder - b.sortOrder);
  return items;
}

export function mergeOptions(staticOptions: string[], fieldOptions: FieldOption[], category: string): string[] {
  return mergeOptionsDetailed(category, fieldOptions).map(item => item.label);
}

// Sort order to use for a brand-new option appended to the end of a category's list.
export function nextSortOrder(items: { sortOrder: number }[]): number {
  return items.reduce((max, item) => Math.max(max, item.sortOrder), -1) + 1;
}

// Training reports created before "methods" became a customizable
// {selected, other} object stored each method as its own boolean flag
// (e.g. { Lecture: true, "Group Discussion": false }). Support both shapes
// so charts built from older records still show data.
export function getSelectedMethods(methods: unknown): string[] {
  if (!methods || typeof methods !== 'object') return [];
  const m = methods as Record<string, unknown>;
  if (Array.isArray(m.selected)) return m.selected as string[];
  return Object.entries(m)
    .filter(([key, value]) => key !== 'other' && value === true)
    .map(([key]) => key);
}

export interface CollegeCourseSpecItem {
  key: string;
  spec: CollegeCourseSpec;
  id?: string;
  isStatic: boolean;
  sortOrder: number;
}

export function mergeCollegeCourseSpecsDetailed(staticList: CollegeCourseSpec[], fieldOptions: FieldOption[]): CollegeCourseSpecItem[] {
  const hidden = getHiddenValues(fieldOptions, COLLEGE_OPTION_CATEGORY);
  const items: CollegeCourseSpecItem[] = [];
  staticList.forEach((s, i) => {
    if (!hidden.has(JSON.stringify(s))) items.push({ key: `static:${JSON.stringify(s)}`, spec: s, isStatic: true, sortOrder: i });
  });
  fieldOptions
    .filter(f => f.category === COLLEGE_OPTION_CATEGORY)
    .forEach(f => {
      try {
        const spec = JSON.parse(f.value) as CollegeCourseSpec;
        items.push({ key: `field:${f.id}`, spec, id: f.id, isStatic: false, sortOrder: f.sortOrder });
      } catch { /* ignore malformed entries */ }
    });
  items.sort((a, b) => a.sortOrder - b.sortOrder);
  return items;
}

export function mergeCollegeCourseSpecs(staticList: CollegeCourseSpec[], fieldOptions: FieldOption[]): CollegeCourseSpec[] {
  return mergeCollegeCourseSpecsDetailed(staticList, fieldOptions).map(item => item.spec);
}

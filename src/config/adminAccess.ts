import { MemberRole } from '../types';

export interface AdminAccessConfig {
  title?: string;
  visibleRoles: MemberRole[];
  visibleDepartments?: string[];  // when set, only members in these departments are shown
  excludedMembers?: string[];
  includedMembers?: string[];  // specific names to include regardless of role/department
}

// Per-user admin access rules (keyed by lowercase member name).
// SuperAdmin users are handled separately and always see everything.
// Any Admin not listed here defaults to: all roles except SuperAdmin.
export const ADMIN_ACCESS_CONFIG: Record<string, AdminAccessConfig> = {
  'atul bharat': {
    visibleRoles: ['Admin', 'Trainer', 'Placement', 'OfficeAdmin'],
  },
  'amit mishra': {
    title: 'Training Head',
    visibleRoles: ['Trainer'],
    includedMembers: ['Shweta Bahrani'],
  },
  'rajesh tyagi': {
    title: 'Placement Head',
    visibleRoles: ['Placement', 'OfficeAdmin'],
  },
  'shweta bahrani': {
    title: 'Training Head Soft Skill & Communication',
    visibleRoles: ['Trainer'],
    visibleDepartments: ['Soft Skills', 'Communication Skills', 'Cognitive Skills'],
  },
};

export function getAdminAccess(memberName: string): AdminAccessConfig | null {
  return ADMIN_ACCESS_CONFIG[memberName.toLowerCase()] ?? null;
}

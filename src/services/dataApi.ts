// ==========================================
// DashSheet — Data Service (Supabase)
// ==========================================
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import {
  Member, MemberRole, TrainingReport, WorkReport, OfficeAdminReport, PlacementReport, Notification,
  FieldOption, CustomField, CustomFieldFormType, CustomFieldType, BranchStudentCount
} from '../types';
import {
  generateMembers, generateTrainingReports, generateWorkReports,
  generateOfficeAdminReports, generatePlacementReports
} from '../data/mockData';

interface SheetData {
  members: Member[];
  trainingReports: TrainingReport[];
  workReports: WorkReport[];
  officeAdminReports: OfficeAdminReport[];
  placementReports: PlacementReport[];
  fieldOptions: FieldOption[];
  customFields: CustomField[];
  branchStudentCounts: BranchStudentCount[];
}

let cachedData: SheetData | null = null;

function mapMember(row: any): Member {
  return {
    id: row.id,
    name: row.name,
    department: row.department,
    batch: row.batch,
    email: row.email,
    role: row.role,
    username: row.username
  };
}

function mapTrainingReport(row: any): TrainingReport {
  return {
    timestamp: row.timestamp,
    trainerName: row.trainer_name,
    date: row.date,
    college: row.college,
    course: row.course,
    specialization: row.specialization,
    topicCovered: row.topic_covered,
    learningObjectives: row.learning_objectives,
    duration: row.duration,
    methods: row.methods,
    studentsPresent: row.students_present,
    totalEnrolled: row.total_enrolled,
    participationLevel: row.participation_level,
    engagementObservations: row.engagement_observations,
    challengesTrainer: row.challenges_trainer,
    challengesStudent: row.challenges_student,
    actionPlan: row.action_plan,
    feedback: row.feedback,
    reviewedBy: row.reviewed_by,
    extraFields: row.extra_fields ?? {}
  };
}

function mapWorkReport(row: any): WorkReport {
  return {
    timestamp: row.timestamp,
    trainerName: row.trainer_name,
    date: row.date,
    department: row.department,
    batch: row.batch,
    timeSlots: row.time_slots,
    keyAccomplishments: row.key_accomplishments,
    challengesSolutions: row.challenges_solutions,
    pendingWork: row.pending_work,
    additionalNotes: row.additional_notes,
    extraFields: row.extra_fields ?? {}
  };
}

function mapOfficeAdminReport(row: any): OfficeAdminReport {
  return {
    timestamp: row.timestamp,
    staffName: row.staff_name,
    date: row.date,
    itemName: row.item_name,
    itemCode: row.item_code ?? '',
    itemCategory: row.item_category,
    quantity: row.quantity,
    condition: row.condition,
    actionTaken: row.action_taken,
    location: row.location,
    notes: row.notes,
    assignedTo: row.assigned_to ?? '',
    extraFields: row.extra_fields ?? {}
  };
}

function mapPlacementReport(row: any): PlacementReport {
  return {
    timestamp: row.timestamp,
    staffName: row.staff_name,
    companyName: row.company_name,
    industrySector: row.industry_sector,
    companyType: row.company_type,
    hqLocation: row.hq_location,
    contactPerson: row.contact_person,
    designation: row.designation,
    emailId: row.email_id,
    phoneNumber: row.phone_number,
    sourceChannel: row.source_channel,
    dateOfFirstContact: row.date_of_first_contact,
    modeOfContact: row.mode_of_contact,
    currentStatus: row.current_status,
    rolesOffered: row.roles_offered,
    numberOfOpenings: row.number_of_openings,
    ctcLPA: row.ctc_lpa,
    driveDate: row.drive_date,
    studentsSelected: row.students_selected,
    remarks: row.remarks,
    priority: row.priority,
    nextFollowUpDate: row.next_follow_up_date,
    actionRequired: row.action_required,
    assignedTo: row.assigned_to,
    followUpDone: row.follow_up_done,
    opportunityType: row.opportunity_type ?? '',
    activityStatus: row.activity_status ?? '',
    activityPurpose: row.activity_purpose ?? '',
    hiringMode: row.hiring_mode ?? '',
    hiringRounds: row.hiring_rounds ?? [],
    extraFields: row.extra_fields ?? {}
  };
}

function mapBranchStudentCount(row: any): BranchStudentCount {
  return {
    id: row.id,
    college: row.college,
    course: row.course,
    specialization: row.specialization ?? '',
    studentCount: row.student_count
  };
}

function mapFieldOption(row: any): FieldOption {
  return {
    id: row.id,
    category: row.category,
    value: row.value,
    label: row.label,
    sortOrder: row.sort_order
  };
}

function mapCustomField(row: any): CustomField {
  return {
    id: row.id,
    formType: row.form_type,
    fieldKey: row.field_key,
    label: row.label,
    fieldType: row.field_type,
    options: row.options ?? [],
    required: row.required,
    sortOrder: row.sort_order
  };
}

export async function fetchSheetData(): Promise<SheetData> {
  if (cachedData) return cachedData;

  if (isSupabaseConfigured) {
    try {
      const [membersRes, trainingRes, workRes, officeRes, placementRes, fieldOptionsRes, customFieldsRes, branchCountsRes] = await Promise.all([
        supabase.from('members_public').select('*'),
        supabase.from('training_reports').select('*').order('timestamp', { ascending: false }),
        supabase.from('work_reports').select('*').order('timestamp', { ascending: false }),
        supabase.from('office_admin_reports').select('*').order('timestamp', { ascending: false }),
        supabase.from('placement_reports').select('*').order('timestamp', { ascending: false }),
        supabase.from('field_options').select('*').order('sort_order', { ascending: true }),
        supabase.from('custom_fields').select('*').order('sort_order', { ascending: true }),
        supabase.from('branch_student_counts').select('*')
      ]);

      const errors = [membersRes.error, trainingRes.error, workRes.error, officeRes.error, placementRes.error, fieldOptionsRes.error, customFieldsRes.error, branchCountsRes.error].filter(Boolean);
      if (errors.length) throw errors[0];

      const hasAnyData = [membersRes, trainingRes, workRes, officeRes, placementRes]
        .some(res => (res.data?.length ?? 0) > 0);

      if (hasAnyData) {
        cachedData = {
          members: (membersRes.data ?? []).map(mapMember),
          trainingReports: (trainingRes.data ?? []).map(mapTrainingReport),
          workReports: (workRes.data ?? []).map(mapWorkReport),
          officeAdminReports: (officeRes.data ?? []).map(mapOfficeAdminReport),
          placementReports: (placementRes.data ?? []).map(mapPlacementReport),
          fieldOptions: (fieldOptionsRes.data ?? []).map(mapFieldOption),
          customFields: (customFieldsRes.data ?? []).map(mapCustomField),
          branchStudentCounts: (branchCountsRes.data ?? []).map(mapBranchStudentCount)
        };
        return cachedData;
      }
    } catch (error) {
      console.error('Failed to fetch from Supabase, using mock data:', error);
    }
  }

  cachedData = {
    members: generateMembers(),
    trainingReports: generateTrainingReports(),
    workReports: generateWorkReports(),
    officeAdminReports: generateOfficeAdminReports(),
    placementReports: generatePlacementReports(),
    fieldOptions: [],
    customFields: [],
    branchStudentCounts: []
  };

  return cachedData;
}

export async function fetchBranchStudentCounts(): Promise<BranchStudentCount[]> {
  const data = await fetchSheetData();
  return data.branchStudentCounts;
}

export async function fetchFieldOptions(): Promise<FieldOption[]> {
  const data = await fetchSheetData();
  return data.fieldOptions;
}

export async function fetchCustomFields(): Promise<CustomField[]> {
  const data = await fetchSheetData();
  return data.customFields;
}

export function refreshData(): void {
  cachedData = null;
}

export function parseDate(dateStr: string): Date {
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  }
  return new Date(dateStr);
}

export function getCompletionRate(reports: WorkReport[]): number {
  if (reports.length === 0) return 0;
  let totalTasks = 0;
  let completedTasks = 0;
  reports.forEach(r => {
    r.timeSlots.forEach(ts => {
      if (ts.task && ts.status) {
        totalTasks++;
        if (ts.status === 'Completed') completedTasks++;
      }
    });
  });
  return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
}

export function getAttendanceRate(reports: TrainingReport[]): number {
  if (reports.length === 0) return 0;
  const totalRate = reports.reduce((acc, r) => {
    return acc + (r.totalEnrolled > 0 ? (r.studentsPresent / r.totalEnrolled) * 100 : 0);
  }, 0);
  return Math.round(totalRate / reports.length);
}

export function generateNotifications(
  workReports: WorkReport[],
  trainingReports: TrainingReport[]
): Notification[] {
  const notifications: Notification[] = [];

  // Check completion rates per trainer
  const trainerWorkMap: Record<string, WorkReport[]> = {};
  workReports.forEach(r => {
    if (!trainerWorkMap[r.trainerName]) trainerWorkMap[r.trainerName] = [];
    trainerWorkMap[r.trainerName].push(r);
  });

  Object.entries(trainerWorkMap).forEach(([name, reports]) => {
    const rate = getCompletionRate(reports);
    if (rate < 60) {
      notifications.push({
        id: `low-completion-${name}`,
        type: 'error',
        message: `${name} has a low task completion rate of ${rate}%`,
        trainerName: name,
        timestamp: new Date()
      });
    } else if (rate < 75) {
      notifications.push({
        id: `warn-completion-${name}`,
        type: 'warning',
        message: `${name}'s completion rate is ${rate}% — below target`,
        trainerName: name,
        timestamp: new Date()
      });
    }
  });

  // Check attendance rates per trainer
  const trainerTrainingMap: Record<string, TrainingReport[]> = {};
  trainingReports.forEach(r => {
    if (!trainerTrainingMap[r.trainerName]) trainerTrainingMap[r.trainerName] = [];
    trainerTrainingMap[r.trainerName].push(r);
  });

  Object.entries(trainerTrainingMap).forEach(([name, reports]) => {
    const rate = getAttendanceRate(reports);
    if (rate < 70) {
      notifications.push({
        id: `low-attendance-${name}`,
        type: 'warning',
        message: `${name}'s average attendance is ${rate}% — below 70%`,
        trainerName: name,
        timestamp: new Date()
      });
    }
  });

  return notifications.slice(0, 10);
}

// ==========================================
// Submit functions (portal forms)
// ==========================================

export async function submitTrainingReport(report: TrainingReport): Promise<void> {
  const { error } = await supabase.from('training_reports').insert({
    trainer_name: report.trainerName,
    date: report.date,
    college: report.college,
    course: report.course,
    specialization: report.specialization,
    topic_covered: report.topicCovered,
    learning_objectives: report.learningObjectives,
    duration: report.duration,
    methods: report.methods,
    students_present: report.studentsPresent,
    total_enrolled: report.totalEnrolled,
    participation_level: report.participationLevel,
    engagement_observations: report.engagementObservations,
    challenges_trainer: report.challengesTrainer,
    challenges_student: report.challengesStudent,
    action_plan: report.actionPlan,
    feedback: report.feedback,
    reviewed_by: report.reviewedBy,
    extra_fields: report.extraFields ?? {}
  });
  if (error) throw error;
  refreshData();
}

export async function submitWorkReport(report: WorkReport): Promise<void> {
  const { error } = await supabase.from('work_reports').insert({
    trainer_name: report.trainerName,
    date: report.date,
    department: report.department,
    batch: report.batch,
    time_slots: report.timeSlots,
    key_accomplishments: report.keyAccomplishments,
    challenges_solutions: report.challengesSolutions,
    pending_work: report.pendingWork,
    additional_notes: report.additionalNotes,
    extra_fields: report.extraFields ?? {}
  });
  if (error) throw error;
  refreshData();
}

export async function submitOfficeAdminReport(report: OfficeAdminReport): Promise<void> {
  const { error } = await supabase.from('office_admin_reports').insert({
    staff_name: report.staffName,
    date: report.date,
    item_name: report.itemName,
    item_code: report.itemCode ?? '',
    item_category: report.itemCategory,
    quantity: report.quantity,
    condition: report.condition,
    action_taken: report.actionTaken,
    location: report.location,
    notes: report.notes,
    assigned_to: report.assignedTo ?? '',
    extra_fields: report.extraFields ?? {}
  });
  if (error) throw error;
  refreshData();
}

export async function submitPlacementReport(report: PlacementReport): Promise<void> {
  const { error } = await supabase.from('placement_reports').insert({
    staff_name: report.staffName,
    company_name: report.companyName,
    industry_sector: report.industrySector,
    company_type: report.companyType,
    hq_location: report.hqLocation,
    contact_person: report.contactPerson,
    designation: report.designation,
    email_id: report.emailId,
    phone_number: report.phoneNumber,
    source_channel: report.sourceChannel,
    date_of_first_contact: report.dateOfFirstContact,
    mode_of_contact: report.modeOfContact,
    current_status: report.currentStatus,
    roles_offered: report.rolesOffered,
    number_of_openings: report.numberOfOpenings,
    ctc_lpa: report.ctcLPA,
    drive_date: report.driveDate,
    students_selected: report.studentsSelected,
    remarks: report.remarks,
    priority: report.priority,
    next_follow_up_date: report.nextFollowUpDate,
    action_required: report.actionRequired,
    assigned_to: report.assignedTo,
    follow_up_done: report.followUpDone,
    opportunity_type: report.opportunityType ?? '',
    activity_status: report.activityStatus ?? '',
    activity_purpose: report.activityPurpose ?? '',
    hiring_mode: report.hiringMode ?? '',
    hiring_rounds: report.hiringRounds ?? [],
    extra_fields: report.extraFields ?? {}
  });
  if (error) throw error;
  refreshData();
}

export async function addBranchStudentCount(college: string, course: string, specialization: string, studentCount: number): Promise<void> {
  const { error } = await supabase.from('branch_student_counts').insert({
    college, course, specialization, student_count: studentCount
  });
  if (error) throw error;
  refreshData();
}

export async function updateBranchStudentCount(id: string, studentCount: number): Promise<void> {
  const { error } = await supabase.from('branch_student_counts').update({ student_count: studentCount }).eq('id', id);
  if (error) throw error;
  refreshData();
}

export async function deleteBranchStudentCount(id: string): Promise<void> {
  const { error } = await supabase.from('branch_student_counts').delete().eq('id', id);
  if (error) throw error;
  refreshData();
}

// ==========================================
// SuperAdmin: dynamic dropdown options
// ==========================================

export async function addFieldOption(category: string, value: string, label: string, sortOrder = 0): Promise<void> {
  const { error } = await supabase.from('field_options').insert({
    category, value, label, sort_order: sortOrder
  });
  if (error) throw error;
  refreshData();
}

export async function updateFieldOption(id: string, value: string, label: string): Promise<void> {
  const { error } = await supabase.from('field_options').update({ value, label }).eq('id', id);
  if (error) throw error;
  refreshData();
}

export async function deleteFieldOption(id: string): Promise<void> {
  const { error } = await supabase.from('field_options').delete().eq('id', id);
  if (error) throw error;
  refreshData();
}

// ==========================================
// SuperAdmin: custom form fields
// ==========================================

export async function upsertCustomField(field: {
  id?: string;
  formType: CustomFieldFormType;
  fieldKey: string;
  label: string;
  fieldType: CustomFieldType;
  options: string[];
  required: boolean;
  sortOrder?: number;
}): Promise<void> {
  const row = {
    form_type: field.formType,
    field_key: field.fieldKey,
    label: field.label,
    field_type: field.fieldType,
    options: field.options,
    required: field.required,
    sort_order: field.sortOrder ?? 0
  };
  const { error } = field.id
    ? await supabase.from('custom_fields').update(row).eq('id', field.id)
    : await supabase.from('custom_fields').insert(row);
  if (error) throw error;
  refreshData();
}

export async function deleteCustomField(id: string): Promise<void> {
  const { error } = await supabase.from('custom_fields').delete().eq('id', id);
  if (error) throw error;
  refreshData();
}

// ==========================================
// SuperAdmin: member management
// ==========================================

export async function upsertMember(member: {
  id?: string;
  name: string;
  department: string;
  batch: string;
  email: string;
  role: MemberRole;
  username: string;
  password?: string;
}): Promise<void> {
  const { error } = await supabase.rpc('admin_upsert_member', {
    p_id: member.id ?? null,
    p_name: member.name,
    p_department: member.department,
    p_batch: member.batch,
    p_email: member.email,
    p_role: member.role,
    p_username: member.username,
    p_password: member.password ?? null
  });
  if (error) throw error;
  refreshData();
}

export async function deleteMember(id: string): Promise<void> {
  const { error } = await supabase.rpc('admin_delete_member', { p_id: id });
  if (error) throw error;
  refreshData();
}

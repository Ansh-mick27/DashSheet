// ==========================================
// DashSheet — Data Service (Supabase)
// ==========================================
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Member, TrainingReport, WorkReport, OfficeAdminReport, PlacementReport, Notification } from '../types';
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
    reviewedBy: row.reviewed_by
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
    reviewedBy: row.reviewed_by
  };
}

function mapOfficeAdminReport(row: any): OfficeAdminReport {
  return {
    timestamp: row.timestamp,
    staffName: row.staff_name,
    date: row.date,
    itemName: row.item_name,
    itemCategory: row.item_category,
    quantity: row.quantity,
    condition: row.condition,
    actionTaken: row.action_taken,
    location: row.location,
    notes: row.notes
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
    followUpDone: row.follow_up_done
  };
}

export async function fetchSheetData(): Promise<SheetData> {
  if (cachedData) return cachedData;

  if (isSupabaseConfigured) {
    try {
      const [membersRes, trainingRes, workRes, officeRes, placementRes] = await Promise.all([
        supabase.from('members_public').select('*'),
        supabase.from('training_reports').select('*').order('timestamp', { ascending: false }),
        supabase.from('work_reports').select('*').order('timestamp', { ascending: false }),
        supabase.from('office_admin_reports').select('*').order('timestamp', { ascending: false }),
        supabase.from('placement_reports').select('*').order('timestamp', { ascending: false })
      ]);

      const errors = [membersRes.error, trainingRes.error, workRes.error, officeRes.error, placementRes.error].filter(Boolean);
      if (errors.length) throw errors[0];

      const hasAnyData = [membersRes, trainingRes, workRes, officeRes, placementRes]
        .some(res => (res.data?.length ?? 0) > 0);

      if (hasAnyData) {
        cachedData = {
          members: (membersRes.data ?? []).map(mapMember),
          trainingReports: (trainingRes.data ?? []).map(mapTrainingReport),
          workReports: (workRes.data ?? []).map(mapWorkReport),
          officeAdminReports: (officeRes.data ?? []).map(mapOfficeAdminReport),
          placementReports: (placementRes.data ?? []).map(mapPlacementReport)
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
    placementReports: generatePlacementReports()
  };

  return cachedData;
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
    reviewed_by: report.reviewedBy
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
    reviewed_by: report.reviewedBy
  });
  if (error) throw error;
  refreshData();
}

export async function submitOfficeAdminReport(report: OfficeAdminReport): Promise<void> {
  const { error } = await supabase.from('office_admin_reports').insert({
    staff_name: report.staffName,
    date: report.date,
    item_name: report.itemName,
    item_category: report.itemCategory,
    quantity: report.quantity,
    condition: report.condition,
    action_taken: report.actionTaken,
    location: report.location,
    notes: report.notes
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
    follow_up_done: report.followUpDone
  });
  if (error) throw error;
  refreshData();
}

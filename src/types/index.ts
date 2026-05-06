// ==========================================
// DashSheet — TypeScript Type Definitions
// ==========================================

export type MemberRole = 'Trainer' | 'Admin' | 'OfficeAdmin' | 'Placement';

export interface Member {
  name: string;
  department: string;
  batch: string;
  email: string;
  role: MemberRole;
}

export interface TrainingReport {
  timestamp: string;
  trainerName: string;
  date: string;
  batch: string;
  course: string;
  topicCovered: string;
  learningObjectives: string;
  duration: string;
  methods: {
    lecture: boolean;
    groupDiscussion: boolean;
    caseStudy: boolean;
    rolePlay: boolean;
    presentation: boolean;
    practical: boolean;
    other: string;
  };
  studentsPresent: number;
  totalEnrolled: number;
  participationLevel: 'High' | 'Moderate' | 'Low';
  engagementObservations: string;
  challengesTrainer: string;
  challengesStudent: string;
  actionPlan: string;
  feedback: string;
  reviewedBy: string;
}

export interface TimeSlotEntry {
  timeSlot: string;
  task: string;
  status: 'Completed' | 'Pending' | '';
  remarks: string;
}

export interface WorkReport {
  timestamp: string;
  trainerName: string;
  date: string;
  department: string;
  batch: string;
  timeSlots: TimeSlotEntry[];
  keyAccomplishments: string;
  challengesSolutions: string;
  pendingWork: string;
  additionalNotes: string;
  reviewedBy: string;
}

export interface OfficeAdminReport {
  timestamp: string;
  staffName: string;
  date: string;
  itemName: string;
  itemCategory: 'Electronics' | 'Furniture' | 'Stationery' | 'Equipment' | 'Other';
  quantity: number;
  condition: 'New' | 'Good' | 'Fair' | 'Poor' | 'Damaged';
  actionTaken: 'Added' | 'Removed' | 'Repaired' | 'Maintenance' | 'Audited';
  location: string;
  notes: string;
}

export interface PlacementReport {
  timestamp: string;
  staffName: string;
  date: string;
  companyName: string;
  companyType: 'IT' | 'Non-IT' | 'Manufacturing' | 'Healthcare' | 'Finance' | 'Education' | 'Other';
  interactionType: 'Cold Call' | 'Follow-up Call' | 'Email' | 'Campus Visit' | 'Company Visit' | 'LinkedIn';
  contactPerson: string;
  outcome: 'Interested' | 'Not Interested' | 'Scheduled Visit' | 'Sent JD' | 'No Response' | 'Placed Students' | 'Follow-up Needed';
  jobsOffered: number;
  studentsPlaced: number;
  notes: string;
}

export interface DashboardFilters {
  trainer: string;
  dateFrom: string;
  dateTo: string;
  batch: string;
  department: string;
  role: string;
}

export interface OverviewMetrics {
  totalTrainers: number;
  totalReportsToday: number;
  totalReportsThisWeek: number;
  avgCompletionRate: number;
  avgAttendanceRate: number;
  pendingTasks: number;
  completedTasks: number;
}

export interface Notification {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  trainerName?: string;
  timestamp: Date;
}

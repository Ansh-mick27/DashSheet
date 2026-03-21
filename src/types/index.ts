// ==========================================
// DashSheet — TypeScript Type Definitions
// ==========================================

export interface Member {
  name: string;
  department: string;
  batch: string;
  email: string;
  role: 'Trainer' | 'Admin';
}

export interface TrainingReport {
  timestamp: string;
  trainerName: string;
  date: string;
  batch: string;
  course: string;
  topicCovered: string;
  learningObjectives: string;
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

export interface DashboardFilters {
  trainer: string;
  dateFrom: string;
  dateTo: string;
  batch: string;
  department: string;
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

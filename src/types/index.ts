// ==========================================
// DashSheet — TypeScript Type Definitions
// ==========================================

export type MemberRole = 'Trainer' | 'Admin' | 'OfficeAdmin' | 'Placement' | 'SuperAdmin';

export interface Member {
  id: string;
  name: string;
  department: string;
  batch: string;
  email: string;
  role: MemberRole;
  username: string;
}

export type CustomFieldType = 'text' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date';

export type CustomFieldFormType = 'training' | 'work' | 'inventory' | 'placement' | 'placement_work';

export interface FieldOption {
  id: string;
  category: string;
  value: string;
  label: string;
  sortOrder: number;
}

export interface CustomField {
  id: string;
  formType: CustomFieldFormType;
  fieldKey: string;
  label: string;
  fieldType: CustomFieldType;
  options: string[];
  required: boolean;
  sortOrder: number;
}

export type ExtraFields = Record<string, string | number | boolean>;

export interface TrainingReport {
  timestamp: string;
  trainerName: string;
  date: string;
  college: string;
  course: string;
  specialization: string;
  section: string;
  year: string;
  semester: string;
  topicCovered: string;
  learningObjectives: string;
  duration: string;
  methods: {
    selected: string[];
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
  extraFields?: ExtraFields;
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
  placementDriveUpdate: PlacementDriveEntry[];
  internshipCoordination: PlacementInternshipEntry[];
  extraFields?: ExtraFields;
}

export interface OfficeAdminReport {
  timestamp: string;
  staffName: string;
  date: string;
  itemName: string;
  itemCode: string;
  itemCategory: 'Electronics' | 'Furniture' | 'Stationery' | 'Equipment' | 'Other';
  quantity: number;
  condition: 'New' | 'Good' | 'Fair' | 'Poor' | 'Damaged';
  actionTaken: 'Added' | 'Removed' | 'Repaired' | 'Maintenance' | 'Audited';
  location: string;
  notes: string;
  assignedTo: string;
  extraFields?: ExtraFields;
}

export interface HiringRound {
  name: string;
  mode: 'Virtual' | 'Physical' | 'Hybrid' | '';
}

export interface BranchStudentCount {
  id: string;
  college: string;
  course: string;
  specialization: string;
  section: string;
  year: string;
  semester: string;
  studentCount: number;
}

export interface PlacementReport {
  timestamp: string;
  staffName: string;
  companyName: string;
  industrySector: 'IT / Software' | 'Consulting' | 'Manufacturing' | 'BFSI' | 'EdTech' | 'Healthcare' | 'E-Commerce' | 'FMCG' | 'Automobile' | 'Other';
  companyType: 'MNC' | 'Startup' | 'PSU / Large Corp' | 'Private Sector' | 'Other';
  hqLocation: string;
  contactPerson: string;
  designation: string;
  emailId: string;
  phoneNumber: string;
  sourceChannel: 'Alumni Reference' | 'LinkedIn Outreach' | 'Company Portal' | 'Job Fair' | 'College Website' | 'Direct Approach' | 'Other';
  dateOfFirstContact: string;
  modeOfContact: 'Email' | 'Phone Call' | 'Video Call' | 'In-Person Meeting' | 'LinkedIn';
  currentStatus: 'Identified' | 'Email Sent' | 'JD Sent' | 'Under Discussion' | 'In Negotiation' | 'MoU Signed' | 'Drive Scheduled' | 'Drive Completed' | 'No Response' | 'Blacklisted';
  rolesOffered: string;
  numberOfOpenings: number;
  ctcLPA: number;
  driveDate: string;
  studentsSelected: number;
  remarks: string;
  priority: 'High' | 'Medium' | 'Low';
  nextFollowUpDate: string;
  actionRequired: string;
  assignedTo: 'Placement Officer' | 'HOD / Coordinator' | 'Campus Relations Manager' | 'Business Development Associate' | 'Other' | '';
  followUpDone: boolean;
  opportunityType: 'Internship' | 'Job' | 'Internship Cum Placement Drive' | 'Apprentice' | '';
  activityStatus: 'Open' | 'Closed' | 'On Hold' | 'Other' | '';
  activityPurpose: string;
  hiringMode: 'Online' | 'Physical' | 'Hybrid' | '';
  hiringRounds: HiringRound[];
  driveYear: string;
  extraFields?: ExtraFields;
}

export interface PlacementWorkLogEntry {
  timeSlot: string;
  activity: string;
  status: 'Completed' | 'Pending' | '';
  remarks: string;
}

export interface PlacementCompanyEngagementEntry {
  companyName: string;
  hrContact: string;
  location: string;
  purpose: string;
  mode: string;
  outcome: string;
  remark: string;
}

export interface PlacementStudentEngagementEntry {
  studentName: string;
  purpose: string;
  issueIdentified: string;
  actionTaken: string;
  status: 'Open' | 'Closed' | '';
}

export interface PlacementDriveEntry {
  companyName: string;
  profile: string;
  ctc: string;
  location: string;
  eligibleStudents: string;
  applied: string;
  appear: string;
  testStatus: string;
  interviewStatus: string;
  remark: string;
}

export interface PlacementInternshipEntry {
  activity: string;
  batchDept: string;
  noStudents: string;
  trainerCompany: string;
  status: 'Completed' | 'Pending' | '';
  remarks: string;
}

export interface PlacementMISEntry {
  task: string;
  status: 'Completed' | 'Pending' | '';
  remarks: string;
}

export interface PlacementPendingWorkEntry {
  pendingTask: string;
  personConcerned: string;
  targetDate: string;
  priority: 'High' | 'Medium' | 'Low' | '';
}

export interface PlacementIssueSupportEntry {
  issue: string;
  relatedTo: string;
  supportRequired: string;
  urgency: 'High' | 'Medium' | 'Low' | '';
}

export interface PlacementWorkReport {
  id?: string;
  timestamp: string;
  staffName: string;
  date: string;
  department: string;
  workLog: PlacementWorkLogEntry[];
  companyEngagement: PlacementCompanyEngagementEntry[];
  totalCompaniesContacted: number;
  newCompaniesApproached: number;
  followUpCompanies: number;
  confirmedOpportunities: number;
  studentEngagement: PlacementStudentEngagementEntry[];
  totalStudentsInteracted: number;
  resumeReviewsDone: number;
  mockInterviewsSupport: number;
  studentsGuidedApplications: number;
  placementDriveUpdate: PlacementDriveEntry[];
  internshipCoordination: PlacementInternshipEntry[];
  achievements: string[];
  pendingWork: PlacementPendingWorkEntry[];
  extraFields?: ExtraFields;
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

export interface OATimeSlotEntry { timeSlot: string; taskActivity: string[]; relatedArea: string; status: string; remark: string; }
export interface OAStudentSupportRow { particular: string; countStatus: string; remarks: string; }
export interface OACampusProcessRow { process: string; venue: string; supportProvided: string; noOfStudentsGuests: string; status: string; remarks: string; }
export interface OAHousekeepingRow { area: string; status: string; issueFound: string; actionTaken: string; remarks: string; }
export interface OAFileDocRow { fileType: string; purpose: string; preparedUpdated: string; physicalFile: string; digitalFolder: string; remarks: string; }
export interface OAInfrastructureRow { utility: string; location: string; status: string; issueFound: string; actionTaken: string; }
export interface OAMISRow { recordType: string; updated: string; pending: string; remarks: string; }
export interface OAIssueRow { issue: string; relatedArea: string; reportedTo: string; actionRequired: string; priority: string; }
export interface OAPendingWorkRow { pendingTask: string; concernedPerson: string; targetDate: string; priority: string; }
export interface OAITPeripheralRow { equipment: string; location: string; workingStatus: string; issueReported: string; actionTaken: string; }
export interface OAReceptionRow { visitorName: string; purposeOfVisit: string; expectedTime: string; receptionInformed: string; gateSecurityInformed: string; parkingRequired: string; remarks: string; }
export interface OATravelRow { guestName: string; from: string; to: string; pickupTime: string; dropTime: string; vehicleDriverDetails: string; status: string; remarks: string; }
export interface OATravelDetails { driverName: string; driverMobile: string; vehicleNo: string; vendorInternal: string; securityInformed: string; parkingArranged: string; }
export interface OAHospitalityRow { guest: string; requirement: string; time: string; arrangedBy: string; status: string; remarks: string; }
export interface OAPrintingRow { material: string; quantity: string; purpose: string; requestedBy: string; completedTime: string; status: string; remarks: string; }
export interface OAInstallationRow { item: string; location: string; installedBy: string; timeCompleted: string; status: string; remarks: string; }
export interface OAVendorRow { vendor: string; serviceRequired: string; contactPerson: string; deliveryTime: string; status: string; remarks: string; }
export interface OAChecklistRow { point: string; status: string; remarks: string; }
export interface OAInventoryRow { itemName: string; openingStock: string; usedToday: string; balanceStock: string; reorderRequired: string; remarks: string; }

export interface OfficeAdminDailyReport {
  id?: string;
  timestamp: string;
  staffName: string;
  date: string;
  department: string;
  timeSlotLog: OATimeSlotEntry[];
  studentSupport: OAStudentSupportRow[];
  campusProcess: OACampusProcessRow[];
  housekeeping: OAHousekeepingRow[];
  fileDocumentation: OAFileDocRow[];
  infrastructure: OAInfrastructureRow[];
  misRecords: OAMISRow[];
  keyWorkCompleted: string[];
  issues: OAIssueRow[];
  pendingWork: OAPendingWorkRow[];
  hasCampusDay: boolean;
  itPeripherals: OAITPeripheralRow[];
  receptionNotification: OAReceptionRow[];
  travelRows: OATravelRow[];
  travelDetails: OATravelDetails;
  hospitality: OAHospitalityRow[];
  printingMaterial: OAPrintingRow[];
  installationDisplay: OAInstallationRow[];
  vendorCoordination: OAVendorRow[];
  preProcessChecklist: OAChecklistRow[];
  postProcessChecklist: OAChecklistRow[];
  nextDayReadiness: OAChecklistRow[];
}

export interface OfficeAdminWeeklyReport {
  id?: string;
  timestamp: string;
  staffName: string;
  date: string;
  department: string;
  inventoryStock: OAInventoryRow[];
  infrastructure: OAInfrastructureRow[];
}

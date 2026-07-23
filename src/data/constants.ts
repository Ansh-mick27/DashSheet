// ==========================================
// DashSheet — Shared Form Constants
// ==========================================

export const DEPARTMENTS = [
  'Technical Skills',
  'Communication Skills',
  'Soft Skills',
  'Cognitive Skills',
  'Innovation & Outreach Skills'
];

export const BATCHES = ['Batch A', 'Batch B', 'Batch C', 'Batch D', 'Batch E'];

// Fixed order required: AIL, AFMR, AITR, AIPER, AIMSR (abbreviations, not full names)
export const COLLEGES_COURSES_SPECIALIZATIONS: { college: string; course: string; specialization: string }[] = [
  { college: 'AIL', course: 'BA LLB', specialization: '' },
  { college: 'AFMR', course: 'MBA', specialization: 'Finance' },
  { college: 'AITR', course: 'B. Tech.', specialization: 'CSE' },
  { college: 'AITR', course: 'B. Tech.', specialization: 'IT' },
  { college: 'AITR', course: 'B. Tech.', specialization: 'CSE-AIML' },
  { college: 'AITR', course: 'MCA', specialization: '' },
  { college: 'AIPER', course: 'B. Pharma', specialization: '' },
  { college: 'AIMSR', course: 'BBA', specialization: 'Marketing' },
  { college: 'AIMSR', course: 'BCA', specialization: 'Computer Applications' }
];

export const SECTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

export const ACADEMIC_YEARS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

export const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'];

export const DRIVE_YEARS = ['2026', '2027', '2028', '2029', '2030', '2031', '2032'];

export const DURATIONS = ['1 Hour', '2 Hours', '3 Hours', 'Full Day'];

export const PARTICIPATION_LEVELS = ['High', 'Moderate', 'Low'];

export const TEACHING_METHODS = ['Orientation', 'Lecture', 'GD', 'Case Study', 'Role Play', 'Presentation', 'Outbound', 'Digital'];

export const TIME_SLOTS = [
  'Slot 1 (8:50-9:05)',
  'Slot 2 (9:05-9:50)',
  'Slot 3 (9:50-10:30)',
  'Slot 4 (10:30-11:20)',
  'Slot 5 (11:20-12:10)',
  'Slot 6 (12:10-13:00)',
  'Slot 7 (13:50-14:40)',
  'Slot 8 (14:40-15:30)',
  'Slot 9 (15:30-16:15)',
  'Slot 10 (16:15-17:00)'
];

export const TASKS = [
  'Prepare lecture materials', 'Conduct training session', 'Student assessment',
  'Review homework submissions', 'One-on-one mentoring', 'Update course content',
  'Team meeting', 'Practical lab session', 'Create quiz questions',
  'Grade assignments', 'Curriculum planning', 'Industry interaction session',
  'Documentation update', 'Research new topics',
  'Mock Process', 'Placement Activity', 'FDP', 'Events', 'Invigilation',
  'Other'
];

export const TASK_STATUSES = ['Completed', 'Pending'];

export const INVENTORY_ITEMS = [
  'Laptop', 'Desktop PC', 'Projector', 'Whiteboard', 'Printer', 'UPS Battery',
  'Extension Board', 'HDMI Cable', 'Webcam', 'Headset', 'Office Chair', 'Study Table',
  'Marker Set', 'Notebook Stack', 'Speaker System', 'Router', 'Switch', 'External HDD', 'Other'
];

export const ITEM_CATEGORIES = ['Electronics', 'Furniture', 'Stationery', 'Equipment', 'Other'];

export const ITEM_CONDITIONS = ['New', 'Good', 'Fair', 'Poor', 'Damaged'];

export const ACTIONS_TAKEN = ['Added', 'Removed', 'Repaired', 'Maintenance', 'Audited'];

export const INDUSTRY_SECTORS = [
  'IT / Software', 'Consulting', 'Manufacturing', 'BFSI', 'EdTech',
  'Healthcare', 'E-Commerce', 'FMCG', 'Automobile', 'Other',
  'Consumer Durable', 'Consumer Product', 'Banking', 'MSME (Micro, Small & Medium Enterprise)'
];

export const COMPANY_TYPES = ['MNC', 'Startup', 'PSU / Large Corp', 'Private Sector', 'Other'];

export const SOURCE_CHANNELS = [
  'Alumni Reference', 'LinkedIn Outreach', 'Company Portal', 'Job Fair',
  'College Website', 'Direct Approach', 'Other'
];

export const MODES_OF_CONTACT = ['Email', 'Phone Call', 'Video Call', 'In-Person Meeting', 'LinkedIn'];

export const PLACEMENT_STATUSES = [
  'Identified', 'Email Sent', 'JD Sent', 'Under Discussion', 'In Negotiation',
  'MoU Signed', 'Drive Scheduled', 'Drive Completed', 'No Response', 'Blacklisted'
];

export const PRIORITIES = ['High', 'Medium', 'Low'];

export const ASSIGNED_TO_OPTIONS = [
  'Placement Officer', 'HOD / Coordinator', 'Campus Relations Manager',
  'Business Development Associate', 'Other'
];

export const OPPORTUNITY_TYPES = ['Internship', 'Job', 'Internship Cum Placement Drive', 'Apprentice'];

export const ACTIVITY_STATUSES = ['Open', 'Closed', 'On Hold', 'Other'];

export const ACTIVITY_PURPOSES = [
  'Hiring', 'Internship', 'Expert Session', 'Orientation',
  'Hackathon', 'Hiring Competition', 'Webinar', 'Guest Lecture'
];

export const HIRING_MODES = ['Online', 'Physical', 'Hybrid'];

export const ROUND_DELIVERY_MODES = ['Virtual', 'Physical', 'Hybrid'];

// Placement Officer Daily Task Report
export const PLACEMENT_WORK_LOG_SLOTS: { timeSlot: string; activity: string }[] = [
  { timeSlot: '08:30 – 09:00', activity: 'Attendance, Email Checking, Daily Planning' },
  { timeSlot: '09:00 – 10:00', activity: 'Company Follow-up / New Recruiter Outreach' },
  { timeSlot: '10:00 – 11:00', activity: 'Student Data Verification / Eligibility Checking' },
  { timeSlot: '11:00 – 12:00', activity: 'Placement Drive Coordination / Interview Scheduling' },
  { timeSlot: '12:00 – 12:30', activity: 'Communication with Departments / Faculty Coordinators' },
  { timeSlot: '12:30 – 01:30', activity: 'Lunch Break' },
  { timeSlot: '01:30 – 02:30', activity: 'Student Counselling / Resume Review / GD-PI Support' },
  { timeSlot: '02:30 – 03:30', activity: 'Internship / Placement Opportunity Sharing & Tracking' },
  { timeSlot: '03:30 – 04:30', activity: 'MIS Update / Placement Database / Offer Tracking' },
  { timeSlot: '04:30 – 05:15', activity: 'Reports, Follow-up Calls, Next-Day Planning' },
  { timeSlot: '05:15 – 05:30', activity: 'Daily Report Submission' },
];

export const PLACEMENT_ENGAGEMENT_PURPOSES = ['New Hiring', 'Follow-up', 'JD', 'Drive', 'Other'];
export const PLACEMENT_ENGAGEMENT_MODES = ['Call', 'Email', 'Meeting', 'Other'];
export const STUDENT_ENGAGEMENT_PURPOSES = ['Resume', 'Interview', 'Eligibility', 'Attendance', 'Other'];
export const STUDENT_ENGAGEMENT_STATUSES = ['Open', 'Closed'];
export const DRIVE_TEST_STATUSES = ['Completed', 'Pending', 'Other'];

export const INTERNSHIP_ACTIVITIES = [
  'Internship Opportunity Shared',
  'Training Session Coordinated',
  'Assessment / Mock Test Conducted',
  'Orientation & Assignments',
];

export const MIS_TASKS = [
  'Student Master Data Updated',
  'Eligibility List Verified',
  'Company Name Database Updated',
  'Offer / Selection Data Updated',
  'Drive Attendance Uploaded',
];

export const PLACEMENT_WORK_STATUSES = ['Completed', 'Pending'];
export const RELATED_TO_OPTIONS = ['Company', 'Student', 'Department', 'Data', 'Infrastructure', 'Other'];

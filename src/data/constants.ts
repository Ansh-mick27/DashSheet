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

export const COLLEGES_COURSES_SPECIALIZATIONS: { college: string; course: string; specialization: string }[] = [
  { college: 'Acropolis Institute of Technology & Research', course: 'B. Tech.', specialization: 'CSE' },
  { college: 'Acropolis Institute of Technology & Research', course: 'B. Tech.', specialization: 'IT' },
  { college: 'Acropolis Institute of Technology & Research', course: 'B. Tech.', specialization: 'CSE-AIML' },
  { college: 'Acropolis Institute of Technology & Research', course: 'MCA', specialization: '' },
  { college: 'Acropolis Institute of Management Studies and Research', course: 'BBA', specialization: 'Marketing' },
  { college: 'Acropolis Institute of Management Studies and Research', course: 'BCA', specialization: 'Computer Applications' },
  { college: 'Acropolis Faculty of Management & Research', course: 'MBA', specialization: 'Finance' },
  { college: 'Acropolis Institute of Pharmaceutical Education and Research', course: 'B. Pharma', specialization: '' },
  { college: 'Acropolis Institute of Law', course: 'BA LLB', specialization: '' }
];

export const DURATIONS = ['1 Hour', '2 Hours', '3 Hours', 'Full Day'];

export const PARTICIPATION_LEVELS = ['High', 'Moderate', 'Low'];

export const TEACHING_METHODS: { key: 'lecture' | 'groupDiscussion' | 'caseStudy' | 'rolePlay' | 'presentation' | 'practical'; label: string }[] = [
  { key: 'lecture', label: 'Lecture' },
  { key: 'groupDiscussion', label: 'Group Discussion' },
  { key: 'caseStudy', label: 'Case Study' },
  { key: 'rolePlay', label: 'Role Play' },
  { key: 'presentation', label: 'Presentation' },
  { key: 'practical', label: 'Practical' }
];

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
  'Documentation update', 'Research new topics', 'Other'
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
  'Healthcare', 'E-Commerce', 'FMCG', 'Automobile', 'Other'
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

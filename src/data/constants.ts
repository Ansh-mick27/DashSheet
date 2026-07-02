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

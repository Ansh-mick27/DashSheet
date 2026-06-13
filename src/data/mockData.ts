// ==========================================
// DashSheet — Mock Data for Development
// ==========================================
import { Member, TrainingReport, WorkReport, OfficeAdminReport, PlacementReport } from '../types';
import { TEACHING_METHODS } from './constants';

const TRAINER_NAMES = [
  'Aarav Sharma', 'Priya Patel', 'Rohan Gupta', 'Neha Singh', 'Vikram Reddy',
  'Ananya Iyer', 'Karan Mehta', 'Divya Joshi', 'Arjun Nair', 'Sneha Das',
  'Rahul Verma', 'Pooja Mishra', 'Aditya Kumar', 'Riya Banerjee', 'Siddharth Rao',
  'Meera Choudhary', 'Nikhil Saxena', 'Kavya Menon', 'Dhruv Tiwari', 'Ishita Kapoor'
];

const OFFICE_ADMIN_NAMES = ['Suresh Pillai', 'Rekha Nambiar'];
const PLACEMENT_NAMES = ['Manish Yadav', 'Shreya Agarwal', 'Varun Bhatt'];

const DEPARTMENTS = ['Computer Science', 'Data Science', 'Web Development', 'Mobile Development', 'Cloud Computing'];
const BATCHES = ['Batch A', 'Batch B', 'Batch C', 'Batch D', 'Batch E'];
const COLLEGES_COURSES_SPECIALIZATIONS: { college: string; course: string; specialization: string }[] = [
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
const TOPICS = [
  'Variables and Data Types', 'Component Lifecycle', 'Linked Lists',
  'Linear Regression', 'AWS EC2 Setup', 'REST API Design',
  'Wireframing Basics', 'CI/CD Pipelines', 'Network Security', 'SQL Joins',
  'Functions and Closures', 'State Management', 'Trees and Graphs',
  'Neural Networks', 'Docker Containers', 'Authentication & JWT',
  'Color Theory', 'Kubernetes Basics', 'Encryption Methods', 'NoSQL Databases'
];
const DURATIONS = ['1 Hour', '2 Hours', '3 Hours', 'Full Day'];

const TIME_SLOTS = [
  '08:30 - 09:30', '09:30 - 10:30', '10:30 - 11:30', '11:30 - 12:30',
  '01:30 - 02:30', '02:30 - 03:30', '03:30 - 04:30', '04:30 - 05:30'
];

const TASKS = [
  'Prepare lecture materials', 'Conduct training session', 'Student assessment',
  'Review homework submissions', 'One-on-one mentoring', 'Update course content',
  'Team meeting', 'Practical lab session', 'Performance review preparation',
  'Create quiz questions', 'Grade assignments', 'Student feedback analysis',
  'Curriculum planning', 'Industry interaction session', 'Internal training',
  'Documentation update', 'Research new topics', 'Webinar preparation'
];

const INVENTORY_ITEMS = [
  'Laptop', 'Desktop PC', 'Projector', 'Whiteboard', 'Printer',
  'UPS Battery', 'Extension Board', 'HDMI Cable', 'Webcam', 'Headset',
  'Office Chair', 'Study Table', 'Marker Set', 'Pen Stand', 'Notebook Stack',
  'Eraser Board', 'Speaker System', 'Router', 'Switch', 'External HDD'
];

const COMPANIES = [
  'Infosys', 'TCS', 'Wipro', 'HCL Technologies', 'Tech Mahindra',
  'Cognizant', 'Accenture', 'Capgemini', 'IBM India', 'Oracle India',
  'Zoho Corporation', 'Freshworks', 'Byju\'s', 'Swiggy', 'Ola',
  'Tata Elxsi', 'L&T Infotech', 'Mindtree', 'Hexaware', 'Mphasis'
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatDate(date: Date): string {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function generateDates(count: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      dates.push(formatDate(d));
    }
  }
  return dates;
}

export function generateMembers(): Member[] {
  const members: Member[] = [];

  TRAINER_NAMES.forEach((name, i) => {
    const username = name.toLowerCase().replace(' ', '.');
    members.push({
      id: username,
      name,
      department: DEPARTMENTS[i % DEPARTMENTS.length],
      batch: BATCHES[i % BATCHES.length],
      email: `${username}@org.com`,
      role: i < 3 ? 'Admin' : 'Trainer',
      username
    });
  });

  OFFICE_ADMIN_NAMES.forEach((name) => {
    const username = name.toLowerCase().replace(' ', '.');
    members.push({
      id: username,
      name,
      department: 'Administration',
      batch: '-',
      email: `${username}@org.com`,
      role: 'OfficeAdmin',
      username
    });
  });

  PLACEMENT_NAMES.forEach((name) => {
    const username = name.toLowerCase().replace(' ', '.');
    members.push({
      id: username,
      name,
      department: 'Placement Cell',
      batch: '-',
      email: `${username}@org.com`,
      role: 'Placement',
      username
    });
  });

  return members;
}

export function generateTrainingReports(): TrainingReport[] {
  const reports: TrainingReport[] = [];
  const dates = generateDates(30);

  for (const trainerName of TRAINER_NAMES) {
    const reportDates = dates.slice(0, randomInt(10, 25));
    for (const date of reportDates) {
      const totalEnrolled = randomInt(20, 45);
      const ccs = randomItem(COLLEGES_COURSES_SPECIALIZATIONS);
      reports.push({
        timestamp: new Date().toISOString(),
        trainerName,
        date,
        college: ccs.college,
        course: ccs.course,
        specialization: ccs.specialization,
        topicCovered: randomItem(TOPICS),
        duration: randomItem(DURATIONS),
        learningObjectives: `Understand ${randomItem(TOPICS).toLowerCase()} concepts and apply them practically`,
        methods: {
          selected: TEACHING_METHODS.filter(() => Math.random() > 0.5),
          other: Math.random() > 0.8 ? 'Online Demo' : ''
        },
        studentsPresent: randomInt(Math.floor(totalEnrolled * 0.6), totalEnrolled),
        totalEnrolled,
        participationLevel: randomItem(['High', 'Moderate', 'Low'] as const),
        engagementObservations: 'Students were actively engaged in the practical exercises',
        challengesTrainer: Math.random() > 0.5 ? 'Some students needed extra time for practical exercises' : '',
        challengesStudent: Math.random() > 0.5 ? 'Complex syntax was initially challenging' : '',
        actionPlan: Math.random() > 0.5 ? 'Plan to include more hands-on exercises next session' : '',
        feedback: Math.random() > 0.5 ? 'Recommend adding supplementary video materials' : '',
        reviewedBy: Math.random() > 0.4 ? randomItem(TRAINER_NAMES.slice(0, 3)) : ''
      });
    }
  }

  return reports;
}

export function generateWorkReports(): WorkReport[] {
  const reports: WorkReport[] = [];
  const dates = generateDates(30);

  for (const trainerName of TRAINER_NAMES) {
    const dept = DEPARTMENTS[TRAINER_NAMES.indexOf(trainerName) % DEPARTMENTS.length];
    const batch = BATCHES[TRAINER_NAMES.indexOf(trainerName) % BATCHES.length];
    const reportDates = dates.slice(0, randomInt(10, 25));

    for (const date of reportDates) {
      const timeSlots = TIME_SLOTS.map(slot => ({
        timeSlot: slot,
        task: randomItem(TASKS),
        status: (Math.random() > 0.2 ? 'Completed' : 'Pending') as 'Completed' | 'Pending',
        remarks: Math.random() > 0.6 ? 'Completed on time' : ''
      }));

      reports.push({
        timestamp: new Date().toISOString(),
        trainerName,
        date,
        department: dept,
        batch,
        timeSlots,
        keyAccomplishments: `Completed ${randomInt(3, 6)} out of ${TIME_SLOTS.length} scheduled tasks successfully`,
        challengesSolutions: Math.random() > 0.5 ? 'Managed time effectively despite schedule conflicts' : '',
        pendingWork: Math.random() > 0.4 ? 'Grade remaining assignments, prepare next lecture' : '',
        additionalNotes: '',
        reviewedBy: Math.random() > 0.4 ? randomItem(TRAINER_NAMES.slice(0, 3)) : ''
      });
    }
  }

  return reports;
}

export function generateOfficeAdminReports(): OfficeAdminReport[] {
  const reports: OfficeAdminReport[] = [];
  const dates = generateDates(30);
  const categories: OfficeAdminReport['itemCategory'][] = ['Electronics', 'Furniture', 'Stationery', 'Equipment', 'Other'];
  const conditions: OfficeAdminReport['condition'][] = ['New', 'Good', 'Fair', 'Poor', 'Damaged'];
  const actions: OfficeAdminReport['actionTaken'][] = ['Added', 'Removed', 'Repaired', 'Maintenance', 'Audited'];
  const locations = ['Lab 1', 'Lab 2', 'Lab 3', 'Staff Room', 'Principal Office', 'Store Room', 'Conference Room'];

  for (const staffName of OFFICE_ADMIN_NAMES) {
    const reportDates = dates.slice(0, randomInt(12, 25));
    for (const date of reportDates) {
      const itemsCount = randomInt(1, 4);
      for (let i = 0; i < itemsCount; i++) {
        reports.push({
          timestamp: new Date().toISOString(),
          staffName,
          date,
          itemName: randomItem(INVENTORY_ITEMS),
          itemCategory: randomItem(categories),
          quantity: randomInt(1, 10),
          condition: randomItem(conditions),
          actionTaken: randomItem(actions),
          location: randomItem(locations),
          notes: Math.random() > 0.6 ? 'Needs follow-up in next audit' : ''
        });
      }
    }
  }

  return reports;
}

const INDUSTRY_SECTORS: PlacementReport['industrySector'][] = [
  'IT / Software', 'Consulting', 'Manufacturing', 'BFSI', 'EdTech',
  'Healthcare', 'E-Commerce', 'FMCG', 'Automobile', 'Other'
];
const COMPANY_TYPES_PL: PlacementReport['companyType'][] = ['MNC', 'Startup', 'PSU / Large Corp', 'Private Sector', 'Other'];
const SOURCE_CHANNELS: PlacementReport['sourceChannel'][] = [
  'Alumni Reference', 'LinkedIn Outreach', 'Company Portal', 'Job Fair', 'College Website', 'Direct Approach', 'Other'
];
const MODES_OF_CONTACT: PlacementReport['modeOfContact'][] = ['Email', 'Phone Call', 'Video Call', 'In-Person Meeting', 'LinkedIn'];
const STATUSES: PlacementReport['currentStatus'][] = [
  'Identified', 'Email Sent', 'JD Sent', 'Under Discussion', 'In Negotiation',
  'MoU Signed', 'Drive Scheduled', 'Drive Completed', 'No Response', 'Blacklisted'
];
const PRIORITIES: PlacementReport['priority'][] = ['High', 'Medium', 'Low'];
const ASSIGNED_TO: PlacementReport['assignedTo'][] = [
  'Placement Officer', 'HOD / Coordinator', 'Campus Relations Manager', 'Business Development Associate'
];
const ACTIONS_REQUIRED = [
  'Resend JD + follow-up mail', 'Confirm PPT schedule', 'Negotiate CTC & finalize date',
  'Send student shortlist (resume)', 'Schedule campus visit', 'Follow up on MoU signing',
  'Confirm drive date', 'Send offer letter details', 'Share batch profiles'
];
const ROLES_OFFERED = [
  'Software Engineer Trainee', 'Business Analyst', 'Graduate Engineer Trainee',
  'Data Analyst', 'HR Executive', 'Probationary Officer', 'Marketing Associate',
  'Campus Relations Manager', 'Business Development Associate', 'Operations Trainee'
];
const CITIES = ['Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Jamshedpur'];
const DESIGNATIONS = ['HR Manager', 'Talent Acquisition', 'GM – HR', 'HR Business Partner', 'Deputy Manager HR', 'Campus Coordinator'];
const FIRST_NAMES = ['Priya', 'Rahul', 'Anita', 'Sunita', 'Karan', 'Deepa', 'Arjun', 'Meena'];
const LAST_NAMES = ['Sharma', 'Mehta', 'Rao', 'Joshi', 'Singh', 'Kumar', 'Nair', 'Pillai'];

export function generatePlacementReports(): PlacementReport[] {
  const reports: PlacementReport[] = [];
  const dates = generateDates(30);

  for (const staffName of PLACEMENT_NAMES) {
    const reportDates = dates.slice(0, randomInt(8, 18));
    for (const date of reportDates) {
      const status = randomItem(STATUSES);
      const isDriveCompleted = status === 'Drive Completed';
      const hasOpenings = ['MoU Signed', 'Drive Scheduled', 'Drive Completed', 'In Negotiation'].includes(status);
      const futureDate = new Date(Date.now() + randomInt(7, 90) * 24 * 60 * 60 * 1000);
      reports.push({
        timestamp: new Date().toISOString(),
        staffName,
        companyName: randomItem(COMPANIES),
        industrySector: randomItem(INDUSTRY_SECTORS),
        companyType: randomItem(COMPANY_TYPES_PL),
        hqLocation: randomItem(CITIES),
        contactPerson: `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`,
        designation: randomItem(DESIGNATIONS),
        emailId: `hr@company${randomInt(1, 20)}.com`,
        phoneNumber: `98${randomInt(10000000, 99999999)}`,
        sourceChannel: randomItem(SOURCE_CHANNELS),
        dateOfFirstContact: date,
        modeOfContact: randomItem(MODES_OF_CONTACT),
        currentStatus: status,
        rolesOffered: hasOpenings ? randomItem(ROLES_OFFERED) : '',
        numberOfOpenings: hasOpenings ? randomInt(3, 20) : 0,
        ctcLPA: hasOpenings ? parseFloat((randomInt(30, 120) / 10).toFixed(1)) : 0,
        driveDate: (isDriveCompleted || status === 'Drive Scheduled') ? formatDate(futureDate) : 'TBD',
        studentsSelected: isDriveCompleted ? randomInt(1, 10) : 0,
        remarks: Math.random() > 0.5 ? 'Follow up scheduled' : '',
        priority: randomItem(PRIORITIES),
        nextFollowUpDate: status !== 'Drive Completed' && status !== 'Blacklisted'
          ? formatDate(new Date(Date.now() + randomInt(2, 20) * 24 * 60 * 60 * 1000))
          : '',
        actionRequired: status !== 'Drive Completed' && status !== 'Blacklisted'
          ? randomItem(ACTIONS_REQUIRED) : '',
        assignedTo: status !== 'Drive Completed' && status !== 'Blacklisted'
          ? randomItem(ASSIGNED_TO) : '',
        followUpDone: Math.random() > 0.7
      });
    }
  }

  return reports;
}

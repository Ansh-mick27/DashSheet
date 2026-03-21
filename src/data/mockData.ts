// ==========================================
// DashSheet — Mock Data for Development
// ==========================================
import { Member, TrainingReport, WorkReport } from '../types';

const TRAINER_NAMES = [
  'Aarav Sharma', 'Priya Patel', 'Rohan Gupta', 'Neha Singh', 'Vikram Reddy',
  'Ananya Iyer', 'Karan Mehta', 'Divya Joshi', 'Arjun Nair', 'Sneha Das',
  'Rahul Verma', 'Pooja Mishra', 'Aditya Kumar', 'Riya Banerjee', 'Siddharth Rao',
  'Meera Choudhary', 'Nikhil Saxena', 'Kavya Menon', 'Dhruv Tiwari', 'Ishita Kapoor',
  'Manish Yadav', 'Shreya Agarwal', 'Varun Bhatt', 'Tanvi Deshmukh', 'Gaurav Pandey'
];

const DEPARTMENTS = ['Computer Science', 'Data Science', 'Web Development', 'Mobile Development', 'Cloud Computing'];
const BATCHES = ['Batch A', 'Batch B', 'Batch C', 'Batch D', 'Batch E'];
const COURSES = [
  'Python Fundamentals', 'React Development', 'Data Structures & Algorithms',
  'Machine Learning Basics', 'Cloud Architecture', 'Full Stack Development',
  'UI/UX Design', 'DevOps Practices', 'Cybersecurity Essentials', 'Database Management'
];
const TOPICS = [
  'Variables and Data Types', 'Component Lifecycle', 'Linked Lists',
  'Linear Regression', 'AWS EC2 Setup', 'REST API Design',
  'Wireframing Basics', 'CI/CD Pipelines', 'Network Security', 'SQL Joins',
  'Functions and Closures', 'State Management', 'Trees and Graphs',
  'Neural Networks', 'Docker Containers', 'Authentication & JWT',
  'Color Theory', 'Kubernetes Basics', 'Encryption Methods', 'NoSQL Databases'
];

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
  return TRAINER_NAMES.map((name, i) => ({
    name,
    department: DEPARTMENTS[i % DEPARTMENTS.length],
    batch: BATCHES[i % BATCHES.length],
    email: `${name.toLowerCase().replace(' ', '.')}@org.com`,
    role: i < 3 ? 'Admin' : 'Trainer' as 'Trainer' | 'Admin'
  }));
}

export function generateTrainingReports(): TrainingReport[] {
  const reports: TrainingReport[] = [];
  const dates = generateDates(30);

  for (const trainerName of TRAINER_NAMES) {
    const reportDates = dates.slice(0, randomInt(10, 25));
    for (const date of reportDates) {
      const totalEnrolled = randomInt(20, 45);
      reports.push({
        timestamp: new Date().toISOString(),
        trainerName,
        date,
        batch: randomItem(BATCHES),
        course: randomItem(COURSES),
        topicCovered: randomItem(TOPICS),
        learningObjectives: `Understand ${randomItem(TOPICS).toLowerCase()} concepts and apply them practically`,
        methods: {
          lecture: Math.random() > 0.3,
          groupDiscussion: Math.random() > 0.5,
          caseStudy: Math.random() > 0.6,
          rolePlay: Math.random() > 0.7,
          presentation: Math.random() > 0.4,
          practical: Math.random() > 0.3,
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

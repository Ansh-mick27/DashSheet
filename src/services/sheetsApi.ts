// ==========================================
// DashSheet — Data Service
// ==========================================
import { Member, TrainingReport, WorkReport } from '../types';
import { generateMembers, generateTrainingReports, generateWorkReports } from '../data/mockData';

// For development, use mock data
// For production, replace with Google Apps Script API calls
const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || '';

interface SheetData {
  members: Member[];
  trainingReports: TrainingReport[];
  workReports: WorkReport[];
}

let cachedData: SheetData | null = null;

export async function fetchSheetData(): Promise<SheetData> {
  if (cachedData) return cachedData;

  if (APPS_SCRIPT_URL) {
    try {
      const response = await fetch(APPS_SCRIPT_URL);
      const data = await response.json();
      cachedData = data;
      return data;
    } catch (error) {
      console.error('Failed to fetch from Google Sheets, using mock data:', error);
    }
  }

  // Fallback to mock data
  cachedData = {
    members: generateMembers(),
    trainingReports: generateTrainingReports(),
    workReports: generateWorkReports()
  };

  return cachedData;
}

export function refreshData(): void {
  cachedData = null;
}

export function parseDate(dateStr: string): Date {
  // Parse DD/MM/YYYY format
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

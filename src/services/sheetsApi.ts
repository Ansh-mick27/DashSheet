// ==========================================
// DashSheet — Data Service
// ==========================================
import { Member, TrainingReport, WorkReport, OfficeAdminReport, PlacementReport, Notification } from '../types';
import {
  generateMembers, generateTrainingReports, generateWorkReports,
  generateOfficeAdminReports, generatePlacementReports
} from '../data/mockData';

export function getAppsScriptUrl(): string {
  return localStorage.getItem('APPS_SCRIPT_URL') || import.meta.env.VITE_APPS_SCRIPT_URL || '';
}

export function setAppsScriptUrl(url: string): void {
  localStorage.setItem('APPS_SCRIPT_URL', url);
  refreshData();
}

interface SheetData {
  members: Member[];
  trainingReports: TrainingReport[];
  workReports: WorkReport[];
  officeAdminReports: OfficeAdminReport[];
  placementReports: PlacementReport[];
}

let cachedData: SheetData | null = null;

export async function fetchSheetData(): Promise<SheetData> {
  if (cachedData) return cachedData;

  const url = getAppsScriptUrl();

  if (url) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      cachedData = data;
      return data;
    } catch (error) {
      console.error('Failed to fetch from Google Sheets, using mock data:', error);
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

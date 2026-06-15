// ==========================================
// DashSheet — Inventory Assignment Helpers
// ==========================================
import { OfficeAdminReport } from '../types';
import { parseDate } from '../services/dataApi';

export interface CurrentAssignment {
  itemName: string;
  holder: string;
  since: string;
  durationDays: number;
}

export interface AssignmentHistoryEntry {
  itemName: string;
  holder: string;
  from: string;
  to: string | null;
  durationDays: number;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function diffDays(from: string, to: string | null): number {
  const start = parseDate(from);
  const end = to ? parseDate(to) : new Date();
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / MS_PER_DAY));
}

function sortedReportsForItem(itemName: string, reports: OfficeAdminReport[]): OfficeAdminReport[] {
  return reports
    .filter(r => r.itemName === itemName)
    .slice()
    .sort((a, b) => {
      const dateDiff = parseDate(a.date).getTime() - parseDate(b.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
}

export function getItemHistory(itemName: string, reports: OfficeAdminReport[]): AssignmentHistoryEntry[] {
  const rows = sortedReportsForItem(itemName, reports);
  const segments: AssignmentHistoryEntry[] = [];
  let current: { holder: string; from: string } | null = null;

  for (const r of rows) {
    const holder = r.assignedTo ?? '';
    if (current && holder === current.holder) continue;

    if (current && current.holder) {
      segments.push({
        itemName,
        holder: current.holder,
        from: current.from,
        to: r.date,
        durationDays: diffDays(current.from, r.date)
      });
    }

    current = { holder, from: r.date };
  }

  if (current && current.holder) {
    segments.push({
      itemName,
      holder: current.holder,
      from: current.from,
      to: null,
      durationDays: diffDays(current.from, null)
    });
  }

  return segments;
}

export function getCurrentAssignment(itemName: string, reports: OfficeAdminReport[]): CurrentAssignment | null {
  const history = getItemHistory(itemName, reports);
  const last = history[history.length - 1];
  if (!last || last.to !== null) return null;
  return {
    itemName,
    holder: last.holder,
    since: last.from,
    durationDays: last.durationDays
  };
}

export function getCurrentHoldings(memberName: string, reports: OfficeAdminReport[]): CurrentAssignment[] {
  const itemNames = Array.from(new Set(reports.map(r => r.itemName)));
  return itemNames
    .map(itemName => getCurrentAssignment(itemName, reports))
    .filter((a): a is CurrentAssignment => a !== null && a.holder === memberName);
}

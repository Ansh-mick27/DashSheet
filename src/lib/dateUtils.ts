// ==========================================
// DashSheet — Date Helpers
// ==========================================

// Returns today's date as YYYY-MM-DD (for <input type="date">)
export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Converts YYYY-MM-DD (input type="date") to DD/MM/YYYY (stored format)
export function isoToDDMMYYYY(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

import { DailyManpower, JobRole, MatrixRow, MatrixSummary } from '../types';

/**
 * Format date string YYYY-MM-DD into Indonesian formatted date
 * e.g. "02 Okt 2026" or "Jumat, 02 Okt 2026"
 */
export const INDONESIAN_DAY_NAMES = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

export const INDONESIAN_MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

export const INDONESIAN_MONTH_NAMES_FULL = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/**
 * Generate an inclusive list of YYYY-MM-DD dates between startDate and endDate
 */
export function getDateRangeArray(startDateStr: string, endDateStr: string): string[] {
  if (!startDateStr || !endDateStr) return [];
  
  const start = new Date(startDateStr + 'T00:00:00');
  const end = new Date(endDateStr + 'T00:00:00');
  
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return [];
  }
  
  const dates: string[] = [];
  const current = new Date(start);
  
  while (current <= end) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

/**
 * Get Indonesian day name for a YYYY-MM-DD date
 */
export function getDayNameIndo(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return '';
  return INDONESIAN_DAY_NAMES[d.getDay()];
}

/**
 * Format YYYY-MM-DD into human-readable Indonesian string
 */
export function formatDateIndo(dateStr: string, includeDayName = false): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = INDONESIAN_MONTH_NAMES_SHORT[d.getMonth()];
  const year = d.getFullYear();
  
  if (includeDayName) {
    const dayName = INDONESIAN_DAY_NAMES[d.getDay()];
    return `${dayName}, ${day} ${month} ${year}`;
  }
  
  return `${day} ${month} ${year}`;
}

export function formatDateIndoFull(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  
  const day = d.getDate();
  const month = INDONESIAN_MONTH_NAMES_FULL[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Standard rounding to 2 decimal places with comma formatted for Indonesia
 */
export function formatDecimalIndo(num: number): string {
  if (isNaN(num)) return '0,00';
  return num.toLocaleString('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Build matrix summary from job roles, daily manpower records, and date range
 */
export function computeWeeklyMatrix(
  startDateStr: string,
  endDateStr: string,
  roles: JobRole[],
  records: DailyManpower[]
): MatrixSummary {
  const dates = getDateRangeArray(startDateStr, endDateStr);
  const calendarDaysCount = Math.max(dates.length, 1);
  
  // Create quick lookup: [date][roleId] = DailyManpower
  const recordMap: Record<string, Record<string, DailyManpower>> = {};
  const datesWithAnyRecord = new Set<string>();
  
  for (const rec of records) {
    if (!recordMap[rec.work_date]) {
      recordMap[rec.work_date] = {};
    }
    recordMap[rec.work_date][rec.job_role_id] = rec;
    datesWithAnyRecord.add(rec.work_date);
  }
  
  // Sort roles by sort_order
  const sortedRoles = [...roles].sort((a, b) => a.sort_order - b.sort_order);
  
  const dailyTotals: Record<string, number> = {};
  const dailyRecordedFlags: Record<string, boolean> = {};
  
  for (const d of dates) {
    dailyTotals[d] = 0;
    dailyRecordedFlags[d] = datesWithAnyRecord.has(d);
  }
  
  // Build rows per role
  const rows: MatrixRow[] = sortedRoles.map((role) => {
    const countsByDate: Record<string, number> = {};
    const notesByDate: Record<string, string> = {};
    let totalManDays = 0;
    
    for (const d of dates) {
      const rec = recordMap[d]?.[role.id];
      const count = rec ? Number(rec.worker_count) || 0 : 0;
      countsByDate[d] = count;
      notesByDate[d] = rec?.notes || '';
      
      totalManDays += count;
      dailyTotals[d] += count;
    }
    
    // Average per calendar day
    const averagePerDay = Math.round((totalManDays / calendarDaysCount) * 100) / 100;
    
    return {
      roleId: role.id,
      roleName: role.name,
      sortOrder: role.sort_order,
      isActive: role.is_active,
      countsByDate,
      notesByDate,
      totalManDays,
      averagePerDay,
    };
  });
  
  // Calculate grand total man days
  let grandTotalManDays = 0;
  let peakManpower = 0;
  const peakDates: string[] = [];
  const missingDates: string[] = [];
  
  for (const d of dates) {
    const dayTotal = dailyTotals[d];
    grandTotalManDays += dayTotal;
    
    if (!dailyRecordedFlags[d]) {
      missingDates.push(d);
    }
    
    if (dayTotal > peakManpower) {
      peakManpower = dayTotal;
    }
  }
  
  // Find all dates that reached the peak (only if peak > 0)
  if (peakManpower > 0) {
    for (const d of dates) {
      if (dailyTotals[d] === peakManpower) {
        peakDates.push(d);
      }
    }
  }
  
  const grandAveragePerDay = Math.round((grandTotalManDays / calendarDaysCount) * 100) / 100;
  
  return {
    dates,
    rows,
    dailyTotals,
    dailyRecordedFlags,
    grandTotalManDays,
    grandAveragePerDay,
    calendarDaysCount,
    peakManpower,
    peakDates,
    missingDates,
  };
}

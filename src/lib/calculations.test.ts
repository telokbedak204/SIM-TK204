import { describe, it, expect } from 'vitest';
import {
  getDateRangeArray,
  getDayNameIndo,
  formatDateIndo,
  formatDecimalIndo,
  computeWeeklyMatrix
} from './calculations';
import { validateWorkerCount, validateDateRange } from './validation';
import { JobRole, DailyManpower } from '../types';

describe('SIM-TK204 Calculations & Logic Tests', () => {
  // Test Section S Demo Spec
  it('should accurately calculate Demo Project "Pasar Loka" figures (97 total man-days and 13.86 avg)', () => {
    const startDate = '2026-10-02';
    const endDate = '2026-10-08';
    const dates = getDateRangeArray(startDate, endDate);
    expect(dates.length).toBe(7);

    const mockRoles: JobRole[] = [
      { id: 'r1', project_id: 'p1', name: 'Project Manager', sort_order: 1, is_active: true, created_at: '', updated_at: '' },
      { id: 'r2', project_id: 'p1', name: 'Mandor', sort_order: 2, is_active: true, created_at: '', updated_at: '' },
      { id: 'r3', project_id: 'p1', name: 'Kepala Tukang', sort_order: 3, is_active: true, created_at: '', updated_at: '' },
      { id: 'r4', project_id: 'p1', name: 'Surveyor', sort_order: 4, is_active: true, created_at: '', updated_at: '' },
      { id: 'r5', project_id: 'p1', name: 'Pekerja', sort_order: 5, is_active: true, created_at: '', updated_at: '' },
      { id: 'r6', project_id: 'p1', name: 'Tenaga Sondir', sort_order: 6, is_active: true, created_at: '', updated_at: '' },
      { id: 'r7', project_id: 'p1', name: 'Drafter', sort_order: 7, is_active: true, created_at: '', updated_at: '' },
      { id: 'r8', project_id: 'p1', name: 'HSE Koordinator', sort_order: 8, is_active: true, created_at: '', updated_at: '' },
    ];

    // Worker counts as specified in prompt:
    // PM: 1 daily (7 total)
    // Mandor: 1 daily (7 total)
    // Kepala Tukang: 0 daily (0 total)
    // Surveyor: 1 daily (7 total)
    // Pekerja: 11, 11, 8, 8, 8, 8, 8 (62 total)
    // Sondir: 0 daily (0 total)
    // Drafter: 0 daily (0 total)
    // HSE: 2 daily (14 total)
    // Daily totals expected: 16, 16, 13, 13, 13, 13, 13 = 97
    const mockRecords: DailyManpower[] = [];
    const pekerjaCounts = [11, 11, 8, 8, 8, 8, 8];

    dates.forEach((d, idx) => {
      mockRecords.push(
        { id: `rec-${d}-1`, project_id: 'p1', job_role_id: 'r1', work_date: d, worker_count: 1, created_at: '', updated_at: '' },
        { id: `rec-${d}-2`, project_id: 'p1', job_role_id: 'r2', work_date: d, worker_count: 1, created_at: '', updated_at: '' },
        { id: `rec-${d}-3`, project_id: 'p1', job_role_id: 'r3', work_date: d, worker_count: 0, created_at: '', updated_at: '' },
        { id: `rec-${d}-4`, project_id: 'p1', job_role_id: 'r4', work_date: d, worker_count: 1, created_at: '', updated_at: '' },
        { id: `rec-${d}-5`, project_id: 'p1', job_role_id: 'r5', work_date: d, worker_count: pekerjaCounts[idx], created_at: '', updated_at: '' },
        { id: `rec-${d}-6`, project_id: 'p1', job_role_id: 'r6', work_date: d, worker_count: 0, created_at: '', updated_at: '' },
        { id: `rec-${d}-7`, project_id: 'p1', job_role_id: 'r7', work_date: d, worker_count: 0, created_at: '', updated_at: '' },
        { id: `rec-${d}-8`, project_id: 'p1', job_role_id: 'r8', work_date: d, worker_count: 2, created_at: '', updated_at: '' }
      );
    });

    const summary = computeWeeklyMatrix(startDate, endDate, mockRoles, mockRecords);

    // Verify daily totals: 16, 16, 13, 13, 13, 13, 13
    expect(summary.dailyTotals['2026-10-02']).toBe(16);
    expect(summary.dailyTotals['2026-10-03']).toBe(16);
    expect(summary.dailyTotals['2026-10-04']).toBe(13);
    expect(summary.dailyTotals['2026-10-05']).toBe(13);
    expect(summary.dailyTotals['2026-10-06']).toBe(13);
    expect(summary.dailyTotals['2026-10-07']).toBe(13);
    expect(summary.dailyTotals['2026-10-08']).toBe(13);

    // Verify grand total man days = 97
    expect(summary.grandTotalManDays).toBe(97);

    // Verify average per day = 13.86
    expect(summary.grandAveragePerDay).toBe(13.86);

    // Verify peak manpower = 16 (on 2026-10-02 and 2026-10-03)
    expect(summary.peakManpower).toBe(16);
    expect(summary.peakDates).toEqual(['2026-10-02', '2026-10-03']);

    // Verify missing dates is empty since all 7 days have records
    expect(summary.missingDates.length).toBe(0);
  });

  it('should detect missing dates when some days have no records', () => {
    const startDate = '2026-10-01';
    const endDate = '2026-10-04'; // 4 days: 01, 02, 03, 04
    const mockRoles: JobRole[] = [
      { id: 'r1', project_id: 'p1', name: 'Tukang', sort_order: 1, is_active: true, created_at: '', updated_at: '' }
    ];
    // Record only on 01 and 03
    const mockRecords: DailyManpower[] = [
      { id: '1', project_id: 'p1', job_role_id: 'r1', work_date: '2026-10-01', worker_count: 5, created_at: '', updated_at: '' },
      { id: '2', project_id: 'p1', job_role_id: 'r1', work_date: '2026-10-03', worker_count: 5, created_at: '', updated_at: '' }
    ];

    const summary = computeWeeklyMatrix(startDate, endDate, mockRoles, mockRecords);
    expect(summary.missingDates).toEqual(['2026-10-02', '2026-10-04']);
    expect(summary.grandTotalManDays).toBe(10);
    // 10 / 4 calendar days = 2.5
    expect(summary.grandAveragePerDay).toBe(2.5);
  });

  it('should correctly format Indonesian day and date strings', () => {
    // 2026-10-02 is a Friday (Jumat)
    expect(getDayNameIndo('2026-10-02')).toBe('Jumat');
    expect(formatDateIndo('2026-10-02')).toBe('02 Okt 2026');
    expect(formatDateIndo('2026-10-02', true)).toBe('Jumat, 02 Okt 2026');
    expect(formatDecimalIndo(13.86)).toBe('13,86');
  });

  it('should validate worker count strictly (reject negatives, floats, non-numbers, >9999)', () => {
    expect(validateWorkerCount(10).isValid).toBe(true);
    expect(validateWorkerCount(0).isValid).toBe(true);
    expect(validateWorkerCount('15').isValid).toBe(true);
    
    // Rejections
    expect(validateWorkerCount(-1).isValid).toBe(false);
    expect(validateWorkerCount(3.5).isValid).toBe(false);
    expect(validateWorkerCount('abc').isValid).toBe(false);
    expect(validateWorkerCount(10000).isValid).toBe(false);
  });

  it('should validate date range correctly', () => {
    expect(validateDateRange('2026-10-01', '2026-10-07').isValid).toBe(true);
    expect(validateDateRange('2026-10-07', '2026-10-07').isValid).toBe(true);
    // Invalid when end before start
    expect(validateDateRange('2026-10-08', '2026-10-02').isValid).toBe(false);
  });

  it('should strictly isolate data between distinct projects (no cross-contamination)', () => {
    const projectA = 'proj-aaa';
    const projectB = 'proj-bbb';

    const roleA: JobRole = { id: 'role-a', project_id: projectA, name: 'Pekerja A', sort_order: 1, is_active: true, created_at: '', updated_at: '' };
    const roleB: JobRole = { id: 'role-b', project_id: projectB, name: 'Pekerja B', sort_order: 1, is_active: true, created_at: '', updated_at: '' };

    const records: DailyManpower[] = [
      { id: '1', project_id: projectA, job_role_id: 'role-a', work_date: '2026-10-05', worker_count: 20, created_at: '', updated_at: '' },
      { id: '2', project_id: projectB, job_role_id: 'role-b', work_date: '2026-10-05', worker_count: 99, created_at: '', updated_at: '' },
    ];

    // Compute matrix for project A only
    const summaryA = computeWeeklyMatrix('2026-10-05', '2026-10-05', [roleA], records.filter(r => r.project_id === projectA));
    expect(summaryA.grandTotalManDays).toBe(20);
    expect(summaryA.dailyTotals['2026-10-05']).toBe(20);

    // Compute matrix for project B only
    const summaryB = computeWeeklyMatrix('2026-10-05', '2026-10-05', [roleB], records.filter(r => r.project_id === projectB));
    expect(summaryB.grandTotalManDays).toBe(99);
    expect(summaryB.dailyTotals['2026-10-05']).toBe(99);
  });

  it('should preserve historical records for inactive roles in matrix calculation', () => {
    // If a role is deactivated, previous days where this role had worker counts must still be accounted
    const inactiveRole: JobRole = {
      id: 'role-old',
      project_id: 'p1',
      name: 'Tenaga Sondir (Selesai)',
      sort_order: 1,
      is_active: false, // Inactive!
      created_at: '',
      updated_at: '',
    };

    const historicalRecord: DailyManpower = {
      id: 'rec-old',
      project_id: 'p1',
      job_role_id: 'role-old',
      work_date: '2026-10-02',
      worker_count: 4,
      created_at: '',
      updated_at: '',
    };

    const summary = computeWeeklyMatrix('2026-10-02', '2026-10-02', [inactiveRole], [historicalRecord]);
    expect(summary.grandTotalManDays).toBe(4);
    expect(summary.rows[0].totalManDays).toBe(4);
    expect(summary.rows[0].isActive).toBe(false);
  });
});

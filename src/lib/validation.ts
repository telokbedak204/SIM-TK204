export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate worker count input
 * Must be integer, non-negative, between 0 and 9999, not NaN or float
 */
export function validateWorkerCount(value: unknown): ValidationResult {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: 'Jumlah tenaga kerja wajib diisi.' };
  }

  const num = typeof value === 'number' ? value : Number(value);

  if (isNaN(num)) {
    return { isValid: false, error: 'Jumlah tenaga kerja harus berupa angka yang valid.' };
  }

  if (!Number.isInteger(num)) {
    return { isValid: false, error: 'Jumlah tenaga kerja harus bilangan bulat (tidak boleh desimal).' };
  }

  if (num < 0) {
    return { isValid: false, error: 'Jumlah tenaga kerja tidak boleh bernilai negatif.' };
  }

  if (num > 9999) {
    return { isValid: false, error: 'Jumlah tenaga kerja melebihi batas maksimum (maksimal 9.999 orang per jabatan).' };
  }

  return { isValid: true };
}

/**
 * Validate date format and validity
 */
export function validateDate(dateStr: string): ValidationResult {
  if (!dateStr || dateStr.trim() === '') {
    return { isValid: false, error: 'Tanggal wajib diisi.' };
  }

  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) {
    return { isValid: false, error: 'Format tanggal harus YYYY-MM-DD.' };
  }

  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) {
    return { isValid: false, error: 'Tanggal tidak valid.' };
  }

  return { isValid: true };
}

/**
 * Validate date range (start date <= end date)
 */
export function validateDateRange(startDateStr: string, endDateStr: string): ValidationResult {
  const startCheck = validateDate(startDateStr);
  if (!startCheck.isValid) return startCheck;

  const endCheck = validateDate(endDateStr);
  if (!endCheck.isValid) return endCheck;

  const start = new Date(startDateStr + 'T00:00:00');
  const end = new Date(endDateStr + 'T00:00:00');

  if (end < start) {
    return { isValid: false, error: 'Tanggal akhir tidak boleh mendahului tanggal mulai.' };
  }

  return { isValid: true };
}

/**
 * Validate project fields
 */
export function validateProjectData(data: {
  code?: string;
  name?: string;
  owner_name?: string;
  contractor_name?: string;
  consultant_name?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  project_manager?: string;
  site_manager?: string;
}): ValidationResult {
  if (!data.code || data.code.trim() === '') {
    return { isValid: false, error: 'Kode proyek wajib diisi.' };
  }
  if (!data.name || data.name.trim() === '') {
    return { isValid: false, error: 'Nama proyek wajib diisi.' };
  }
  if (!data.owner_name || data.owner_name.trim() === '') {
    return { isValid: false, error: 'Pemilik / Pemberi tugas wajib diisi.' };
  }
  if (!data.contractor_name || data.contractor_name.trim() === '') {
    return { isValid: false, error: 'Nama kontraktor pelaksana wajib diisi.' };
  }
  if (!data.consultant_name || data.consultant_name.trim() === '') {
    return { isValid: false, error: 'Nama konsultan MK / pengawas wajib diisi.' };
  }
  if (!data.location || data.location.trim() === '') {
    return { isValid: false, error: 'Lokasi proyek wajib diisi.' };
  }
  if (!data.project_manager || data.project_manager.trim() === '') {
    return { isValid: false, error: 'Nama Project Manager wajib diisi.' };
  }
  if (!data.site_manager || data.site_manager.trim() === '') {
    return { isValid: false, error: 'Nama Site Manager wajib diisi.' };
  }

  const rangeCheck = validateDateRange(data.start_date || '', data.end_date || '');
  if (!rangeCheck.isValid) return rangeCheck;

  return { isValid: true };
}

/**
 * Validate job role name
 */
export function validateJobRole(name: string): ValidationResult {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'Nama jabatan / keahlian tidak boleh kosong.' };
  }
  if (name.trim().length > 100) {
    return { isValid: false, error: 'Nama jabatan maksimal 100 karakter.' };
  }
  return { isValid: true };
}

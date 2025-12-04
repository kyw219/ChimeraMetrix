const SAVED_REPORTS_KEY = 'chimeramatrix_saved_reports';

export interface SavedReport {
  id: string;
  timestamp: number;
  platform: string;
  strategy: any;
  predictions: any;
  matchedVideos: any[];
  performanceDrivers: any;
  features: any;
}

export function saveReport(report: Omit<SavedReport, 'id' | 'timestamp'>): SavedReport {
  const newReport: SavedReport = {
    ...report,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };

  const reports = getSavedReports();
  reports.unshift(newReport); // Add to beginning
  
  // Keep only last 50 reports
  const trimmedReports = reports.slice(0, 50);
  
  localStorage.setItem(SAVED_REPORTS_KEY, JSON.stringify(trimmedReports));
  
  return newReport;
}

export function getSavedReports(): SavedReport[] {
  try {
    const saved = localStorage.getItem(SAVED_REPORTS_KEY);
    const reports = saved ? JSON.parse(saved) : [];
    // Sort by timestamp descending (newest first)
    return reports.sort((a: SavedReport, b: SavedReport) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Failed to load saved reports:', error);
    return [];
  }
}

export function getReportById(id: string): SavedReport | null {
  const reports = getSavedReports();
  return reports.find(r => r.id === id) || null;
}

export function deleteReport(id: string): void {
  const reports = getSavedReports();
  const filtered = reports.filter(r => r.id !== id);
  localStorage.setItem(SAVED_REPORTS_KEY, JSON.stringify(filtered));
}

export function clearAllReports(): void {
  localStorage.removeItem(SAVED_REPORTS_KEY);
}

import { compressBase64Image } from './imageCompression';

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

export async function saveReport(report: Omit<SavedReport, 'id' | 'timestamp'>): Promise<SavedReport> {
  const newReport: SavedReport = {
    ...report,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };

  // Compress cover image to save space while keeping visual preview
  let compressedCoverUrl = null;
  if (newReport.strategy.coverImageUrl && newReport.strategy.coverImageUrl.startsWith('data:image')) {
    compressedCoverUrl = await compressBase64Image(newReport.strategy.coverImageUrl, 320, 0.6);
  }

  // Prepare report with compressed images to avoid localStorage quota issues
  const reportToSave = {
    ...newReport,
    strategy: {
      ...newReport.strategy,
      // Use compressed thumbnail instead of full-size image
      coverImageUrl: compressedCoverUrl,
    },
    matchedVideos: newReport.matchedVideos.map((video: any) => ({
      ...video,
      // Keep thumbnail emoji/icon but remove any base64 data
      thumbnail: video.thumbnail && !video.thumbnail.startsWith('data:') ? video.thumbnail : '🎬',
    })),
  };

  const reports = getSavedReports();
  reports.unshift(reportToSave); // Add to beginning
  
  // Keep only last 50 reports
  const trimmedReports = reports.slice(0, 50);
  
  try {
    localStorage.setItem(SAVED_REPORTS_KEY, JSON.stringify(trimmedReports));
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      // If still exceeding quota, reduce to last 20 reports
      const reducedReports = reports.slice(0, 20);
      try {
        localStorage.setItem(SAVED_REPORTS_KEY, JSON.stringify(reducedReports));
      } catch (retryError) {
        // If still failing, keep only last 10
        const minimalReports = reports.slice(0, 10);
        localStorage.setItem(SAVED_REPORTS_KEY, JSON.stringify(minimalReports));
      }
    } else {
      throw error;
    }
  }
  
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

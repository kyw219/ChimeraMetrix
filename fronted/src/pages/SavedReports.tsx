import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SavedReportCard } from "@/components/SavedReportCard";
import { SavedReportModal } from "@/components/SavedReportModal";
import { Bookmark } from "lucide-react";
import { getSavedReports, deleteReport, type SavedReport } from "@/lib/savedReports";

export default function SavedReports() {
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);

  // Load saved reports from localStorage
  const loadReports = () => {
    const reports = getSavedReports();
    setSavedReports(reports);
  };

  useEffect(() => {
    loadReports();
  }, []);

  // Handle report deletion
  const handleDeleteReport = (reportId: string) => {
    deleteReport(reportId);
    loadReports(); // Reload reports after deletion
    setSelectedReport(null); // Close modal
  };

  // Convert SavedReport to format expected by SavedReportCard
  const formatReportForCard = (report: SavedReport) => ({
    id: report.id,
    timestamp: new Date(report.timestamp),
    strategy: {
      cover: report.strategy.cover,
      title: report.strategy.title,
      hashtags: report.strategy.hashtags.split(' ').filter((h: string) => h.startsWith('#')),
      postingTime: report.strategy.postingTime,
    },
    metrics: {
      views24h: report.predictions?.metrics?.views24h || 'N/A',
      ctr24h: report.predictions?.metrics?.ctr24h || 'N/A',
      likes24h: report.predictions?.metrics?.likes24h || 'N/A',
    },
  });

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2 flex items-center gap-3">
            <Bookmark className="w-8 h-8" />
            Saved Reports
          </h1>
          <p className="text-sm text-muted-foreground">
            Your saved strategy backtest reports and predictions
          </p>
        </div>

        {/* Reports Grid */}
        {savedReports.length === 0 ? (
          <div className="panel-base rounded-2xl p-12 text-center">
            <Bookmark className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No saved reports yet</h3>
            <p className="text-sm text-muted-foreground">
              Run a backtest and save your results to see them here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
            {savedReports.map((report) => (
              <SavedReportCard
                key={report.id}
                {...formatReportForCard(report)}
                onClick={() => setSelectedReport(report)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <SavedReportModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onDelete={handleDeleteReport}
        />
      )}
    </DashboardLayout>
  );
}

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SavedReportCard } from "@/components/SavedReportCard";
import { SavedReportModal } from "@/components/SavedReportModal";
import { Bookmark } from "lucide-react";

// Mock saved reports data
const mockSavedReports = [
  {
    id: "1",
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    strategy: {
      cover: "Close-up of hands working on vintage film camera with shallow depth of field",
      title: "Why film photography is making a comeback in 2024",
      hashtags: ["#FilmPhotography", "#VintageVibes", "#AnalogIsBack", "#Photography2024", "#FilmCommunity"],
      postingTime: "7:00 PM EST",
    },
    metrics: {
      views24h: "125K",
      ctr24h: "8.2%",
      likes24h: "12.4K",
    },
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    strategy: {
      cover: "Neon-lit street scene at night with reflections on wet pavement",
      title: "The secret to capturing cinematic night photography",
      hashtags: ["#NightPhotography", "#CinematicVibes", "#StreetPhotography"],
      postingTime: "9:00 PM EST",
    },
    metrics: {
      views24h: "89K",
      ctr24h: "7.1%",
      likes24h: "8.9K",
    },
  },
];

export default function SavedReports() {
  const [selectedReport, setSelectedReport] = useState<typeof mockSavedReports[0] | null>(null);

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
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
          {mockSavedReports.map((report) => (
            <SavedReportCard
              key={report.id}
              report={report}
              onClick={() => setSelectedReport(report)}
            />
          ))}
        </div>

        {/* Empty State */}
        {mockSavedReports.length === 0 && (
          <div className="panel-base rounded-2xl p-12 text-center">
            <Bookmark className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No saved reports yet</h3>
            <p className="text-sm text-muted-foreground">
              Run a backtest and save your results to see them here
            </p>
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <SavedReportModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </DashboardLayout>
  );
}

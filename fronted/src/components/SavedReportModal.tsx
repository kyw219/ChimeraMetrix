import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { StrategyPreview } from "./StrategyPreview";
import { MetricCard } from "./MetricCard";
import { PerformanceChart } from "./PerformanceChart";
import { Badge } from "./ui/badge";
import { Eye, TrendingUp, Heart, Trash2, Play } from "lucide-react";
import { mockBacktestData, mockMatchedVideos } from "@/lib/mockData";
import { useNavigate } from "react-router-dom";

interface SavedReportModalProps {
  report: any; // Full SavedReport from savedReports.ts
  onClose: () => void;
}

export const SavedReportModal = ({ report, onClose }: SavedReportModalProps) => {
  const [activeTab, setActiveTab] = useState("views");
  const navigate = useNavigate();

  const getChartData = () => {
    switch (activeTab) {
      case "views":
        return mockBacktestData.views;
      case "ctr":
        return mockBacktestData.ctr;
      case "likes":
        return mockBacktestData.likes;
      default:
        return mockBacktestData.views;
    }
  };

  const getChartTitle = () => {
    switch (activeTab) {
      case "views":
        return "Views Over 24 Hours";
      case "ctr":
        return "Click-Through Rate (%) Over 24 Hours";
      case "likes":
        return "Likes Over 24 Hours";
      default:
        return "";
    }
  };

  const handleRerun = () => {
    navigate("/backtest");
    onClose();
  };

  const handleDelete = () => {
    // TODO: Implement delete functionality
    console.log("Delete report:", report.id);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">Saved Backtest Report</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Strategy Preview */}
          <div>
            <h3 className="text-sm font-bold text-accent mb-3 uppercase tracking-wide">
              Strategy Preview
            </h3>
            <StrategyPreview 
              strategy={report.strategy} 
            />
          </div>

          {/* Metrics */}
          <div className="grid md:grid-cols-3 gap-4">
            <MetricCard
              icon={Eye}
              label="Predicted 24h Views"
              value={report.predictions?.metrics?.views24h || 'N/A'}
              note="Based on averaged performance"
              badge="Read-only"
              iconColor="text-chart-1"
            />
            <MetricCard
              icon={TrendingUp}
              label="Predicted 24h CTR"
              value={report.predictions?.metrics?.ctr24h || 'N/A'}
              note="Based on averaged performance"
              badge="Read-only"
              iconColor="text-chart-2"
            />
            <MetricCard
              icon={Heart}
              label="Predicted 24h Likes"
              value={report.predictions?.metrics?.likes24h || 'N/A'}
              note="Based on averaged performance"
              badge="Read-only"
              iconColor="text-chart-3"
            />
          </div>

          {/* Charts */}
          <div className="subpanel rounded-xl p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="w-full md:w-auto">
                <TabsTrigger value="views" className="flex-1 md:flex-none">
                  Views
                </TabsTrigger>
                <TabsTrigger value="ctr" className="flex-1 md:flex-none">
                  CTR
                </TabsTrigger>
                <TabsTrigger value="likes" className="flex-1 md:flex-none">
                  Likes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="views" className="mt-0">
                <PerformanceChart
                  data={getChartData()}
                  title={getChartTitle()}
                  color="hsl(var(--chart-1))"
                />
              </TabsContent>
              <TabsContent value="ctr" className="mt-0">
                <PerformanceChart
                  data={getChartData()}
                  title={getChartTitle()}
                  color="hsl(var(--chart-2))"
                />
              </TabsContent>
              <TabsContent value="likes" className="mt-0">
                <PerformanceChart
                  data={getChartData()}
                  title={getChartTitle()}
                  color="hsl(var(--chart-3))"
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Matched Videos */}
          <div>
            <h3 className="text-sm font-bold text-info mb-3 uppercase tracking-wide">
              Similar Videos ({report.matchedVideos?.length || mockMatchedVideos.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(report.matchedVideos || mockMatchedVideos).slice(0, 4).map((video: any, index: number) => (
                <div key={index} className="subpanel rounded-xl p-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-muted/30 rounded-lg flex items-center justify-center text-lg shrink-0">
                      {video.thumbnail}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium text-foreground mb-1 line-clamp-2">
                        {video.title || 'Untitled'}
                      </p>
                      <div className="flex items-center gap-2 text-[9px] text-muted-foreground mb-1">
                        <span>CTR: {video.ctr || 'N/A'}</span>
                        <span>•</span>
                        <span>{video.views24h || 'N/A'} views</span>
                      </div>
                      <Badge variant="outline" className="text-[9px] px-2 py-0.5">
                        Similarity {video.similarity || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border/30">
            <Button
              onClick={handleRerun}
              className="flex-1 bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]"
            >
              <Play className="w-4 h-4 mr-2" />
              Re-run Backtest
            </Button>
            <Button
              onClick={handleDelete}
              variant="outline"
              className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Report
            </Button>
            <Button onClick={onClose} variant="ghost" className="px-6">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

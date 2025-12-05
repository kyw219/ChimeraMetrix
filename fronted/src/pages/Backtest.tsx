import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MetricCard } from "@/components/MetricCard";
import { PerformanceChart } from "@/components/PerformanceChart";
import { StrategyPreview } from "@/components/StrategyPreview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, TrendingUp, Heart, Sparkles } from "lucide-react";
import { mockBacktestData, mockMatchedVideos, mockInsights, mockStrategy } from "@/lib/mockData";
import { useWorkflow } from "@/contexts/WorkflowContext";
import { saveReport } from "@/lib/savedReports";
import { useToast } from "@/hooks/use-toast";

const InsightsPanel = ({ strategy, performanceDrivers, matchedVideos }: any) => {
  const [expandedFactor, setExpandedFactor] = useState<number | null>(null);

  // Convert performanceDrivers to factors format
  const factors = performanceDrivers ? [
    {
      name: "Cover Design",
      impact: performanceDrivers.coverDesign.impact === "High" ? "High Impact" : performanceDrivers.coverDesign.impact === "Medium" ? "Medium Impact" : "Low Impact",
      description: performanceDrivers.coverDesign.reason,
    },
    {
      name: "Title Framing",
      impact: performanceDrivers.titleFraming.impact === "High" ? "High Impact" : performanceDrivers.titleFraming.impact === "Medium" ? "Medium Impact" : "Low Impact",
      description: performanceDrivers.titleFraming.reason,
    },
    {
      name: "Hashtag Combination",
      impact: performanceDrivers.hashtagCombination.impact === "High" ? "High Impact" : performanceDrivers.hashtagCombination.impact === "Medium" ? "Medium Impact" : "Low Impact",
      description: performanceDrivers.hashtagCombination.reason,
    },
    {
      name: "Posting Time",
      impact: performanceDrivers.postingTime.impact === "High" ? "High Impact" : performanceDrivers.postingTime.impact === "Medium" ? "Medium Impact" : "Low Impact",
      description: performanceDrivers.postingTime.reason,
    },
  ] : mockInsights.factors;

  const videos = matchedVideos || mockMatchedVideos;

  return (
    <div className="space-y-6">
      {/* Strategy Preview Snapshot */}
      <div>
        <StrategyPreview 
          strategy={strategy || mockStrategy}
          label="Strategy used for model prediction"
        />
      </div>

      {/* Performance Factors */}
      <div>
        <h3 className="text-sm font-bold text-accent mb-3 uppercase tracking-wide">
          Performance Drivers
        </h3>
        <div className="space-y-2">
          {factors.map((factor, index) => (
            <div 
              key={index} 
              className="subpanel rounded-xl p-3 hover:bg-[hsl(var(--module-bg))] transition-all cursor-pointer"
              onClick={() => setExpandedFactor(expandedFactor === index ? null : index)}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold text-foreground">{factor.name}</span>
                <Badge 
                  variant={factor.impact === "High Impact" ? "default" : "secondary"}
                  className="text-[9px] px-2 py-0.5 flex-shrink-0"
                >
                  {factor.impact}
                </Badge>
              </div>
              {expandedFactor === index && (
                <p className="text-[10px] text-muted-foreground leading-relaxed mt-2 pt-2 border-t border-border/30">
                  {factor.description}
                </p>
              )}
            </div>
          ))}
        </div>
        <p className="text-[9px] text-muted-foreground/60 mt-2 italic">
          💡 Click to view details
        </p>
      </div>

      {/* Matched Videos */}
      <div>
        <h3 className="text-sm font-bold text-info mb-3 uppercase tracking-wide">
          Similar Videos ({videos.length})
        </h3>
        <div className="space-y-2">
          {videos.map((video: any, index: number) => (
            <div key={index} className="subpanel rounded-xl p-3 hover:bg-[hsl(var(--module-bg))] transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-muted/30 rounded-lg flex items-center justify-center text-lg shrink-0">
                  {video.thumbnail || '🎬'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium text-foreground mb-1 line-clamp-2 leading-tight">
                    {video.title}
                  </p>
                  <div className="flex items-center gap-2 text-[9px] text-muted-foreground mb-1.5">
                    <span>CTR: {video.ctr}</span>
                    <span>•</span>
                    <span>{video.views24h} views</span>
                  </div>
                  <Badge variant="outline" className="text-[9px] px-2 py-0.5 bg-info/10 text-info border-info/30">
                    Similarity {video.similarity || (video.similarity * 100).toFixed(0) + '%'}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function Backtest() {
  const workflow = useWorkflow();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("views");
  const [isSaved, setIsSaved] = useState(false);

  // Get data from workflow context
  const predictions = workflow.backtestResults?.predictions || mockBacktestData;
  const matchedVideos = workflow.backtestResults?.matchedVideos || mockMatchedVideos;
  const performanceDrivers = workflow.backtestResults?.performanceDrivers;
  const strategy = workflow.strategy || mockStrategy;
  const backtestData = predictions;

  // Warn if no data
  useEffect(() => {
    if (!workflow.backtestResults) {
      console.warn('No backtest data found, using mock data');
    }
  }, [workflow.backtestResults]);

  const handleSave = async () => {
    try {
      // Save report to localStorage (with image compression)
      await saveReport({
        platform: workflow.platform,
        strategy,
        predictions,
        matchedVideos,
        performanceDrivers,
        features: workflow.analysis,
      });
      
      setIsSaved(true);
      
      // Notify sidebar
      localStorage.setItem("hasNewSavedReport", "true");
      window.dispatchEvent(new Event("reportSaved"));
      
      toast({
        title: "Report Saved!",
        description: "Check Saved Reports in the sidebar to view it.",
      });
      
      // Don't clear workflow data - keep it visible on the page
      // User can start a new workflow by going back to Upload page
    } catch (error) {
      console.error('Failed to save report:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getChartData = () => {
    switch (activeTab) {
      case "views":
        return backtestData.views;
      case "ctr":
        return backtestData.ctr;
      case "likes":
        return backtestData.likes;
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

  return (
    <DashboardLayout rightPanel={<InsightsPanel strategy={strategy} performanceDrivers={performanceDrivers} matchedVideos={matchedVideos} />}>
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2 flex items-center gap-3">
            <Sparkles className="w-8 h-8" />
            Backtest Model Output
          </h1>
          <p className="text-sm text-muted-foreground">
            AI-powered predictions based on similarity-matched reference videos
          </p>
        </div>

        {/* Metrics Summary - 3 Cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-8">
          <MetricCard
            icon={TrendingUp}
            label="Predicted 24h CTR"
            value={backtestData.metrics.ctr24h}
            iconColor="text-chart-2"
          />
          <MetricCard
            icon={Eye}
            label="Predicted 24h Views"
            value={backtestData.metrics.views24h}
            iconColor="text-chart-1"
          />
          <MetricCard
            icon={Heart}
            label="Predicted 24h Likes"
            value={backtestData.metrics.likes24h}
            iconColor="text-chart-3"
          />
        </div>

        {/* Chart Section with Tabs */}
        <div className="panel-base rounded-2xl p-8 mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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

        {/* Save Report CTA */}
        <Button
          className={`w-full h-14 text-base font-semibold transition-all duration-500 ${
            isSaved
              ? "bg-muted/80 text-foreground shadow-[0_0_15px_rgba(6,182,212,0.2)] cursor-default"
              : "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)]"
          }`}
          onClick={handleSave}
          disabled={isSaved}
        >
          <Sparkles className={`w-5 h-5 mr-2 transition-opacity duration-500 ${isSaved ? "opacity-50" : ""}`} />
          {isSaved ? "Saved" : "Save Strategy & Backtest Report"}
        </Button>
      </DashboardLayout>
    );
  }

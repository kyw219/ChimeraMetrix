import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { VideoUploadSection } from "@/components/VideoUploadSection";
import { VideoAnalysisCard } from "@/components/VideoAnalysisCard";
import { StrategyCard } from "@/components/StrategyCard";
import { StrategyPreview } from "@/components/StrategyPreview";
import { BacktestLoadingPipeline } from "@/components/BacktestLoadingPipeline";
import { Button } from "@/components/ui/button";
import { Image, FileText, Hash, Clock, Loader2, Zap, Sparkles } from "lucide-react";
import { mockAnalysis, mockStrategy } from "@/lib/mockData";

export default function Upload() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [platform, setPlatform] = useState("youtube");
  const [strategy, setStrategy] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunningBacktest, setIsRunningBacktest] = useState(false);

  const handleGenerateStrategy = async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setStrategy(mockStrategy);
    setIsGenerating(false);
    
    // Auto-scroll to Recommended Strategy section
    setTimeout(() => {
      const strategySection = document.getElementById('recommended-strategy');
      if (strategySection) {
        strategySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleStartBacktest = () => {
    setIsRunningBacktest(true);
  };

  const handleBacktestComplete = () => {
    navigate("/backtest");
  };

  const handleReset = () => {
    setFile(null);
    setStrategy(null);
    setIsGenerating(false);
    setIsRunningBacktest(false);
  };

  const handleRegenerateField = (field: string) => {
    console.log(`Regenerating ${field}...`);
    // TODO: Implement regeneration logic
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1100px] mx-auto">
        {/* Show loading pipeline when running backtest */}
        {isRunningBacktest ? (
          <div className="min-h-[600px] flex items-center justify-center">
            <BacktestLoadingPipeline onComplete={handleBacktestComplete} />
          </div>
        ) : (
          <>
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-primary mb-2 flex items-center gap-3">
                <Sparkles className="w-8 h-8" />
                ChimeraMatrix
              </h1>
              <p className="text-sm text-muted-foreground">
                Predictive Content Intelligence
              </p>
            </div>

        {/* Main Content Panel */}
        <div className="panel-base rounded-2xl p-8 mb-8">
          {/* Upload & Platform Section */}
          <div className="mb-8">
            <VideoUploadSection
              onFileUpload={setFile}
              platform={platform}
              onPlatformChange={setPlatform}
              onRemove={handleReset}
            />
          </div>

          {/* Generate Button */}
          {file && !strategy && (
            <div className="mb-8 flex justify-center">
              <Button
                onClick={handleGenerateStrategy}
                disabled={isGenerating}
                size="lg"
                className="px-10 py-6 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground glow-primary"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Extracting video features...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Generate AI Strategy
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Video Analysis Section - Only show after generation */}
          {strategy && (
            <div className="mb-8">
              <h2 className="text-base font-bold text-primary mb-4 flex items-center gap-2 uppercase tracking-wide">
                Video Feature Extraction
              </h2>
              <VideoAnalysisCard 
                data={mockAnalysis}
                isLoading={false}
              />
            </div>
          )}

          {/* Recommended Strategy Section */}
          <div id="recommended-strategy">
            <h2 className="text-base font-bold text-accent mb-4 flex items-center gap-2 uppercase tracking-wide">
              Recommended Strategy
            </h2>

            <div className="grid grid-cols-2 gap-5">
              <StrategyCard
                icon={Image}
                title="Recommended Cover"
                content={strategy?.cover}
                placeholder="AI will recommend the perfect thumbnail design based on viral patterns"
                iconColor="text-chart-1"
                isEmpty={!strategy}
                onRegenerate={() => handleRegenerateField('cover')}
              />
              <StrategyCard
                icon={FileText}
                title="Recommended Title"
                content={strategy?.title}
                placeholder="AI will generate a high-performing title optimized for clicks"
                iconColor="text-chart-2"
                isEmpty={!strategy}
                onRegenerate={() => handleRegenerateField('title')}
              />
              <StrategyCard
                icon={Hash}
                title="Recommended Hashtags"
                content={strategy?.hashtags}
                placeholder="AI will suggest trending hashtags to maximize discoverability"
                iconColor="text-chart-3"
                isEmpty={!strategy}
                onRegenerate={() => handleRegenerateField('hashtags')}
              />
              <StrategyCard
                icon={Clock}
                title="Recommended Posting Time"
                content={strategy?.postingTime}
                placeholder="AI will identify optimal posting time based on audience patterns"
                iconColor="text-chart-4"
                isEmpty={!strategy}
                onRegenerate={() => handleRegenerateField('postingTime')}
              />
            </div>
          </div>

          {/* Strategy Preview */}
          {strategy && (
            <div className="mt-8">
              <h2 className="text-base font-bold text-primary mb-4 flex items-center gap-2 uppercase tracking-wide">
                Strategy Preview
              </h2>
              <StrategyPreview 
                strategy={strategy}
                isEmpty={false}
              />
            </div>
          )}

        </div>

            {/* CTA Button */}
            {strategy && (
              <div className="flex justify-center pb-8">
                <Button
                  onClick={handleStartBacktest}
                  size="lg"
                  className="px-16 py-7 text-lg font-bold bg-accent hover:bg-accent/90 text-accent-foreground glow-accent"
                >
                  Run Performance Backtest
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

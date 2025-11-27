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
import { useToast } from "@/hooks/use-toast";

// API Base URL
const API_BASE_URL = window.location.origin;

export default function Upload() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [platform, setPlatform] = useState("youtube");
  const [strategy, setStrategy] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunningBacktest, setIsRunningBacktest] = useState(false);

  const handleGenerateStrategy = async () => {
    if (!file) return;
    
    setIsGenerating(true);
    console.log('🚀 Starting video analysis...');
    console.log('📁 File:', file.name, file.size, 'bytes');
    console.log('🎯 Platform:', platform);
    console.log('🌐 API URL:', `${API_BASE_URL}/api/analyze`);
    
    try {
      // Step 1: Analyze video
      const formData = new FormData();
      formData.append('video', file);
      formData.append('platform', platform);

      console.log('📤 Uploading video to backend...');
      const analyzeResponse = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        body: formData,
      });

      console.log('📥 Analyze response status:', analyzeResponse.status);
      const analyzeData = await analyzeResponse.json();
      console.log('📊 Analyze response data:', analyzeData);

      if (!analyzeData.success) {
        throw new Error(analyzeData.error?.message || 'Failed to analyze video');
      }

      const { sessionId: newSessionId, features } = analyzeData.data;
      setSessionId(newSessionId);
      setAnalysis(features);
      console.log('✅ Video analyzed successfully!');
      console.log('🔑 Session ID:', newSessionId);
      console.log('🎬 Features:', features);

      // Step 2: Generate strategy
      console.log('🎨 Generating strategy...');
      const strategyResponse = await fetch(`${API_BASE_URL}/api/generate-strategy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: newSessionId,
          features,
          platform,
        }),
      });

      console.log('📥 Strategy response status:', strategyResponse.status);
      const strategyData = await strategyResponse.json();
      console.log('📊 Strategy response data:', strategyData);

      if (!strategyData.success) {
        throw new Error(strategyData.error?.message || 'Failed to generate strategy');
      }

      setStrategy(strategyData.data.strategy);
      console.log('✅ Strategy generated successfully!');
      console.log('💡 Strategy:', strategyData.data.strategy);

      toast({
        title: "Success!",
        description: "AI strategy generated successfully",
      });
      
      // Auto-scroll to Recommended Strategy section
      setTimeout(() => {
        const strategySection = document.getElementById('recommended-strategy');
        if (strategySection) {
          strategySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (error) {
      console.error('❌ Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to generate strategy',
        variant: "destructive",
      });
      
      // Fallback to mock data
      console.log('⚠️ Falling back to mock data');
      setAnalysis(mockAnalysis);
      setStrategy(mockStrategy);
    } finally {
      setIsGenerating(false);
    }
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
                data={analysis || mockAnalysis}
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

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { VideoUploadSection } from "@/components/VideoUploadSection";
import { VideoAnalysisCard } from "@/components/VideoAnalysisCard";
import { StrategyCard } from "@/components/StrategyCard";
import { StrategyPreview } from "@/components/StrategyPreview";
import { BacktestLoadingPipeline } from "@/components/BacktestLoadingPipeline";
import { Button } from "@/components/ui/button";
import { Image, FileText, Hash, Clock, Loader2, Zap, Sparkles, AlignLeft } from "lucide-react";
import { mockAnalysis, mockStrategy } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import { useWorkflow } from "@/contexts/WorkflowContext";

// API Base URL
const API_BASE_URL = window.location.origin;

export default function Upload() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const workflow = useWorkflow();
  
  // Use workflow context for persistent state
  const [file, setFile] = useState<File | null>(workflow.file);
  const [platform, setPlatform] = useState(workflow.platform);
  const [strategy, setStrategy] = useState<any>(workflow.strategy);
  const [analysis, setAnalysis] = useState<any>(workflow.analysis);
  const [sessionId, setSessionId] = useState<string | null>(workflow.sessionId);
  const [frameUrl, setFrameUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Extracting video features...');
  const [isRunningBacktest, setIsRunningBacktest] = useState(false);
  const [regeneratingField, setRegeneratingField] = useState<string | null>(null);

  const handleGenerateStrategy = async () => {
    if (!file) return;
    
    console.log('='.repeat(60));
    console.log('🎬 VIDEO UPLOAD WORKFLOW STARTED');
    console.log('='.repeat(60));
    
    // Step 0: Check backend health
    console.log('\n📋 Step 0: Checking backend health...');
    try {
      const healthResponse = await fetch(`${API_BASE_URL}/api/health`);
      const healthData = await healthResponse.json();
      console.log('✅ Backend health:', healthData);
      console.log('   - Has Gemini Key:', healthData.environment.hasGeminiKey);
      console.log('   - Gemini Model:', healthData.environment.geminiModel);
      console.log('   - Allowed Origins:', healthData.environment.allowedOrigins);
      
      if (!healthData.environment.hasGeminiKey) {
        console.error('❌ CRITICAL: Gemini API key is not configured!');
        toast({
          title: "Configuration Error",
          description: "Backend is missing Gemini API key. Please check Vercel environment variables.",
          variant: "destructive",
        });
        setAnalysis(mockAnalysis);
        setStrategy(mockStrategy);
        return;
      }
    } catch (error) {
      console.error('❌ Health check failed:', error);
    }
    
    // Check file size (Vercel free tier limit is 4.5MB)
    const maxSize = 4.5 * 1024 * 1024; // 4.5MB in bytes
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    console.log(`\n📏 File size check: ${fileSizeMB}MB (max: 4.5MB)`);
    
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: `Your video is ${fileSizeMB}MB. Due to Vercel's free tier limits, please use a video smaller than 4.5MB for now. We're working on supporting larger files!`,
        variant: "destructive",
      });
      console.log(`❌ File too large: ${fileSizeMB}MB (max 4.5MB on free tier)`);
      
      // Fallback to mock data for demo
      console.log('⚠️ Using mock data for demo purposes');
      setAnalysis(mockAnalysis);
      setStrategy(mockStrategy);
      return;
    }
    
    setIsGenerating(true);
    setLoadingMessage('Extracting video features...');
    console.log('\n🚀 Step 1: Starting video analysis...');
    console.log('📁 File details:');
    console.log('   - Name:', file.name);
    console.log('   - Size:', file.size, 'bytes', `(${fileSizeMB}MB)`);
    console.log('   - Type:', file.type);
    console.log('🎯 Platform:', platform);
    console.log('🌐 API URL:', `${API_BASE_URL}/api/analyze`);
    
    try {
      // Step 1: Analyze video
      const formData = new FormData();
      formData.append('video', file);
      formData.append('platform', platform);

      console.log('\n📤 Uploading video to backend...');
      console.log('   - FormData keys:', Array.from(formData.keys()));
      
      const analyzeResponse = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        body: formData,
      });

      console.log('\n📥 Analyze response received:');
      console.log('   - Status:', analyzeResponse.status, analyzeResponse.statusText);
      console.log('   - Headers:', Object.fromEntries(analyzeResponse.headers.entries()));
      
      let analyzeData: { success: boolean; data?: { sessionId: string; features: any; frameUrl?: string }; error?: { code?: string; message?: string; details?: any } };
      try {
        analyzeData = await analyzeResponse.json();
        console.log('📊 Analyze response data:', JSON.stringify(analyzeData, null, 2));
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', parseError);
        const text = await analyzeResponse.text();
        console.error('   - Raw response:', text);
        throw new Error('Invalid JSON response from server');
      }

      if (!analyzeData.success) {
        console.error('\n❌ Backend returned error:');
        console.error('   - Code:', analyzeData.error?.code);
        console.error('   - Message:', analyzeData.error?.message);
        console.error('   - Details:', analyzeData.error?.details);
        throw new Error(analyzeData.error?.message || 'Failed to analyze video');
      }

      const { sessionId: newSessionId, features, frameUrl } = analyzeData.data;
      setSessionId(newSessionId);
      setAnalysis(features);
      setFrameUrl(frameUrl || null);
      // Save to workflow context
      workflow.setSessionId(newSessionId);
      workflow.setAnalysis(features);
      console.log('\n✅ Video analyzed successfully!');
      console.log('🔑 Session ID:', newSessionId);
      console.log('🖼️  Frame URL:', frameUrl || 'N/A');
      console.log('🎬 Features extracted:');
      console.log('   - Category:', features.category);
      console.log('   - Emotion:', features.emotion);
      console.log('   - Visual Style:', features.visualStyle);
      console.log('   - Keywords:', features.keywords);
      console.log('   - Audience:', features.audience);
      console.log('   - Hook Type:', features.hookType);

      // Step 2: Generate strategy
      console.log('\n🎨 Step 2: Generating strategy...');
      setLoadingMessage('Generating strategy...');
      
      const strategyPayload = {
        sessionId: newSessionId,
        features,
        platform,
        frameUrl, // Pass frame URL for cover generation
      };
      console.log('📤 Strategy request payload:', JSON.stringify(strategyPayload, null, 2));
      
      const strategyResponse = await fetch(`${API_BASE_URL}/api/generate-strategy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(strategyPayload),
      });

      console.log('\n📥 Strategy response received:');
      console.log('   - Status:', strategyResponse.status, strategyResponse.statusText);
      
      const strategyData = await strategyResponse.json();
      console.log('📊 Strategy response data:', JSON.stringify(strategyData, null, 2));

      if (!strategyData.success) {
        console.error('\n❌ Strategy generation failed:');
        console.error('   - Error:', strategyData.error);
        throw new Error(strategyData.error?.message || 'Failed to generate strategy');
      }

      setStrategy(strategyData.data.strategy);
      // Save to workflow context
      workflow.setStrategy(strategyData.data.strategy);
      console.log('\n✅ Strategy generated successfully!');
      console.log('💡 Strategy details:');
      console.log('   - Cover:', strategyData.data.strategy.cover?.substring(0, 50) + '...');
      console.log('   - Title:', strategyData.data.strategy.title);
      console.log('   - Hashtags:', strategyData.data.strategy.hashtags);
      console.log('   - Posting Time:', strategyData.data.strategy.postingTime);

      console.log('\n' + '='.repeat(60));
      console.log('🎉 WORKFLOW COMPLETED SUCCESSFULLY!');
      console.log('='.repeat(60));

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
      console.error('\n' + '='.repeat(60));
      console.error('❌ WORKFLOW FAILED');
      console.error('='.repeat(60));
      console.error('Error type:', error?.constructor?.name);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      console.error('Error stack:', error instanceof Error ? error.stack : 'N/A');
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to generate strategy',
        variant: "destructive",
      });
      
      // Fallback to mock data
      console.log('\n⚠️ Falling back to mock data for demo purposes');
      setAnalysis(mockAnalysis);
      setStrategy(mockStrategy);
    } finally {
      setIsGenerating(false);
      console.log('\n🏁 Workflow ended\n');
    }
  };

  const handleStartBacktest = async () => {
    if (!sessionId || !analysis || !strategy) {
      toast({
        title: "Error",
        description: "Please generate a strategy first",
        variant: "destructive",
      });
      return;
    }

    setIsRunningBacktest(true);
    console.log('\n🔬 Starting backtest...');

    try {
      const payload = {
        sessionId,
        strategy,
        features: analysis,
        platform,
      };

      console.log('📤 Backtest request payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(`${API_BASE_URL}/api/backtest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('📥 Backtest response:', data);

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to run backtest');
      }

      console.log('✅ Backtest completed successfully');

      // Save backtest results to workflow context
      workflow.setBacktestResults({
        predictions: data.data.predictions,
        matchedVideos: data.data.matchedVideos,
        performanceDrivers: data.data.performanceDrivers,
      });
      
      // Animation will complete automatically after 9 seconds (3 steps × 3s each)
    } catch (error) {
      console.error('❌ Backtest failed:', error);
      setIsRunningBacktest(false);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to run backtest',
        variant: "destructive",
      });
    }
  };

  const handleBacktestComplete = () => {
    // Called when animation finishes (after 15 seconds)
    setIsRunningBacktest(false);
    navigate("/backtest");
  };

  const handleReset = () => {
    setFile(null);
    setStrategy(null);
    setAnalysis(null);
    setSessionId(null);
    setFrameUrl(null);
    // Revoke video URL to free memory
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
    setIsGenerating(false);
    setIsRunningBacktest(false);
    // Clear workflow context
    workflow.clearAll();
  };

  const handleRegenerateField = async (field: string) => {
    if (!sessionId || !analysis || !strategy) {
      toast({
        title: "Error",
        description: "Please analyze a video first",
        variant: "destructive",
      });
      return;
    }

    console.log(`🔄 Regenerating ${field}...`);
    setRegeneratingField(field);
    
    try {
      const payload = {
        sessionId,
        features: analysis,
        platform,
        field, // Specify which field to regenerate
        currentStrategy: strategy, // Pass current strategy to preserve other fields
        frameUrl, // Pass frame URL for cover regeneration
      };

      const response = await fetch(`${API_BASE_URL}/api/regenerate-strategy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to regenerate');
      }

      const updatedStrategy = data.data.strategy;
      setStrategy(updatedStrategy);
      workflow.setStrategy(updatedStrategy); // Update workflow context
      console.log(`✅ ${field} regenerated successfully`);
      console.log('   - Updated strategy:', updatedStrategy);
      
      toast({
        title: "Success!",
        description: `${field.charAt(0).toUpperCase() + field.slice(1)} regenerated`,
      });
    } catch (error) {
      console.error(`❌ Failed to regenerate ${field}:`, error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to regenerate',
        variant: "destructive",
      });
    } finally {
      setRegeneratingField(null);
    }
  };

  return (
    <DashboardLayout>
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

        {/* Two-Column Layout - 6:6 ratio for balanced width */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* LEFT COLUMN: User Input & Analysis */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-primary mb-6">
                Video Upload
              </h2>
              
              <VideoUploadSection
                onFileUpload={(newFile) => {
                  setFile(newFile);
                  workflow.setFile(newFile, null, newFile.name);
                  // Create video URL for preview
                  const url = URL.createObjectURL(newFile);
                  setVideoUrl(url);
                }}
                onThumbnailGenerated={(thumbnail) => {
                  if (file) {
                    workflow.setFile(file, thumbnail, file.name);
                  }
                }}
                platform={platform}
                onPlatformChange={(newPlatform) => {
                  setPlatform(newPlatform);
                  workflow.setPlatform(newPlatform);
                }}
                onRemove={handleReset}
                initialThumbnail={workflow.videoPreviewUrl}
                initialFileName={workflow.videoFileName}
              />

              {/* Generate Button */}
              {file && !strategy && (
                <div className="mt-6 flex justify-center">
                  <Button
                    onClick={handleGenerateStrategy}
                    disabled={isGenerating}
                    size="lg"
                    className="w-full px-10 py-6 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground glow-primary"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        {loadingMessage}
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
            </div>

            {/* Video Analysis - Moved to left column */}
            {strategy && (
              <div>
                <h2 className="text-lg font-bold text-primary mb-6">
                  Video Feature Extraction
                </h2>
                <VideoAnalysisCard 
                  data={analysis || mockAnalysis}
                  isLoading={false}
                />
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Strategy Results */}
          <div className="space-y-6">
            {/* Recommended Strategy */}
            <div id="recommended-strategy">
              <h2 className="text-lg font-bold text-primary mb-6">
                Recommended Strategy
              </h2>

              <div className="space-y-6">
                {/* Cover - Full Width */}
                <StrategyCard
                  icon={Image}
                  title="Recommended Cover"
                  content={strategy?.cover}
                  coverImageUrl={strategy?.coverImageUrl}
                  placeholder="AI will recommend the perfect thumbnail design based on viral patterns"
                  iconColor="text-chart-1"
                  isEmpty={!strategy}
                  isRegenerating={regeneratingField === 'cover'}
                  onRegenerate={() => handleRegenerateField('cover')}
                />

                {/* Title - Full Width */}
                <StrategyCard
                  icon={FileText}
                  title="Recommended Title"
                  content={strategy?.title}
                  placeholder="AI will generate a high-performing title optimized for clicks"
                  iconColor="text-chart-2"
                  isEmpty={!strategy}
                  isRegenerating={regeneratingField === 'title'}
                  onRegenerate={() => handleRegenerateField('title')}
                />

                {/* Description - Full Width */}
                <StrategyCard
                  icon={AlignLeft}
                  title="Recommended Description"
                  content={strategy?.description}
                  placeholder="AI will create an engaging video description with SEO keywords and call-to-action"
                  iconColor="text-primary"
                  isEmpty={!strategy}
                  isRegenerating={regeneratingField === 'description'}
                  onRegenerate={() => handleRegenerateField('description')}
                />

                {/* Hashtags - Full Width */}
                <StrategyCard
                  icon={Hash}
                  title="Recommended Hashtags"
                  content={strategy?.hashtags}
                  placeholder="AI will suggest trending hashtags to maximize discoverability"
                  iconColor="text-chart-3"
                  isEmpty={!strategy}
                  isRegenerating={regeneratingField === 'hashtags'}
                  onRegenerate={() => handleRegenerateField('hashtags')}
                />

                {/* Posting Time - Full Width */}
                <StrategyCard
                  icon={Clock}
                  title="Recommended Posting Time"
                  content={strategy?.postingTime}
                  placeholder="AI will identify optimal posting time based on audience patterns"
                  iconColor="text-chart-4"
                  isEmpty={!strategy}
                  isRegenerating={regeneratingField === 'postingTime'}
                  onRegenerate={() => handleRegenerateField('postingTime')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width Strategy Preview */}
        {strategy && (
          <div className="panel-base rounded-2xl p-6 mb-8">
            <StrategyPreview 
              strategy={strategy}
              videoUrl={videoUrl || undefined}
              isEmpty={false}
            />
          </div>
        )}

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
      </DashboardLayout>
    );
  }

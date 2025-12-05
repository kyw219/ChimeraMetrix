import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles, Video, TrendingUp, Target, ArrowRight, Zap, Brain, BarChart3 } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          {/* Logo & Brand */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <img src="/logo.jpg" alt="ChimeraMatrix" className="w-16 h-16 object-cover rounded-2xl shadow-lg" />
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-chart-1 bg-clip-text text-transparent">
              ChimeraMatrix
            </h1>
          </div>

          {/* Tagline */}
          <p className="text-2xl md:text-3xl font-semibold text-foreground/90">
            AI-Powered Video Content Analysis & Performance Prediction
          </p>

          {/* Description */}
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Leverage Google Gemini's multimodal AI to analyze video content, generate optimized covers, titles, hashtags, and posting strategies. Predict video performance based on historical data to help content creators optimize metadata before publishing.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              onClick={() => navigate("/upload")}
              size="lg"
              className="px-10 py-7 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground glow-primary group"
            >
              <Zap className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Start Analyzing
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              onClick={() => navigate("/saved-reports")}
              variant="outline"
              size="lg"
              className="px-10 py-7 text-lg font-semibold"
            >
              View Saved Reports
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-primary">
          Core Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Feature 1: AI Analysis */}
          <div className="panel-base rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 rounded-xl bg-chart-1/10 flex items-center justify-center mb-6">
              <Brain className="w-7 h-7 text-chart-1" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">Intelligent Video Analysis</h3>
            <p className="text-muted-foreground leading-relaxed">
              Automatically extract video features using Google Gemini AI: category, emotion, visual style, keywords, target audience, and hook type
            </p>
          </div>

          {/* Feature 2: Strategy Generation */}
          <div className="panel-base rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 rounded-xl bg-chart-2/10 flex items-center justify-center mb-6">
              <Sparkles className="w-7 h-7 text-chart-2" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">AI Strategy Generation</h3>
            <p className="text-muted-foreground leading-relaxed">
              Automatically generate optimized cover images, titles, descriptions, hashtags, and optimal posting times based on viral patterns and platform algorithms
            </p>
          </div>

          {/* Feature 3: Performance Prediction */}
          <div className="panel-base rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 rounded-xl bg-chart-3/10 flex items-center justify-center mb-6">
              <TrendingUp className="w-7 h-7 text-chart-3" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">Performance Prediction</h3>
            <p className="text-muted-foreground leading-relaxed">
              Predict video views, likes, comments, and shares based on historical data and semantic matching to understand content performance in advance
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-primary">
          How It Works
        </h2>
        
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Step 1 */}
          <div className="flex gap-6 items-start panel-base rounded-2xl p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-primary">1</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Video className="w-5 h-5 text-chart-1" />
                <h3 className="text-lg font-bold text-foreground">Upload Video</h3>
              </div>
              <p className="text-muted-foreground">
                Upload your video file and select the target platform (YouTube, TikTok, or YouTube Shorts)
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-6 items-start panel-base rounded-2xl p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-primary">2</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-chart-2" />
                <h3 className="text-lg font-bold text-foreground">AI Analysis & Strategy Generation</h3>
              </div>
              <p className="text-muted-foreground">
                AI automatically analyzes video content, extracts key features, and generates optimized cover, title, description, hashtags, and posting time
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-6 items-start panel-base rounded-2xl p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-primary">3</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-chart-3" />
                <h3 className="text-lg font-bold text-foreground">Performance Backtest</h3>
              </div>
              <p className="text-muted-foreground">
                Predict video performance based on historical data, view expected views, engagement rates, and similar success cases
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Supported Platforms */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-primary">
          Supported Platforms
        </h2>
        
        <div className="flex flex-wrap justify-center gap-8 max-w-3xl mx-auto">
          <div className="panel-base rounded-2xl p-6 flex items-center gap-4 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Video className="w-6 h-6 text-red-500" />
            </div>
            <span className="text-lg font-semibold">YouTube</span>
          </div>
          
          <div className="panel-base rounded-2xl p-6 flex items-center gap-4 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center">
              <Video className="w-6 h-6 text-pink-500" />
            </div>
            <span className="text-lg font-semibold">TikTok</span>
          </div>
          
          <div className="panel-base rounded-2xl p-6 flex items-center gap-4 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Video className="w-6 h-6 text-orange-500" />
            </div>
            <span className="text-lg font-semibold">YouTube Shorts</span>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 mb-16">
        <div className="max-w-4xl mx-auto panel-base rounded-3xl p-12 text-center bg-gradient-to-br from-primary/5 via-accent/5 to-chart-1/5">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Ready to Optimize Your Video Content?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start using ChimeraMatrix today and let AI help you create more engaging video content
          </p>
          <Button
            onClick={() => navigate("/upload")}
            size="lg"
            className="px-12 py-7 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground glow-primary group"
          >
            <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
            Get Started Free
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
}

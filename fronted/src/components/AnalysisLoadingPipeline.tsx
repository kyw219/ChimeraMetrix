import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Target, Heart, Video, Users, Sparkles, Clock, Image, FileText, Hash, AlignLeft } from "lucide-react";

interface AnalysisLoadingPipelineProps {
  onComplete?: () => void;
}

interface AnalysisStep {
  id: number;
  title: string;
  icon: typeof Target;
  duration: number;
  phase: 'analysis' | 'generation';
}

const analysisSteps: AnalysisStep[] = [
  // Phase 1: Video Analysis
  {
    id: 1,
    title: "Analyzing Category",
    icon: Target,
    duration: 1200,
    phase: 'analysis',
  },
  {
    id: 2,
    title: "Analyzing Emotion",
    icon: Heart,
    duration: 1200,
    phase: 'analysis',
  },
  {
    id: 3,
    title: "Analyzing Visual Style",
    icon: Video,
    duration: 1200,
    phase: 'analysis',
  },
  {
    id: 4,
    title: "Analyzing Audience",
    icon: Users,
    duration: 1200,
    phase: 'analysis',
  },
  {
    id: 5,
    title: "Analyzing Key Topics",
    icon: Sparkles,
    duration: 1200,
    phase: 'analysis',
  },
  {
    id: 6,
    title: "Analyzing Hook Type",
    icon: Clock,
    duration: 1200,
    phase: 'analysis',
  },
  // Phase 2: Strategy Generation
  {
    id: 7,
    title: "Generating Cover",
    icon: Image,
    duration: 1500,
    phase: 'generation',
  },
  {
    id: 8,
    title: "Generating Title",
    icon: FileText,
    duration: 1500,
    phase: 'generation',
  },
  {
    id: 9,
    title: "Generating Description",
    icon: AlignLeft,
    duration: 1500,
    phase: 'generation',
  },
  {
    id: 10,
    title: "Generating Hashtags",
    icon: Hash,
    duration: 1500,
    phase: 'generation',
  },
  {
    id: 11,
    title: "Generating Posting Time",
    icon: Clock,
    duration: 1500,
    phase: 'generation',
  },
];

export const AnalysisLoadingPipeline = ({ onComplete }: AnalysisLoadingPipelineProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    if (currentStep >= analysisSteps.length) {
      if (onComplete) {
        const timer = setTimeout(onComplete, 300);
        return () => clearTimeout(timer);
      }
      return;
    }

    const timer = setTimeout(() => {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(prev => prev + 1);
    }, analysisSteps[currentStep].duration);

    return () => clearTimeout(timer);
  }, [currentStep, onComplete]);

  const currentPhase = currentStep < analysisSteps.length 
    ? analysisSteps[currentStep]?.phase 
    : 'generation';

  return (
    <div className="subpanel rounded-2xl p-6">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-primary mb-2 uppercase tracking-wide">
          {currentPhase === 'analysis' ? 'Extracting Video Features' : 'Generating Strategy'}
        </h3>
        <p className="text-xs text-muted-foreground">
          {currentPhase === 'analysis' 
            ? 'AI is analyzing your video content...' 
            : 'AI is creating optimized strategy...'}
        </p>
      </div>

      <div className="space-y-2">
        {analysisSteps.map((step, index) => {
          const isActive = currentStep === index;
          const isCompleted = completedSteps.includes(index);
          const isPending = currentStep < index;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                isActive ? 'bg-[hsl(var(--module-bg))] shadow-sm' : ''
              } ${isPending ? 'opacity-30' : 'opacity-100'}`}
            >
              {/* Icon */}
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                isCompleted 
                  ? 'bg-primary/20 text-primary' 
                  : isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'bg-muted/20 text-muted-foreground'
              }`}>
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : isActive ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Title */}
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium transition-colors ${
                  isActive ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.title}
                </p>
              </div>

              {/* Status */}
              {isCompleted && (
                <div className="text-[10px] text-primary font-medium">
                  ✓
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="h-1 bg-[hsl(var(--module-bg))] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out"
            style={{ 
              width: `${((completedSteps.length + (currentStep < analysisSteps.length ? 0.5 : 0)) / analysisSteps.length) * 100}%` 
            }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          {completedSteps.length} / {analysisSteps.length} steps completed
        </p>
      </div>
    </div>
  );
};

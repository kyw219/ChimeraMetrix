import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

interface BacktestLoadingPipelineProps {
  onComplete: () => void;
  onError?: (error: Error) => void;
}

interface Step {
  id: number;
  title: string;
  subtitle: string;
  duration: number;
  animationType: 'pulse' | 'chart' | 'curve';
}

const steps: Step[] = [
  {
    id: 1,
    title: "Matching Similar Videos",
    subtitle: "Finding most similar videos using semantic search…",
    duration: 5000, // 5 seconds
    animationType: 'pulse'
  },
  {
    id: 2,
    title: "Analyzing Historical Performance",
    subtitle: "Aggregating metrics: views, CTR, impressions, likes…",
    duration: 5000, // 5 seconds
    animationType: 'chart'
  },
  {
    id: 3,
    title: "Generating Predictions",
    subtitle: "Building 24-hour temporal curve and model outputs…",
    duration: 5000, // 5 seconds
    animationType: 'curve'
  }
];

export const BacktestLoadingPipeline = ({ onComplete }: BacktestLoadingPipelineProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    if (currentStep >= steps.length) {
      const timer = setTimeout(onComplete, 300);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(prev => prev + 1);
    }, steps[currentStep].duration);

    return () => clearTimeout(timer);
  }, [currentStep, onComplete]);

  return (
    <div className="panel-base rounded-2xl p-8 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-primary mb-2">Running Backtest Model</h2>
        <p className="text-sm text-muted-foreground">AI-powered prediction pipeline in progress</p>
      </div>

      <div className="space-y-6">
        {steps.map((step, index) => {
          const isActive = currentStep === index;
          const isCompleted = completedSteps.includes(index);
          const isPending = currentStep < index;

          return (
            <div
              key={step.id}
              className={`subpanel rounded-xl p-6 transition-all duration-500 ${
                isActive ? 'bg-[hsl(var(--module-bg))] shadow-[0_0_30px_hsl(var(--primary)/0.15)]' : ''
              } ${isPending ? 'opacity-40' : 'opacity-100'}`}
            >
              <div className="flex items-start gap-4">
                {/* Step Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-primary/20 text-primary' 
                    : isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-muted/20 text-muted-foreground'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isActive ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span className="text-sm font-bold">{step.id}</span>
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-bold mb-1 uppercase tracking-wide transition-colors ${
                    isActive ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                    {step.subtitle}
                  </p>

                  {/* Animation Area */}
                  {isActive && (
                    <div className="mt-3">
                      {step.animationType === 'pulse' && (
                        <div className="flex gap-2">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="h-16 flex-1 bg-[hsl(var(--module-bg))] rounded-lg animate-pulse"
                              style={{ animationDelay: `${i * 150}ms` }}
                            />
                          ))}
                        </div>
                      )}

                      {step.animationType === 'chart' && (
                        <div className="flex items-end gap-1 h-16">
                          {[30, 50, 40, 70, 60, 80, 75, 90].map((height, i) => (
                            <div
                              key={i}
                              className="flex-1 bg-gradient-to-t from-chart-2 to-chart-2/30 rounded-t transition-all duration-700"
                              style={{ 
                                height: `${height}%`,
                                animationDelay: `${i * 100}ms`
                              }}
                            />
                          ))}
                        </div>
                      )}

                      {step.animationType === 'curve' && (
                        <div className="relative h-16 bg-[hsl(var(--module-bg))] rounded-lg overflow-hidden">
                          <svg className="w-full h-full" viewBox="0 0 300 60" preserveAspectRatio="none">
                            <path
                              d="M0,50 Q75,40 150,20 T300,10"
                              fill="none"
                              stroke="hsl(var(--primary))"
                              strokeWidth="2"
                              className="animate-[dash_1.5s_ease-in-out_forwards]"
                              strokeDasharray="400"
                              strokeDashoffset="400"
                              style={{
                                filter: 'drop-shadow(0 0 8px hsl(var(--primary)/0.6))'
                              }}
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  )}

                  {isCompleted && (
                    <div className="text-xs text-primary font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Complete
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="mt-8">
        <div className="h-1 bg-[hsl(var(--module-bg))] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
            style={{ 
              width: `${((completedSteps.length + (currentStep < steps.length ? 0.5 : 0)) / steps.length) * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
};

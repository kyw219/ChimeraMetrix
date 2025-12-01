import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WorkflowState {
  // Upload page state
  file: File | null;
  videoPreviewUrl: string | null; // For displaying video thumbnail
  platform: string;
  sessionId: string | null;
  analysis: any | null;
  strategy: any | null;
  
  // Backtest page state
  backtestResults: {
    predictions: any;
    matchedVideos: any[];
    performanceDrivers: any;
  } | null;
}

interface WorkflowContextType extends WorkflowState {
  setFile: (file: File | null, previewUrl?: string | null) => void;
  setPlatform: (platform: string) => void;
  setSessionId: (id: string | null) => void;
  setAnalysis: (analysis: any) => void;
  setStrategy: (strategy: any) => void;
  setBacktestResults: (results: any) => void;
  clearAll: () => void;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

const STORAGE_KEY = 'chimeramatrix_workflow_state';

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [file, setFileState] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrlState] = useState<string | null>(null);
  const [platform, setPlatformState] = useState('youtube');
  const [sessionId, setSessionIdState] = useState<string | null>(null);
  const [analysis, setAnalysisState] = useState<any | null>(null);
  const [strategy, setStrategyState] = useState<any | null>(null);
  const [backtestResults, setBacktestResultsState] = useState<any | null>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        setPlatformState(state.platform || 'youtube');
        setSessionIdState(state.sessionId || null);
        setAnalysisState(state.analysis || null);
        setStrategyState(state.strategy || null);
        setBacktestResultsState(state.backtestResults || null);
        setVideoPreviewUrlState(state.videoPreviewUrl || null);
      }
    } catch (error) {
      console.error('Failed to load workflow state:', error);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      const state = {
        platform,
        sessionId,
        analysis,
        strategy,
        backtestResults,
        videoPreviewUrl,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save workflow state:', error);
    }
  }, [platform, sessionId, analysis, strategy, backtestResults, videoPreviewUrl]);

  const setFile = (newFile: File | null, previewUrl?: string | null) => {
    setFileState(newFile);
    if (previewUrl !== undefined) {
      setVideoPreviewUrlState(previewUrl);
    }
  };

  const setPlatform = (newPlatform: string) => {
    setPlatformState(newPlatform);
  };

  const setSessionId = (id: string | null) => {
    setSessionIdState(id);
  };

  const setAnalysis = (newAnalysis: any) => {
    setAnalysisState(newAnalysis);
  };

  const setStrategy = (newStrategy: any) => {
    setStrategyState(newStrategy);
  };

  const setBacktestResults = (results: any) => {
    setBacktestResultsState(results);
  };

  const clearAll = () => {
    setFileState(null);
    setVideoPreviewUrlState(null);
    setPlatformState('youtube');
    setSessionIdState(null);
    setAnalysisState(null);
    setStrategyState(null);
    setBacktestResultsState(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <WorkflowContext.Provider
      value={{
        file,
        videoPreviewUrl,
        platform,
        sessionId,
        analysis,
        strategy,
        backtestResults,
        setFile,
        setPlatform,
        setSessionId,
        setAnalysis,
        setStrategy,
        setBacktestResults,
        clearAll,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
}

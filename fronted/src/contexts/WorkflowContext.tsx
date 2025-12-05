import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WorkflowState {
  // Upload page state
  file: File | null;
  videoPreviewUrl: string | null; // For displaying video thumbnail
  videoFileName: string | null; // For displaying file name
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
  setFile: (file: File | null, previewUrl?: string | null, fileName?: string | null) => void;
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
  const [videoFileName, setVideoFileNameState] = useState<string | null>(null);
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
        setVideoFileNameState(state.videoFileName || null);
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
        videoFileName,
      };
      const stateStr = JSON.stringify(state);
      
      // Check localStorage quota (typically 5-10MB)
      if (stateStr.length > 5 * 1024 * 1024) {
        console.warn('⚠️ Workflow state too large for localStorage, storing without images');
        // Store without cover image to save space
        const lightState = {
          ...state,
          strategy: state.strategy ? {
            ...state.strategy,
            coverImageUrl: undefined, // Remove base64 image
          } : null,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lightState));
      } else {
        localStorage.setItem(STORAGE_KEY, stateStr);
      }
      console.log('💾 Workflow state saved to localStorage');
    } catch (error) {
      console.error('❌ Failed to save workflow state:', error);
      // Try to save minimal state without images
      try {
        const minimalState = {
          platform,
          sessionId,
          analysis,
          strategy: strategy ? {
            cover: strategy.cover,
            title: strategy.title,
            description: strategy.description,
            hashtags: strategy.hashtags,
            postingTime: strategy.postingTime,
            // Omit coverImageUrl
          } : null,
          backtestResults,
          videoPreviewUrl: null, // Remove preview
          videoFileName,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(minimalState));
        console.log('💾 Minimal workflow state saved (without images)');
      } catch (fallbackError) {
        console.error('❌ Failed to save even minimal state:', fallbackError);
      }
    }
  }, [platform, sessionId, analysis, strategy, backtestResults, videoPreviewUrl, videoFileName]);

  const setFile = (newFile: File | null, previewUrl?: string | null, fileName?: string | null) => {
    setFileState(newFile);
    if (previewUrl !== undefined) {
      setVideoPreviewUrlState(previewUrl);
    }
    if (fileName !== undefined) {
      setVideoFileNameState(fileName);
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
    console.log('📝 WorkflowContext.setBacktestResults called with:', results);
    console.log('   - predictions:', results?.predictions);
    console.log('   - matchedVideos:', results?.matchedVideos);
    console.log('   - performanceDrivers:', results?.performanceDrivers);
    setBacktestResultsState(results);
    console.log('✅ WorkflowContext.backtestResults state updated');
  };

  const clearAll = () => {
    setFileState(null);
    setVideoPreviewUrlState(null);
    setVideoFileNameState(null);
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
        videoFileName,
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

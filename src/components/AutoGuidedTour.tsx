import React, { useState, useEffect, useCallback } from 'react';
import { FaPlay, FaPause, FaStop, FaForward, FaBackward, FaTimes, FaRobot } from 'react-icons/fa';

interface TourStep {
  id: string;
  title: string;
  description: string;
  action: 'generate' | 'tab' | 'wait' | 'highlight' | 'explain';
  target?: string;
  tabId?: string;
  duration: number; // in milliseconds
  highlight?: string; // CSS selector to highlight
}

interface AutoGuidedTourProps {
  isVisible: boolean;
  onClose: () => void;
  onGenerate: () => void;
  onTabChange: (tabId: string) => void;
  currentTab: string;
  hasGeneratedData: boolean;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: '🎬 Welcome to Your Personal ICL Guide!',
    description: "I'm your ICL assistant and I'll show you how this visualization tool reveals the 'invisible' learning process inside AI models. Sit back and watch as I demonstrate each feature!",
    action: 'explain',
    duration: 500
  },
  {
    id: 'generate-demo',
    title: '🚀 Step 1: Generating AI Text',
    description: "First, let me generate some text using a pattern that's perfect for demonstrating In-Context Learning. I'm using a Q&A format where the AI learns the pattern: Question → Answer → Question → Answer",
    action: 'generate',
    duration: 1000
  },
  {
    id: 'wait-generation',
    title: '⏳ Processing...',
    description: "The AI is now generating text and analyzing its own learning process in real-time. Watch as I switch between tabs to show you all the visualizations while the AI is still thinking!",
    action: 'wait',
    duration: 500
  },
  {
    id: 'timeline-explanation',
    title: '📈 Step 2: The Learning Timeline',
    description: "This is THE most important visualization! The blue line shows 'Induction Score' - when it spikes up, the AI is having an 'aha!' moment and recognizing the Q&A pattern. High scores (20+) mean strong learning!",
    action: 'tab',
    tabId: 'induction-timeline',
    duration: 2000,
    highlight: '#visualization-panel'
  },
  {
    id: 'timeline-peaks',
    title: '🎯 Learning Moments',
    description: "See those colored dots and background highlights? Those mark key learning moments! Red dots = major breakthroughs, yellow dots = sustained learning. Click on any peak to see what the AI was thinking at that exact moment!",
    action: 'explain',
    duration: 2000
  },
  {
    id: 'attention-heatmap',
    title: '🔥 Step 3: The Attention Heatmap',
    description: "Now let's see WHO is talking to WHOM! This heatmap shows which words the AI pays attention to when generating each new word. Lighter colors = stronger attention connections.",
    action: 'tab',
    tabId: 'attention-heatmap',
    duration: 2000,
    highlight: '#visualization-panel'
  },
  {
    id: 'heatmap-patterns',
    title: '🔍 Reading the Patterns',
    description: "Look for: Diagonal lines (self-attention), Vertical lines (popular words everyone looks at), Light clusters (related words attending to each other). The structure tells us how the AI organizes information!",
    action: 'explain',
    duration: 2000
  },
  {
    id: 'attention-graph',
    title: '🕸️ Step 4: The Network View',
    description: "This network shows information flow between words. Each arrow represents attention - thicker arrows mean stronger connections. Drag nodes around to explore! Central nodes are 'important' words.",
    action: 'tab',
    tabId: 'attention-graph',
    duration: 2000,
    highlight: '#visualization-panel'
  },
  {
    id: 'network-interaction',
    title: '🖱️ Interactive Exploration',
    description: "This view is fully interactive! You can drag nodes, zoom with your mouse wheel, and hover over connections for details. The threshold slider let you filter out weak connections to see the strongest patterns.",
    action: 'explain',
    duration: 2000
  },
  {
    id: 'induction-heads',
    title: '🧠 Step 5: Inside the AI Brain',
    description: "Now let's see which parts of the AI's 'brain' are doing the pattern recognition! Each bar represents a different attention head - more active bars mean more robust learning across the model.",
    action: 'tab',
    tabId: 'induction',
    duration: 2000,
    highlight: '#visualization-panel'
  },
  {
    id: 'brain-analysis',
    title: '🔬 Neural Activity',
    description: "The colored bars show which attention heads are active. Purple = strong induction heads (pattern copiers), Blue = moderate activity, Gray = inactive. Different layers specialize in different types of patterns!",
    action: 'explain',
    duration: 2000
  },
  {
    id: 'token-importance',
    title: '⭐ Step 6: Word Importance Rankings',
    description: "This table ranks every word by importance. 'Hub' tokens provide key context, 'Scanner' tokens gather information, 'Bridge' tokens connect concepts. The progress bars show attention flow visually.",
    action: 'tab',
    tabId: 'token-importance',
    duration: 2000,
    highlight: '#visualization-panel'
  },
  {
    id: 'strategy-timeline',
    title: '📊 Step 7: Learning Strategies',
    description: "Finally, let's see how the AI balances different learning strategies over time. Induction (pattern copying), direct copying, and previous token prediction - watch how they compete and collaborate!",
    action: 'tab',
    tabId: 'strategy-timeline',
    duration: 2000,
    highlight: '#visualization-panel'
  },
  {
    id: 'conclusion',
    title: '🎉 Tour Complete!',
    description: "You've now seen how AI models learn patterns in real-time! Strong ICL shows: high timeline spikes, structured heatmaps, active induction heads, and clear token roles. Try your own prompts to explore further!",
    action: 'explain',
    duration: 2000
  },
  {
    id: 'back-to-timeline',
    title: '🏁 Ready to Explore',
    description: "I'm taking you back to the timeline view - the best starting point for analysis. Remember: look for spikes, try different prompts, and use the help system (?) for detailed guides. Happy exploring!",
    action: 'tab',
    tabId: 'induction-timeline',
    duration: 1000
  }
];

const AutoGuidedTour: React.FC<AutoGuidedTourProps> = ({
  isVisible,
  onClose,
  onGenerate,
  onTabChange,
  currentTab,
  hasGeneratedData
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [tourSpeed, setTourSpeed] = useState(1); // 1x, 1.5x, 2x speed
  const [highlightElement, setHighlightElement] = useState<string | null>(null);
  const [hasTriggeredGeneration, setHasTriggeredGeneration] = useState(false);

  const currentTourStep = TOUR_STEPS[currentStep];

  // Auto-advance logic
  useEffect(() => {
    if (!isVisible || !isPlaying || isPaused || !currentTourStep) return;

    // Small delay to avoid infinite loops and allow UI to update
    const timer = setTimeout(() => {
      executeStep(currentTourStep);
    }, 50);

    return () => clearTimeout(timer);
  }, [currentStep, isPlaying, isPaused, isVisible]);

  // Step execution logic
  const executeStep = useCallback((step: TourStep) => {
    if (!step) return;

    console.log(`Executing step: ${step.id}, action: ${step.action}, tabId: ${step.tabId}`);

    // Handle highlighting
    if (step.highlight) {
      setHighlightElement(step.highlight);
      setTimeout(() => setHighlightElement(null), step.duration);
    }

    // Execute step action immediately
    switch (step.action) {
      case 'generate':
        if (!hasTriggeredGeneration) {
          console.log('Triggering generation...');
          onGenerate();
          setHasTriggeredGeneration(true);
        }
        break;
      case 'tab':
        if (step.tabId) {
          console.log(`Switching to tab: ${step.tabId}, current: ${currentTab}`);
          onTabChange(step.tabId);
        }
        break;
      case 'wait':
        // Just wait for the specified duration
        break;
      case 'highlight':
        // Highlighting is handled above
        break;
      case 'explain':
        // Just display explanation
        break;
    }

    // Auto-advance to next step
    const advanceTimer = setTimeout(() => {
      if (currentStep < TOUR_STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        // Tour completed
        setIsPlaying(false);
        setTimeout(() => onClose(), 2000);
      }
    }, step.duration / tourSpeed);

    return () => clearTimeout(advanceTimer);
  }, [currentStep, currentTab, onGenerate, onTabChange, onClose, tourSpeed, hasTriggeredGeneration]);

  const startTour = () => {
    setIsPlaying(true);
    setIsPaused(false);
    setCurrentStep(0);
    setHasTriggeredGeneration(false);
    setHighlightElement(null);
  };

  const pauseTour = () => {
    setIsPaused(!isPaused);
  };

  const stopTour = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentStep(0);
    setHighlightElement(null);
    onClose();
  };

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const skipToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Professional spotlight effect */}
      {highlightElement ? (
        <>
          {/* Darkened overlay with cutout for highlighted element */}
          <div className="fixed inset-0 z-40 pointer-events-none">
            <div className="absolute inset-0 bg-black/40" />
          </div>
          
          {/* Highlight styling */}
          <style jsx global>{`
            ${highlightElement} {
              position: relative !important;
              z-index: 45 !important;
              box-shadow: 
                0 0 0 3px rgba(59, 130, 246, 0.9),
                0 0 0 6px rgba(59, 130, 246, 0.3),
                0 0 30px rgba(59, 130, 246, 0.5) !important;
              border-radius: 8px !important;
              background-color: rgba(255, 255, 255, 0.02) !important;
            }
            
            ${highlightElement}::before {
              content: '';
              position: absolute;
              inset: -10px;
              background: radial-gradient(
                ellipse at center,
                transparent 40%,
                rgba(0, 0, 0, 0.4) 100%
              );
              z-index: -1;
              border-radius: 12px;
              pointer-events: none;
            }
          `}</style>
        </>
      ) : (
        /* Subtle backdrop when no element is highlighted */
        <div className="fixed inset-0 bg-black/15 z-40 pointer-events-none" />
      )}

      {/* Tour Control Panel */}
      <div className="fixed top-4 right-4 z-50 bg-gradient-to-br from-purple-900 to-blue-900 border border-purple-500/50 rounded-lg p-4 shadow-2xl max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FaRobot className="text-purple-400 text-lg" />
            <h3 className="text-white font-semibold">ICL Guide</h3>
          </div>
          <button
            onClick={stopTour}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* Current Step Display */}
        <div className="bg-black/30 rounded-lg p-3 mb-4">
          <h4 className="text-purple-300 font-medium text-sm mb-1">
            {currentTourStep?.title}
          </h4>
          <p className="text-blue-100 text-xs leading-relaxed">
            {currentTourStep?.description}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-purple-300 mb-1">
            <span>Progress</span>
            <span>{currentStep + 1} / {TOUR_STEPS.length}</span>
          </div>
          <div className="w-full bg-purple-900/50 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-3">
          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={previousStep}
              disabled={currentStep === 0}
              className="bg-purple-700/50 hover:bg-purple-600/50 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-md transition-colors"
            >
              <FaBackward size={12} />
            </button>
            
            {!isPlaying ? (
              <button
                onClick={startTour}
                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
              >
                <FaPlay size={12} />
                Start Tour
              </button>
            ) : (
              <button
                onClick={pauseTour}
                className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
              >
                {isPaused ? <FaPlay size={12} /> : <FaPause size={12} />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
            )}

            <button
              onClick={nextStep}
              disabled={currentStep === TOUR_STEPS.length - 1}
              className="bg-purple-700/50 hover:bg-purple-600/50 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-md transition-colors"
            >
              <FaForward size={12} />
            </button>
          </div>

          {/* Speed Control */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-purple-300">Speed:</span>
            <div className="flex gap-1">
              {[1, 1.5, 2].map(speed => (
                <button
                  key={speed}
                  onClick={() => setTourSpeed(speed)}
                  className={`text-xs px-2 py-1 rounded ${
                    tourSpeed === speed 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-purple-800/50 text-purple-300 hover:bg-purple-700/50'
                  } transition-colors`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Step Navigation */}
          <div className="border-t border-purple-700/50 pt-3">
            <span className="text-xs text-purple-300 mb-2 block">Jump to step:</span>
            <div className="grid grid-cols-5 gap-1">
              {TOUR_STEPS.slice(0, 15).map((_, index) => (
                <button
                  key={index}
                  onClick={() => skipToStep(index)}
                  className={`text-xs w-6 h-6 rounded ${
                    currentStep === index
                      ? 'bg-purple-600 text-white'
                      : currentStep > index
                      ? 'bg-green-700/50 text-green-300'
                      : 'bg-purple-800/50 text-purple-400 hover:bg-purple-700/50'
                  } transition-colors`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mt-3 pt-3 border-t border-purple-700/50">
          <div className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${
              isPlaying && !isPaused ? 'bg-green-500 animate-pulse' : 
              isPaused ? 'bg-yellow-500' : 'bg-gray-500'
            }`} />
            <span className="text-purple-300">
              {isPlaying && !isPaused ? 'Tour Running' : 
               isPaused ? 'Paused' : 'Ready'}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile-friendly bottom panel for smaller screens */}
      <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden bg-gradient-to-r from-purple-900 to-blue-900 border border-purple-500/50 rounded-lg p-3 shadow-2xl">
        <div className="text-center">
          <h4 className="text-purple-300 font-medium text-sm mb-1 flex items-center justify-center gap-2">
            <FaRobot size={12} />
            ICL Guide - {currentTourStep?.title}
          </h4>
          <p className="text-blue-100 text-xs mb-3 line-clamp-2">
            {currentTourStep?.description}
          </p>
          <div className="flex justify-center gap-2">
            {!isPlaying ? (
              <button
                onClick={startTour}
                className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-xs"
              >
                Start
              </button>
            ) : (
              <button
                onClick={pauseTour}
                className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded text-xs"
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
            )}
            <button
              onClick={stopTour}
              className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-xs"
            >
              Stop
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AutoGuidedTour;

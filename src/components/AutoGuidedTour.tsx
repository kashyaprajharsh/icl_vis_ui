import React, { useState, useEffect, useCallback } from 'react';
import { FaPlay, FaPause, FaStop, FaForward, FaBackward, FaTimes, FaRobot, FaChevronLeft, FaChevronRight, FaExpand, FaCompress, FaEye, FaEyeSlash } from 'react-icons/fa';

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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false); // New: control overlay visibility

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
    setIsMinimized(false);
    setIsCollapsed(false);
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

  // Inject styles for animations
  useEffect(() => {
    if (!isVisible) return;
    
    const styleId = 'auto-guided-tour-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = `
      @keyframes pulse-highlight {
        0%, 100% {
          box-shadow: 
            0 0 0 2px rgba(147, 51, 234, 0.8),
            0 0 20px rgba(147, 51, 234, 0.4),
            inset 0 0 10px rgba(147, 51, 234, 0.1);
        }
        50% {
          box-shadow: 
            0 0 0 3px rgba(147, 51, 234, 1),
            0 0 35px rgba(147, 51, 234, 0.6),
            inset 0 0 15px rgba(147, 51, 234, 0.2);
        }
      }
      
      @keyframes shimmer {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }
      
      .animate-shimmer {
        animation: shimmer 2s infinite;
      }
      
      .highlight-element {
        position: relative !important;
        z-index: 45 !important;
        animation: pulse-highlight 2s ease-in-out infinite;
        box-shadow: 
          0 0 0 2px rgba(147, 51, 234, 0.8),
          0 0 20px rgba(147, 51, 234, 0.4),
          inset 0 0 10px rgba(147, 51, 234, 0.1) !important;
        border-radius: 12px !important;
        transition: all 0.3s ease-in-out;
      }
    `;
    
    return () => {
      // Cleanup styles when component unmounts
      if (styleElement && document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, [isVisible]);

  // Apply/remove highlight class
  useEffect(() => {
    if (highlightElement && showOverlay) {
      const element = document.querySelector(highlightElement);
      if (element) {
        element.classList.add('highlight-element');
        return () => {
          element.classList.remove('highlight-element');
        };
      }
    }
  }, [highlightElement, showOverlay]);

  if (!isVisible) return null;

  return (
    <>
      {/* Optional subtle spotlight effect with toggle */}
      {highlightElement && showOverlay && (
        <>
          {/* Transparent overlay that doesn't block interaction */}
          <div className="fixed inset-0 z-40 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-blue-900/10 backdrop-blur-sm" />
          </div>
        </>
      )}

      {/* Minimized State - Floating Button */}
      {isMinimized && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setIsMinimized(false)}
            className="group bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full p-4 shadow-2xl hover:shadow-purple-500/50 transform hover:scale-110 transition-all duration-300"
          >
            <div className="flex items-center gap-2">
              <FaRobot className="text-xl" />
              <span className="max-w-0 group-hover:max-w-xs overflow-hidden transition-all duration-300 whitespace-nowrap">
                ICL Guide
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Main Tour Panel - Sleek Sidebar Design */}
      <div className={`fixed top-0 right-0 h-full z-50 transition-all duration-500 ease-in-out ${
        isMinimized ? 'translate-x-full' : isCollapsed ? 'w-16' : 'w-96'
      }`}>
        {/* Glass morphism panel */}
        <div className="h-full bg-gradient-to-b from-gray-900/95 to-gray-950/95 backdrop-blur-xl border-l border-purple-500/20 shadow-2xl shadow-purple-500/10 flex flex-col">
          
          {/* Header */}
          <div className={`p-4 border-b border-purple-500/20 bg-gradient-to-r from-purple-900/30 to-blue-900/30 ${isCollapsed ? 'px-3' : ''}`}>
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                <div className="relative">
                  <FaRobot className="text-purple-400 text-2xl" />
                  {isPlaying && !isPaused && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  )}
                </div>
                {!isCollapsed && (
                  <div>
                    <h3 className="text-white font-bold text-lg">ICL Guide</h3>
                    <p className="text-purple-300 text-xs">Interactive Tour Assistant</p>
                  </div>
                )}
              </div>
              
              {!isCollapsed && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowOverlay(!showOverlay)}
                    className="text-purple-400 hover:text-white transition-colors p-1.5 hover:bg-purple-500/20 rounded"
                    title={showOverlay ? "Hide overlay" : "Show overlay"}
                  >
                    {showOverlay ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="text-purple-400 hover:text-white transition-colors p-1.5 hover:bg-purple-500/20 rounded"
                    title="Minimize"
                  >
                    <FaCompress size={14} />
                  </button>
                  <button
                    onClick={() => setIsCollapsed(true)}
                    className="text-purple-400 hover:text-white transition-colors p-1.5 hover:bg-purple-500/20 rounded"
                    title="Collapse"
                  >
                    <FaChevronRight size={14} />
                  </button>
                  <button
                    onClick={stopTour}
                    className="text-purple-400 hover:text-red-400 transition-colors p-1.5 hover:bg-red-500/20 rounded"
                    title="Close"
                  >
                    <FaTimes size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Collapsed State - Vertical Controls */}
          {isCollapsed ? (
            <div className="flex-1 flex flex-col items-center py-4 gap-4">
              <button
                onClick={() => setIsCollapsed(false)}
                className="text-purple-400 hover:text-white transition-colors p-2 hover:bg-purple-500/20 rounded"
              >
                <FaChevronLeft size={16} />
              </button>
              
              <div className="w-8 h-32 bg-purple-900/30 rounded-full relative overflow-hidden">
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-500 to-blue-500 transition-all duration-300"
                  style={{ height: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
                />
              </div>

              {isPlaying ? (
                <button
                  onClick={pauseTour}
                  className="text-yellow-400 hover:text-yellow-300 transition-colors p-2 hover:bg-yellow-500/20 rounded"
                >
                  {isPaused ? <FaPlay size={16} /> : <FaPause size={16} />}
                </button>
              ) : (
                <button
                  onClick={startTour}
                  className="text-green-400 hover:text-green-300 transition-colors p-2 hover:bg-green-500/20 rounded"
                >
                  <FaPlay size={16} />
                </button>
              )}

              <button
                onClick={stopTour}
                className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-500/20 rounded"
              >
                <FaStop size={16} />
              </button>
            </div>
          ) : (
            <>
              {/* Current Step Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Step Card */}
                <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl p-4 border border-purple-500/30">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {currentStep + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-base mb-2">
                        {currentTourStep?.title}
                      </h4>
                      <p className="text-blue-200 text-sm leading-relaxed">
                        {currentTourStep?.description}
                      </p>
                    </div>
                  </div>

                  {/* Action indicator */}
                  {currentTourStep?.action && (
                    <div className="mt-3 pt-3 border-t border-purple-500/20">
                      <span className="text-xs text-purple-300 flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                        Action: {currentTourStep.action === 'tab' ? `Switch to ${currentTourStep.tabId}` : currentTourStep.action}
                      </span>
                    </div>
                  )}
                </div>

                {/* Progress Overview */}
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-purple-300 text-sm font-medium">Tour Progress</span>
                    <span className="text-purple-400 text-xs bg-purple-900/50 px-2 py-1 rounded">
                      {Math.round(((currentStep + 1) / TOUR_STEPS.length) * 100)}%
                    </span>
                  </div>
                  
                  {/* Enhanced Progress Bar */}
                  <div className="relative">
                    <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 rounded-full transition-all duration-500 relative overflow-hidden"
                        style={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                      </div>
                    </div>
                    
                    {/* Step markers */}
                    <div className="absolute inset-0 flex items-center">
                      {TOUR_STEPS.map((_, index) => (
                        <div
                          key={index}
                          className="flex-1 flex justify-end"
                          style={{ maxWidth: `${100 / TOUR_STEPS.length}%` }}
                        >
                          <div className={`w-1 h-3 ${
                            index <= currentStep ? 'bg-purple-400/50' : 'bg-gray-600/30'
                          }`} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mini timeline */}
                  <div className="mt-3 flex gap-1">
                    {TOUR_STEPS.map((step, index) => (
                      <button
                        key={step.id}
                        onClick={() => skipToStep(index)}
                        className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                          index === currentStep 
                            ? 'bg-purple-500 ring-2 ring-purple-400 ring-offset-2 ring-offset-gray-900' 
                            : index < currentStep
                            ? 'bg-green-600/70 hover:bg-green-500'
                            : 'bg-gray-600/50 hover:bg-gray-500'
                        }`}
                        title={step.title}
                      />
                    ))}
                  </div>
                </div>

                {/* Control Panel */}
                <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
                  {/* Main Controls */}
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={previousStep}
                      disabled={currentStep === 0}
                      className="bg-purple-700/30 hover:bg-purple-600/40 disabled:opacity-30 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-all hover:scale-105"
                    >
                      <FaBackward size={14} />
                    </button>
                    
                    {!isPlaying ? (
                      <button
                        onClick={startTour}
                        className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white px-6 py-2 rounded-lg transition-all hover:scale-105 shadow-lg shadow-green-500/30"
                      >
                        <div className="flex items-center gap-2">
                          <FaPlay size={12} />
                          <span className="font-medium">Start Tour</span>
                        </div>
                      </button>
                    ) : (
                      <button
                        onClick={pauseTour}
                        className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white px-6 py-2 rounded-lg transition-all hover:scale-105 shadow-lg shadow-yellow-500/30"
                      >
                        <div className="flex items-center gap-2">
                          {isPaused ? <FaPlay size={12} /> : <FaPause size={12} />}
                          <span className="font-medium">{isPaused ? 'Resume' : 'Pause'}</span>
                        </div>
                      </button>
                    )}

                    <button
                      onClick={nextStep}
                      disabled={currentStep === TOUR_STEPS.length - 1}
                      className="bg-purple-700/30 hover:bg-purple-600/40 disabled:opacity-30 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-all hover:scale-105"
                    >
                      <FaForward size={14} />
                    </button>
                  </div>

                  {/* Speed Control */}
                  <div className="flex items-center justify-between px-2">
                    <span className="text-xs text-purple-300">Playback Speed</span>
                    <div className="flex gap-1 bg-gray-900/50 p-1 rounded-lg">
                      {[0.5, 1, 1.5, 2].map(speed => (
                        <button
                          key={speed}
                          onClick={() => setTourSpeed(speed)}
                          className={`text-xs px-3 py-1.5 rounded-md transition-all ${
                            tourSpeed === speed 
                              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                              : 'bg-transparent text-purple-300 hover:bg-purple-800/30'
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Navigation */}
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <h5 className="text-purple-300 text-xs font-medium mb-3">Quick Navigation</h5>
                  <div className="grid grid-cols-5 gap-2">
                    {TOUR_STEPS.map((step, index) => (
                      <button
                        key={step.id}
                        onClick={() => skipToStep(index)}
                        className={`relative group p-2 rounded-lg text-xs font-medium transition-all ${
                          currentStep === index
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg scale-110'
                            : currentStep > index
                            ? 'bg-green-700/30 text-green-300 hover:bg-green-600/40'
                            : 'bg-gray-700/30 text-gray-400 hover:bg-gray-600/40'
                        }`}
                        title={step.title}
                      >
                        {index + 1}
                        {currentStep === index && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Status */}
              <div className="p-4 border-t border-purple-500/20 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      isPlaying && !isPaused ? 'bg-green-500 animate-pulse' : 
                      isPaused ? 'bg-yellow-500' : 'bg-gray-500'
                    }`} />
                    <span className="text-xs text-purple-300">
                      {isPlaying && !isPaused ? 'Tour Running' : 
                       isPaused ? 'Tour Paused' : 'Ready to Start'}
                    </span>
                  </div>
                  <button
                    onClick={stopTour}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                  >
                    <FaStop size={10} />
                    End Tour
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AutoGuidedTour;

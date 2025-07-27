import React, { useState, useEffect } from 'react';
import { FaTimes, FaLightbulb } from 'react-icons/fa';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTourProps {
  isVisible: boolean;
  onClose: () => void;
  currentStep: number;
  onNext: () => void;
  onPrevious: () => void;
  onFinish: () => void;
}

const TOUR_STEPS: OnboardingStep[] = [
  {
    id: 'output',
    title: '📄 Real-Time Output',
    description: "Watch here as the model generates text. The colors show what's happening under the hood: copying, unique generation, or pattern completion.",
    target: 'output-panel',
    position: 'left'
  },
  {
    id: 'icl-highlight',
    title: '✨ In-Context Learning in Action',
    description: "The highlighted text shows the model using in-context learning to copy and complete patterns it found in the prompt.",
    target: 'icl-text-container',
    position: 'left'
  },
  {
    id: 'timeline',
    title: '📊 Induction Timeline',
    description: "This timeline tracks how well the model understands the patterns. See the 'Induction Score' peak when it successfully completes a pattern.",
    target: 'visualization-panel',
    position: 'left'
  },
  {
    id: 'top-predictions',
    title: '🔮 Top Predictions',
    description: "Here are the model's top choices for the next token. See how confident it was in its prediction.",
    target: 'top-predictions-container',
    position: 'left'
  },
  {
    id: 'icl-metrics',
    title: '📈 ICL Metrics',
    description: "Finally, these are detailed metrics on the model's performance, like how much it's copying versus creating new text. The tour is now complete!",
    target: 'controls-panel',
    position: 'right'
  }
];


const OnboardingTooltip: React.FC<{
  step: OnboardingStep;
  currentStep: number;
  totalSteps: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onFinish: () => void;
}> = ({ step, currentStep, totalSteps, onClose, onNext, onPrevious, onFinish }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updatePosition = () => {
      const target = document.getElementById(step.target);
      if (target) {
        const rect = target.getBoundingClientRect();

        let top = 0;
        let left = 0;

        switch (step.position) {
          case 'top':
            top = rect.top - 10;
            left = rect.left + rect.width / 2;
            break;
          case 'bottom':
            top = rect.bottom + 10;
            left = rect.left + rect.width / 2;
            break;
          case 'left':
            top = rect.top + rect.height / 2;
            left = rect.left - 10;
            break;
          case 'right':
            top = rect.top + rect.height / 2;
            left = rect.right + 10;
            break;
        }

        setPosition({ top, left });
        setIsVisible(true);
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [step]);

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" />
      
      {/* Tooltip */}
      <div
        className={`fixed z-50 max-w-xs bg-gradient-to-br from-blue-900 to-purple-900 border border-blue-500/50 rounded-lg p-4 shadow-2xl transform transition-all duration-300 ${
          step.position === 'top' ? '-translate-y-full -translate-x-1/2' :
          step.position === 'bottom' ? 'translate-y-0 -translate-x-1/2' :
          step.position === 'left' ? '-translate-x-full -translate-y-1/2' :
          'translate-x-0 -translate-y-1/2'
        }`}
        style={{
          top: position.top,
          left: position.left,
        }}
      >
        {/* Arrow */}
        <div className={`absolute w-0 h-0 ${
          step.position === 'top' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-l-8 border-r-8 border-t-8 border-transparent border-t-blue-500' :
          step.position === 'bottom' ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-full border-l-8 border-r-8 border-b-8 border-transparent border-b-blue-500' :
          step.position === 'left' ? 'right-0 top-1/2 -translate-y-1/2 translate-x-full border-t-8 border-b-8 border-l-8 border-transparent border-l-blue-500' :
          'left-0 top-1/2 -translate-y-1/2 -translate-x-full border-t-8 border-b-8 border-r-8 border-transparent border-r-blue-500'
        }`} />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
        >
          <FaTimes size={12} />
        </button>

        {/* Content */}
        <div className="pr-4">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <FaLightbulb className="text-yellow-400" />
            {step.title}
          </h3>
          <p className="text-blue-100 text-sm mb-4 leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-blue-300">
            Step {currentStep + 1} of {totalSteps}
          </div>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={onPrevious}
                className="bg-blue-800/50 hover:bg-blue-700/50 text-white text-xs font-bold py-1 px-3 rounded-md transition-colors"
              >
                Previous
              </button>
            )}
            {currentStep < totalSteps - 1 ? (
              <button
                onClick={onNext}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-1 px-3 rounded-md transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={onFinish}
                className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-1 px-3 rounded-md transition-colors"
              >
                Finish
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isVisible,
  onClose,
  currentStep,
  onNext,
  onPrevious,
  onFinish,
}) => {
  if (!isVisible || currentStep >= TOUR_STEPS.length) {
    return null;
  }

  const step = TOUR_STEPS[currentStep];

  return (
    <OnboardingTooltip
      step={step}
      currentStep={currentStep}
      totalSteps={TOUR_STEPS.length}
      onClose={onClose}
      onNext={onNext}
      onPrevious={onPrevious}
      onFinish={onFinish}
    />
  );
};

export default OnboardingTour;

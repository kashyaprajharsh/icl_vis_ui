import React, { useState } from 'react';
import { FaBrain, FaQuestionCircle, FaBook, FaRobot } from 'react-icons/fa';
import HelpSystem from './HelpSystem';

interface HeaderProps {
  status: string;
  onRestartTour?: () => void;
  onStartGuidedTour?: () => void;
  currentTab?: string;
}

const Header: React.FC<HeaderProps> = ({ status, onRestartTour, onStartGuidedTour, currentTab }) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const isConnected = status === 'Connected';
  
  return (
    <>
      <header className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
        <div className="flex items-center">
          <div className="p-2 bg-sky-500/10 rounded-full mr-4">
            <FaBrain className="text-3xl text-sky-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-100">ICL Visualizer</h1>
            <p className="text-sm text-slate-400">Real-time In-Context Learning Analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsHelpOpen(true)}
            className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-400 rounded-md hover:bg-purple-500/20 transition-colors text-sm"
            title="Open documentation and help"
          >
            <FaBook size={14} />
            Docs
          </button>
          {onStartGuidedTour && currentTab === 'induction-timeline' && (
            <button
              onClick={onStartGuidedTour}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:from-purple-500 hover:to-blue-500 transition-all duration-200 text-sm font-medium shadow-lg animate-pulse-subtle"
              title="Start automated guided tour - Available on Induction Timeline tab"
            >
              <FaRobot size={14} />
              ICL Guide Demo
            </button>
          )}
          {onRestartTour && (
            <button
              onClick={onRestartTour}
              className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-md hover:bg-blue-500/20 transition-colors text-sm"
              title="Start interactive tour"
            >
              <FaQuestionCircle size={14} />
              Quick Tour
            </button>
          )}
          <span className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${isConnected ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            <span className={`h-2 w-2 rounded-full mr-2 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
            {status}
          </span>
        </div>
      </header>

      <HelpSystem isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} currentTab={currentTab} />
    </>
  );
};

export default Header;

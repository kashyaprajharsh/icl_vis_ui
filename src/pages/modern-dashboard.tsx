import React, { useState, useEffect } from 'react';

// This is an example Next.js page showing how to use the new modern dashboard
const ModernDashboardPage: React.FC = () => {
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [fullHistory, setFullHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Example function to generate text and get analysis data
  const handleGenerateText = async (prompt: string, options: any) => {
    setIsLoading(true);
    try {
      // Replace this with your actual API call
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          ...options
        })
      });
      
      const data = await response.json();
      setAnalysisData(data.analysis);
      setFullHistory(prev => [...prev, data]);
    } catch (error) {
      console.error('Error generating text:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepSelect = (step: number) => {
    // Find the data for this step and update analysisData
    const stepData = fullHistory.find(h => h.step === step);
    if (stepData) {
      setAnalysisData(stepData.analysis);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Optional: Add generation controls at the top */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">GPT-2 Explorer - Modern Dashboard</h1>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Enter your prompt here..."
              className="bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 w-96"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleGenerateText((e.target as HTMLInputElement).value, {});
                }
              }}
            />
            <button
              onClick={() => handleGenerateText('Example prompt', {})}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>
      </div>

      {/* Modern Dashboard */}
      
        analysisData={analysisData}
        fullHistory={fullHistory}
        onStepSelect={handleStepSelect}
    </div>
  );
};

export default ModernDashboardPage;

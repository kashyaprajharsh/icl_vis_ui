"use client";

import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import GenerationControls from "@/components/GenerationControls";
// import VisualizationPanel from "@/components/VisualizationPanel"; // Will be dynamically imported
import GenerationOutput from "@/components/GenerationOutput";
import Header from "@/components/Header";
import OnboardingTour from "@/components/OnboardingTour";
import AutoGuidedTour from "@/components/AutoGuidedTour";

const VisualizationPanel = dynamic(() => import('@/components/VisualizationPanel'), {
  ssr: false,
  loading: () => <div className="col-span-6 bg-gray-800 p-4 rounded-lg shadow-lg h-full flex items-center justify-center"><p>Loading Visualizations...</p></div>
});

export default function Home() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [status, setStatus] = useState("Disconnected");
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('induction-timeline');
  
  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  
  // Guided tour state
  const [showGuidedTour, setShowGuidedTour] = useState(false);

  useEffect(() => {
    // Onboarding will now be triggered by the first generation, not on page load.
    // The old logic is removed.
  }, []);

  useEffect(() => {
    const connectWebSocket = () => {
      // Connect to the deployed Azure Container Apps backend
      //const ws = new WebSocket("wss://gpt2-viz-backend.icyfield-a7f63f03.eastus.azurecontainerapps.io/ws/generate");
      const ws = new WebSocket("ws://localhost:8000/ws/generate");

      ws.onopen = () => setStatus("Connected");
      ws.onclose = () => {
        setStatus("Disconnected");
        setTimeout(connectWebSocket, 5000); // Reconnect every 5s
      };
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "error") {
          alert(`Server error: ${data.message}`);
        } else {
          // Check if this is the first successful generation to trigger onboarding
          const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
          if (!hasSeenOnboarding && analysisHistory.length === 0) {
            setShowOnboarding(true);
            setOnboardingStep(0);
          }
          setAnalysisHistory(prev => [...prev, data]);
          setSelectedStep(data.step);
        }
      };
      ws.onerror = (error) => {
        console.error("WebSocket Error:", error);
        ws.close();
      };

      setSocket(ws);
    };

    connectWebSocket();

    return () => {
      socket?.close();
    };
  }, []);

  const handleGenerate = (request: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      setAnalysisHistory([]); // Clear previous history
      setSelectedStep(null);
      setActiveTab('induction-timeline'); // Auto-select induction timeline tab
      socket.send(JSON.stringify(request));
    } else {
      alert("WebSocket is not connected.");
    }
  };

  const handleStepSelect = (step: number) => {
    setSelectedStep(step);
  };

  const displayedData = analysisHistory.find(d => d.step === selectedStep) || null;

  const handleOnboardingNext = () => {
    setOnboardingStep(prev => prev + 1);
  };

  const handleOnboardingPrevious = () => {
    setOnboardingStep(prev => prev - 1);
  };

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    localStorage.setItem('hasSeenOnboarding', 'true');
  };

  const handleOnboardingFinish = () => {
    setShowOnboarding(false);
    localStorage.setItem('hasSeenOnboarding', 'true');
  };

  const handleRestartTour = () => {
    setOnboardingStep(0);
    setShowOnboarding(true);
  };

  const handleStartGuidedTour = () => {
    setShowGuidedTour(true);
  };

  const handleCloseGuidedTour = () => {
    setShowGuidedTour(false);
  };

  // Function to trigger generation from the guided tour
  const handleGuidedTourGenerate = () => {
    // Use a sample pattern that's good for demonstration
    const demoRequest = {
      model_name: 'gpt2-medium',
      prompt: 'Question: What is the capital of France? Answer: Paris. Question: What is the capital of Italy? Answer: Rome. Question: What is the capital of Germany? Answer:',
      max_length: 50, // Increased for longer generation to cover all tabs
      temperature: 0.3
    };
    
    if (socket && socket.readyState === WebSocket.OPEN) {
      setAnalysisHistory([]); // Clear previous history
      setSelectedStep(null);
      setActiveTab('induction-timeline'); // Auto-select induction timeline tab
      socket.send(JSON.stringify(demoRequest));
    }
  };

  return (
    <main className="bg-gray-900 text-white min-h-screen font-sans">
      <div className="container-fluid mx-auto p-4">
        <Header 
          status={status} 
          onRestartTour={handleRestartTour} 
          onStartGuidedTour={handleStartGuidedTour}
          currentTab={activeTab}
        />
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-3" id="controls-panel">
            <GenerationControls
              onGenerate={handleGenerate}
              analysisData={displayedData}
              patternStrength={displayedData?.pattern_strength || null}
            />
          </div>
          <div className="col-span-6" id="visualization-panel">
            <VisualizationPanel 
              analysisData={displayedData} 
              fullHistory={analysisHistory}
              onStepSelect={handleStepSelect}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>
          <div className="col-span-3" id="output-panel">
            <GenerationOutput analysisData={displayedData} />
          </div>
        </div>
      </div>

      <OnboardingTour
        isVisible={showOnboarding}
        currentStep={onboardingStep}
        onNext={handleOnboardingNext}
        onPrevious={handleOnboardingPrevious}
        onClose={handleOnboardingClose}
        onFinish={handleOnboardingFinish}
      />

      <AutoGuidedTour
        isVisible={showGuidedTour}
        onClose={handleCloseGuidedTour}
        onGenerate={handleGuidedTourGenerate}
        onTabChange={setActiveTab}
        currentTab={activeTab}
        hasGeneratedData={analysisHistory.length > 0}
      />
    </main>
  );
}

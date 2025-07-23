"use client";

import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import GenerationControls from "@/components/GenerationControls";
// import VisualizationPanel from "@/components/VisualizationPanel"; // Will be dynamically imported
import GenerationOutput from "@/components/GenerationOutput";
import Header from "@/components/Header";

const VisualizationPanel = dynamic(() => import('@/components/VisualizationPanel'), {
  ssr: false,
  loading: () => <div className="col-span-6 bg-gray-800 p-4 rounded-lg shadow-lg h-full flex items-center justify-center"><p>Loading Visualizations...</p></div>
});

export default function Home() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [status, setStatus] = useState("Disconnected");
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  useEffect(() => {
    const connectWebSocket = () => {
      // Connect to the deployed Azure Container Apps backend
      const ws = new WebSocket("wss://gpt2-viz-backend.thankfulsky-a88ee13c.eastus.azurecontainerapps.io/ws/generate");

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
      socket.send(JSON.stringify(request));
    } else {
      alert("WebSocket is not connected.");
    }
  };

  const handleStepSelect = (step: number) => {
    setSelectedStep(step);
  };

  const displayedData = analysisHistory.find(d => d.step === selectedStep) || null;

  return (
    <main className="bg-gray-900 text-white min-h-screen font-sans">
      <div className="container-fluid mx-auto p-4">
        <Header status={status} />
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-3">
            <GenerationControls
              onGenerate={handleGenerate}
              analysisData={displayedData}
              patternStrength={displayedData?.pattern_strength || null}
            />
          </div>
          <div className="col-span-6">
            <VisualizationPanel 
              analysisData={displayedData} 
              fullHistory={analysisHistory}
              onStepSelect={handleStepSelect}
            />
          </div>
          <div className="col-span-3">
            <GenerationOutput analysisData={displayedData} />
          </div>
        </div>
      </div>
    </main>
  );
}

import React, { useState, useEffect } from 'react';
import { FaPlay, FaChevronDown } from 'react-icons/fa';

// --- Sub-component for Pattern Strength ---
interface PatternStrength {
  induction: number;
  copying: number;
  previous_token: number;
}

const StrengthBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="mb-2">
    <div className="flex justify-between mb-1 text-sm text-slate-300">
      <span>{label}</span>
      <span>{(value * 100).toFixed(1)}%</span>
    </div>
    <div className="w-full bg-slate-700 rounded-full h-2.5">
      <div 
        className="bg-blue-600 h-2.5 rounded-full" 
        style={{ width: `${value * 100}%`, backgroundColor: color, transition: 'width 0.3s ease-in-out' }}
      ></div>
    </div>
  </div>
);

const PatternStrengthVisualizer: React.FC<{ data: PatternStrength | null }> = ({ data }) => {
  if (!data) {
    return null;
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-slate-200 mb-3">Attention Pattern Strength</h3>
      <StrengthBar label="Induction" value={data.induction} color="#3b82f6" />
      <StrengthBar label="Copying" value={data.copying} color="#10b981" />
      <StrengthBar label="Previous Token" value={data.previous_token} color="#f59e0b" />
    </div>
  );
};
// --- End Sub-component ---


interface GenerationControlsProps {
  onGenerate: (request: any) => void;
  analysisData: any;
  patternStrength: PatternStrength | null;
}

const GenerationControls: React.FC<GenerationControlsProps> = ({ onGenerate, analysisData, patternStrength }) => {
  const [prompt, setPrompt] = useState('');
  const [maxLength, setMaxLength] = useState(20);
  const [temperature, setTemperature] = useState(0.3);
  const [modelName, setModelName] = useState('gpt2-medium');
  const [samplePatterns, setSamplePatterns] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('https://gpt2-viz-backend.thankfulsky-a88ee13c.eastus.azurecontainerapps.io/sample-patterns')
      .then(res => res.json())
      .then(data => {
        setSamplePatterns(data.patterns);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch sample patterns:", err);
        setIsLoading(false);
      });
  }, []);

  const handleGenerateClick = () => {
    onGenerate({
      model_name: modelName,
      prompt,
      max_length: maxLength,
      temperature,
    });
  };

  const handleUsePattern = () => {
    const select = document.getElementById('sample-patterns-select') as HTMLSelectElement;
    if (select && samplePatterns[select.value]) {
      setPrompt(samplePatterns[select.value].prompt);
    }
  };

  const iclMetrics = analysisData?.icl_metrics || {};
  const attentionStats = analysisData?.attention_stats || {};
  const finalAnalysis = analysisData?.final_analysis || {};

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 h-full flex flex-col space-y-4">
      <h2 className="text-xl font-semibold text-slate-200">Controls</h2>
      
      <div>
        <label htmlFor="model-select" className="block text-sm font-medium text-slate-400 mb-1">Model</label>
        <div className="relative">
          <select 
            id="model-select" 
            value={modelName} 
            onChange={e => setModelName(e.target.value)} 
            className="w-full appearance-none bg-slate-800 border border-slate-600 text-slate-300 rounded-md p-2 pr-8"
          >
            <option value="gpt2-medium">GPT-2 Medium</option>
          </select>
          <FaChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="relative">
        <select id="sample-patterns-select" disabled={isLoading} className="w-full appearance-none bg-slate-800 border border-slate-600 text-slate-300 rounded-md p-2 pr-8">
          {Object.entries(samplePatterns).map(([key, value]: [string, any]) => (
            <option key={key} value={key}>{value.name}</option>
          ))}
        </select>
        <FaChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
        <button onClick={handleUsePattern} disabled={isLoading} className="absolute right-10 top-1/2 -translate-y-1/2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-1 px-3 rounded-md text-sm">Use</button>
      </div>

      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-slate-400 mb-1">Prompt</label>
        <textarea id="prompt" value={prompt} onChange={e => setPrompt(e.target.value)} rows={6} className="w-full bg-slate-800 border border-slate-600 text-slate-300 rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"></textarea>
      </div>

      <div>
        <label htmlFor="max-length" className="block text-sm font-medium text-slate-400 mb-1">Max Length: {maxLength}</label>
        <input type="range" id="max-length" min="1" max="100" value={maxLength} onChange={e => setMaxLength(parseInt(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
      </div>

      <div>
        <label htmlFor="temperature" className="block text-sm font-medium text-slate-400 mb-1">Temperature: {temperature.toFixed(2)}</label>
        <input type="range" id="temperature" min="0" max="1" step="0.01" value={temperature} onChange={e => setTemperature(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
      </div>

      <button onClick={handleGenerateClick} className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-md w-full flex items-center justify-center transition">
        <FaPlay className="mr-2" /> Generate
      </button>

      {/* --- NEW PLACEMENT FOR PATTERN STRENGTH --- */}
      <PatternStrengthVisualizer data={patternStrength} />

      <div className="flex-grow space-y-4 overflow-y-auto">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-4">
          <h3 className="text-lg font-semibold text-slate-200">ICL Metrics</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <MetricDisplay label="Induction Score" value={analysisData?.icl_metrics.induction_score.toFixed(3)} />
            <MetricDisplay label="Induction Heads" value={analysisData?.icl_metrics.induction_heads} />
            <MetricDisplay label="Copying Score" value={analysisData?.icl_metrics.copying_score.toFixed(3)} />
            <MetricDisplay label="Copying Heads" value={analysisData?.icl_metrics.copying_heads} />
            <MetricDisplay label="Sequence Length" value={analysisData?.icl_metrics.sequence_length} />
            <MetricDisplay label="Generation Step" value={analysisData?.icl_metrics.generation_step} />
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 space-y-2">
          <MetricCard title="Attention Statistics" data={attentionStats} fields={['entropy', 'max_attention', 'sparsity', 'diagonal_attention']} />
          <MetricCard title="Final Analysis" data={finalAnalysis} fields={['max_induction_score', 'avg_induction_score', 'pattern_diversity', 'sequence_complexity']} />
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, data, fields }: any) => (
  <div>
    <h3 className="text-lg font-semibold text-slate-300 mb-2">{title}</h3>
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 space-y-2">
      {fields.map((field: string) => (
        <div key={field} className="flex justify-between text-sm text-slate-400">
          <span className="capitalize">{field.replace(/_/g, ' ')}:</span>
          <span className="font-mono text-slate-200">{typeof data[field] === 'number' ? data[field].toFixed(3) : (data[field] || 0)}</span>
        </div>
      ))}
    </div>
  </div>
);

const MetricDisplay = ({ label, value }: { label: string, value: any }) => (
  <div className="flex justify-between text-sm text-slate-400">
    <span className="capitalize">{label}:</span>
    <span className="font-mono text-slate-200">{value}</span>
  </div>
);

export default GenerationControls;

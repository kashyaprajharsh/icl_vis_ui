import React from 'react';
import TokenAttentionVisualizer from './TokenAttentionVisualizer';
import ICLHighlightedText from './ICLHighlightedText';

interface GenerationOutputProps {
  analysisData: any;
}

const GenerationOutput: React.FC<GenerationOutputProps> = ({ analysisData }) => {
  const currentText = analysisData?.current_text || '';
  const tokens = analysisData?.tokens || [];
  const topPredictions = analysisData?.top_predictions || [];
  
  // Extract ICL-related data
  const inductionDetails = analysisData?.icl_metrics?.induction_details || [];
  const copyingDetails = analysisData?.icl_metrics?.copying_details || [];
  const tokenImportance = analysisData?.token_importance || [];
  const patternEvolution = analysisData?.pattern_evolution || [];
  const currentStep = analysisData?.step || 0;
  
  // Extract the last layer's average attention for the visualizer
  const attentionMatrix = analysisData?.attention_heatmap 
    ? Object.values(analysisData.attention_heatmap).pop() as number[][]
    : [];

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 h-full flex flex-col space-y-4">
      <h2 className="text-xl font-semibold text-slate-200">Output</h2>
      
      <div>
        <h3 className="text-lg font-semibold text-slate-300 mb-2">In-Context Learning Text</h3>
        <ICLHighlightedText
          text={currentText}
          tokens={tokens}
          inductionDetails={inductionDetails}
          copyingDetails={copyingDetails}
          tokenImportance={tokenImportance}
          patternEvolution={patternEvolution}
          currentStep={currentStep}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-300 mb-2">Tokens</h3>
        <TokenAttentionVisualizer tokens={tokens} attentionMatrix={attentionMatrix} />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-300 mb-2">Top Predictions</h3>
        <div className="bg-slate-800 border border-slate-700 rounded-md p-3 space-y-1">
          {topPredictions.map((pred: any, index: number) => (
            <div key={index} className="flex justify-between text-sm text-slate-400">
              <span className="font-mono text-sky-400">{pred.token}</span>
              <span className="font-mono text-slate-300">{(pred.probability * 100).toFixed(2)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GenerationOutput;

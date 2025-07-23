import React, { useState } from 'react';

interface MatchingPattern {
  similarity_pos: number;
  copy_pos: number;
  similar_token: number;
  copy_token: number;
  attention_weight: number;
}

interface InductionHead {
  layer: number;
  head: number;
  score: number;
  matching_patterns?: MatchingPattern[];
  formula_info?: {
    current_token_x_L: number;
    sequence_length_L: number;
    pattern_description: string;
  };
}

interface InductionHeadVisualizerProps {
  inductionDetails: InductionHead[];
  tokens?: Array<{id: number; text: string}>;
}

const InductionHeadVisualizer: React.FC<InductionHeadVisualizerProps> = ({ inductionDetails, tokens = [] }) => {
  const [expandedHead, setExpandedHead] = useState<number | null>(null);

  if (!inductionDetails || inductionDetails.length === 0) {
    return (
      <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
        <div className="text-center">
          <div className="text-4xl mb-2">🧠</div>
          <p className="text-slate-300 font-medium">No Pattern Learning Detected</p>
          <p className="text-slate-400 text-sm mt-1">
            The model isn't copying patterns from earlier in the text yet.
          </p>
        </div>
      </div>
    );
  }

  // Sort by score in descending order
  const sortedDetails = [...inductionDetails].sort((a, b) => b.score - a.score);

  const getTokenText = (tokenId: number) => {
    const token = tokens.find(t => t.id === tokenId);
    return token ? token.text : `Token ${tokenId}`;
  };

  const getPatternExplanation = (detail: InductionHead) => {
    if (!detail.matching_patterns || detail.matching_patterns.length === 0) {
      return "Learning to copy patterns from earlier text";
    }

    const pattern = detail.matching_patterns[0];
    const similarToken = getTokenText(pattern.similar_token);
    const copyToken = getTokenText(pattern.copy_token);
    
    return `When seeing "${similarToken}", copies "${copyToken}" from earlier`;
  };

  const getStrengthDescription = (score: number) => {
    if (score > 0.5) return { label: "Very Strong", color: "text-emerald-400", bg: "bg-emerald-900/30" };
    if (score > 0.3) return { label: "Strong", color: "text-blue-400", bg: "bg-blue-900/30" };
    if (score > 0.1) return { label: "Moderate", color: "text-yellow-400", bg: "bg-yellow-900/30" };
    return { label: "Weak", color: "text-slate-400", bg: "bg-slate-800" };
  };

  return (
    <div className="p-4 bg-slate-900 rounded-lg border border-slate-700 text-slate-300">
      {/* Header with explanation */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🔄</span>
          <h3 className="text-lg font-semibold text-slate-200">Pattern Learning Activity</h3>
        </div>
        <p className="text-sm text-slate-400">
          These "attention heads" learn to copy patterns from earlier in the text - a key component of in-context learning.
        </p>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {sortedDetails.map((detail, index) => {
          const strength = getStrengthDescription(detail.score);
          const isExpanded = expandedHead === index;
          
          return (
            <div key={index} className={`p-3 rounded-lg border border-slate-600 ${strength.bg} transition-all duration-200`}>
              {/* Main head info */}
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedHead(isExpanded ? null : index)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${strength.color} bg-slate-800`}>
                      {strength.label}
                    </span>
                    <span className="font-mono text-xs text-slate-500">
                      Layer {detail.layer}, Head {detail.head}
                    </span>
                  </div>
                  
                  <div className="flex-1 max-w-md">
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          strength.label === 'Very Strong' ? 'bg-emerald-400' :
                          strength.label === 'Strong' ? 'bg-blue-400' :
                          strength.label === 'Moderate' ? 'bg-yellow-400' : 'bg-slate-400'
                        }`}
                        style={{ width: `${Math.min(detail.score * 100 / 0.6, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-slate-400">
                    {detail.score.toFixed(3)}
                  </span>
                  <span className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>
              </div>

              {/* Pattern explanation */}
              <div className="mt-2">
                <p className="text-sm text-slate-300">
                  {getPatternExplanation(detail)}
                </p>
              </div>

              {/* Expanded details */}
              {isExpanded && detail.matching_patterns && detail.matching_patterns.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-600">
                  <h4 className="text-sm font-medium text-slate-200 mb-2 flex items-center gap-1">
                    🎯 Pattern Matches Found
                  </h4>
                  <div className="grid gap-2 max-h-32 overflow-y-auto">
                    {detail.matching_patterns.slice(0, 5).map((pattern, pidx) => (
                      <div key={pidx} className="flex items-center gap-2 text-xs bg-slate-800 p-2 rounded">
                        <span className="text-slate-400">Position {pattern.similarity_pos}:</span>
                        <span className="px-2 py-1 bg-blue-900/50 text-blue-200 rounded font-mono">
                          "{getTokenText(pattern.similar_token)}"
                        </span>
                        <span className="text-slate-400">→</span>
                        <span className="px-2 py-1 bg-green-900/50 text-green-200 rounded font-mono">
                          "{getTokenText(pattern.copy_token)}"
                        </span>
                        <span className="text-slate-500 ml-auto">
                          {(pattern.attention_weight * 100).toFixed(1)}% attention
                        </span>
                      </div>
                    ))}
                    {detail.matching_patterns.length > 5 && (
                      <div className="text-xs text-slate-400 italic">
                        ... and {detail.matching_patterns.length - 5} more patterns
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom explanation */}
      <div className="mt-4 p-3 bg-slate-800 rounded border border-slate-700">
        <p className="text-xs text-slate-400">
          💡 <strong>What this means:</strong> The model is learning to recognize when it has seen similar patterns before 
          and copy the appropriate response. This is how it can answer new questions based on previous examples!
        </p>
      </div>
    </div>
  );
};

export default InductionHeadVisualizer;

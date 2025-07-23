import React, { useState } from 'react';

interface ICLHighlightedTextProps {
  text: string;
  tokens: Array<{ id: number; text: string }>;
  inductionDetails: Array<{ layer: number; head: number; score: number }>;
  copyingDetails: Array<{ layer: number; head: number; score: number; position: number; copying_from: number[] }>;
  tokenImportance: Array<{
    token: string;
    position: number;
    incoming_attention: number;
    outgoing_attention: number;
    attention_entropy: number;
  }>;
  patternEvolution: Array<{
    step: number;
    induction_score: number;
    num_induction_heads: number;
    induction_strength: number;
    copying_strength: number;
    previous_token_strength: number;
  }>;
  currentStep: number;
}

const ICLHighlightedText: React.FC<ICLHighlightedTextProps> = ({
  text,
  tokens,
  inductionDetails,
  copyingDetails,
  tokenImportance,
  patternEvolution,
  currentStep
}) => {
  const [showLegend, setShowLegend] = useState(true);
  const [hoveredToken, setHoveredToken] = useState<number | null>(null);

  // Get current pattern strengths
  const currentPattern = patternEvolution[currentStep] || patternEvolution[patternEvolution.length - 1];
  
  // Calculate token classifications
  const getTokenClassification = (tokenIndex: number, token: string) => {
    const importance = tokenImportance[tokenIndex];
    const isLastToken = tokenIndex === tokens.length - 1;
    
    // Check if this token is involved in induction
    const isInductionTarget = isLastToken && inductionDetails.length > 0;
    
    // Check if this token is being copied from
    const isCopyingSource = copyingDetails.some(detail => 
      detail.copying_from && detail.copying_from.includes(tokenIndex)
    );
    
    // Check if this token has high incoming attention (being attended to)
    const hasHighIncomingAttention = importance && importance.incoming_attention > 0.3;
    
    // Check if this token has high outgoing attention (attending to others)
    const hasHighOutgoingAttention = importance && importance.outgoing_attention > 0.3;
    
    // Check pattern strengths
    const strongInduction = currentPattern && currentPattern.induction_strength > 0.3;
    const strongCopying = currentPattern && currentPattern.copying_strength > 0.3;
    
    if (isInductionTarget && strongInduction) {
      return 'induction-target';
    } else if (isCopyingSource && strongCopying) {
      return 'copying-source';
    } else if (hasHighIncomingAttention) {
      return 'high-attention';
    } else if (hasHighOutgoingAttention) {
      return 'attention-source';
    }
    
    return 'normal';
  };

  const getTokenStyle = (classification: string) => {
    switch (classification) {
      case 'induction-target':
        return 'bg-purple-500/30 text-purple-200 border-b-2 border-purple-400';
      case 'copying-source':
        return 'bg-blue-500/30 text-blue-200 border-b-2 border-blue-400';
      case 'high-attention':
        return 'bg-green-500/30 text-green-200 border-b border-green-400';
      case 'attention-source':
        return 'bg-yellow-500/30 text-yellow-200 border-b border-yellow-400';
      default:
        return 'text-slate-300';
    }
  };

  // Get induction spike information for timeline connection
  const getInductionSpike = (tokenIndex: number) => {
    if (!patternEvolution || patternEvolution.length === 0) return null;
    
    // Find if this token corresponds to a significant induction spike
    const tokenStep = Math.min(tokenIndex, patternEvolution.length - 1);
    const currentScore = patternEvolution[tokenStep]?.induction_score || 0;
    const previousScore = tokenIndex > 0 ? (patternEvolution[tokenStep - 1]?.induction_score || 0) : 0;
    
    const isSpike = currentScore > previousScore * 1.5 && currentScore > 10; // Significant increase
    const spikeIntensity = isSpike ? Math.min((currentScore / 50) * 100, 100) : 0; // Normalize to percentage
    
    return {
      isSpike,
      intensity: spikeIntensity,
      score: currentScore,
      step: tokenStep
    };
  };

  const getTooltipContent = (tokenIndex: number, classification: string) => {
    const importance = tokenImportance[tokenIndex];
    const token = tokens[tokenIndex];
    const spikeInfo = getInductionSpike(tokenIndex);
    
    let content = `Token: "${token.text}" (Position: ${tokenIndex})\n\n`;
    
    // Add ICL timeline connection
    if (spikeInfo && spikeInfo.isSpike) {
      content += `🚀 ICL SPIKE DETECTED!\nInduction Score: ${spikeInfo.score.toFixed(1)} (Step ${spikeInfo.step})\n⚡ This token triggered strong pattern recognition!\n\n`;
    }
    
    if (importance) {
      // Combined technical and user-friendly explanations
      const incomingPercent = (importance.incoming_attention * 100).toFixed(1);
      const outgoingPercent = (importance.outgoing_attention * 100).toFixed(1);
      const entropy = importance.attention_entropy.toFixed(2);
      
      content += `Incoming Attention: ${incomingPercent}%\n📥 How much other tokens look at this one\n\n`;
      content += `Outgoing Attention: ${outgoingPercent}%\n📤 How much this token looks at others\n\n`;
      content += `Attention Entropy: ${entropy}\n🎯 Focus level (lower = more focused)\n\n`;
      
      // Add interpretations
      if (importance.incoming_attention > 0.5) {
        content += `✨ This token is very important to the model\n`;
      } else if (importance.incoming_attention > 0.2) {
        content += `💡 This token has moderate importance\n`;
      }
      
      if (importance.outgoing_attention > 0.8) {
        content += `🔍 This token is actively looking for context\n`;
      }
      
      if (importance.attention_entropy < 2.0) {
        content += `🎯 This token has very focused attention\n`;
      } else if (importance.attention_entropy > 4.0) {
        content += `🌐 This token has scattered attention\n`;
      }
    }
    
    switch (classification) {
      case 'induction-target':
        content += '\n🔮 INDUCTION TARGET\nThe model is using pattern recognition to predict this token based on similar examples it saw earlier in the text.';
        if (spikeInfo && spikeInfo.isSpike) {
          content += '\n💫 This corresponds to a peak in the Induction Timeline graph!';
        }
        break;
      case 'copying-source':
        content += '\n📋 COPYING SOURCE\nThe model is referencing/copying this token when making its next prediction.';
        break;
      case 'high-attention':
        content += '\n👁️ HIGH ATTENTION\nThis token is receiving a lot of attention from other tokens, making it important for understanding the context.';
        break;
      case 'attention-source':
        content += '\n🎯 ATTENTION SOURCE\nThis token is actively paying attention to many other tokens to gather context information.';
        break;
    }
    
    return content;
  };

  const getTooltipPosition = (tokenIndex: number) => {
    // Simple positioning: show tooltips to the right for better visibility
    // and avoid cutoff issues
    return 'right';
  };

  const renderHighlightedText = () => {
    if (!tokens || tokens.length === 0) {
      return <span className="text-slate-300">{text}</span>;
    }

    return tokens.map((token, index) => {
      const classification = getTokenClassification(index, token.text);
      const style = getTokenStyle(classification);
      const isHovered = hoveredToken === index;
      const tooltipPosition = getTooltipPosition(index);
      
      // Determine tooltip position classes - use right positioning to avoid cutoff
      const tooltipPositionClasses = 'left-full top-0 ml-2';
      
      return (
        <span
          key={index}
          className={`${style} ${isHovered ? 'ring-2 ring-white/50' : ''} 
                     cursor-help transition-all duration-200 relative`}
          onMouseEnter={() => setHoveredToken(index)}
          onMouseLeave={() => setHoveredToken(null)}
          title={getTooltipContent(index, classification)}
        >
          {token.text}
          {isHovered && (
            <div className={`absolute ${tooltipPositionClasses} p-3 bg-slate-800 border border-slate-600 
                           rounded-md text-xs whitespace-pre-line z-50 max-w-sm shadow-xl`}>
              {getTooltipContent(index, classification)}
            </div>
          )}
        </span>
      );
    });
  };

  return (
    <div className="space-y-4">
      {/* Pattern Strength Indicators */}
      {currentPattern && (
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-slate-300">
              Induction: {(currentPattern.induction_strength * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-slate-300">
              Copying: {(currentPattern.copying_strength * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-slate-300">
              High Attention: Active
            </span>
          </div>
        </div>
      )}

      {/* Main text display with highlighting */}
      <div className="bg-slate-800 border border-slate-700 rounded-md p-4 min-h-[120px]">
        <div className="font-mono text-sm leading-relaxed">
          {renderHighlightedText()}
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="bg-slate-800 border border-slate-700 rounded-md p-3">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-semibold text-slate-200">
              In-Context Learning Visualization
            </h4>
            <button
              onClick={() => setShowLegend(false)}
              className="text-slate-400 hover:text-slate-200 text-xs"
            >
              Hide
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-purple-500/30 text-purple-200 border-b-2 border-purple-400 rounded">
                Token
              </span>
              <span className="text-slate-300">Induction Target - Model predicting using pattern matching</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-blue-500/30 text-blue-200 border-b-2 border-blue-400 rounded">
                Token
              </span>
              <span className="text-slate-300">Copying Source - Token being referenced/copied</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-green-500/30 text-green-200 border-b border-green-400 rounded">
                Token
              </span>
              <span className="text-slate-300">High Attention - Important for context</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-yellow-500/30 text-yellow-200 border-b border-yellow-400 rounded">
                Token
              </span>
              <span className="text-slate-300">Attention Source - Attending to other tokens</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-600 text-xs text-slate-400">
            💡 Hover over colored tokens to see detailed attention information
          </div>
        </div>
      )}

      {!showLegend && (
        <button
          onClick={() => setShowLegend(true)}
          className="text-xs text-slate-400 hover:text-slate-200 underline"
        >
          Show ICL Legend
        </button>
      )}
    </div>
  );
};

export default ICLHighlightedText;

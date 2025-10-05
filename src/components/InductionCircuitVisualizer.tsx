import React from 'react';

interface InductionCircuit {
  circuit_strength: string;
  explanation: string;
  combined_score: number;
  previous_token_heads: Array<{
    layer: number;
    head: number;
    score: number;
    avg_prev_attention: number;
    is_strong: boolean;
  }>;
  has_prev_head: boolean;
  has_induction_head: boolean;
  stats?: {
    prev_token_count: number;
    prev_token_avg_score: number;
    induction_count: number;
    induction_score: number;
  };
}

interface InductionCircuitVisualizerProps {
  circuit: InductionCircuit | null;
  inductionHeads: number;
  inductionScore: number;
}

const InductionCircuitVisualizer: React.FC<InductionCircuitVisualizerProps> = ({ 
  circuit, 
  inductionHeads, 
  inductionScore 
}) => {
  if (!circuit) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-slate-300 mb-2">🔬 Induction Circuit Analysis</h3>
        <p className="text-sm text-slate-400">Analyzing circuit components...</p>
      </div>
    );
  }

  // Calculate actual layer ranges from discovered heads
  const prevTokenLayerRange = circuit.previous_token_heads.length > 0
    ? (() => {
        const layers = circuit.previous_token_heads.map(h => h.layer);
        return `${Math.min(...layers)}-${Math.max(...layers)}`;
      })()
    : 'none';
  
  // Extract explanation for induction layer range (backend provides this)
  const inductionLayerRange = circuit.explanation.match(/layers (\d+-\d+)/)?.[1] || 'unknown';

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'STRONG': return 'text-green-400 border-green-500 bg-green-500/10';
      case 'PARTIAL': return 'text-yellow-400 border-yellow-500 bg-yellow-500/10';
      case 'WEAK': return 'text-orange-400 border-orange-500 bg-orange-500/10';
      case 'NONE': return 'text-red-400 border-red-500 bg-red-500/10';
      default: return 'text-slate-400 border-slate-500 bg-slate-500/10';
    }
  };

  const getStrengthIcon = (strength: string) => {
    switch (strength) {
      case 'STRONG': return '✅';
      case 'PARTIAL': return '⚠️';
      case 'WEAK': return '⚡';
      case 'NONE': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="space-y-4">
      {/* Circuit Strength Badge */}
      <div className={`border-2 rounded-lg p-4 ${getStrengthColor(circuit.circuit_strength)}`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span className="text-2xl">{getStrengthIcon(circuit.circuit_strength)}</span>
            Two-Head Induction Circuit: {circuit.circuit_strength}
          </h3>
          <div className="text-right">
            <div className="text-2xl font-bold">{circuit.combined_score.toFixed(1)}</div>
            <div className="text-xs opacity-80">Combined Score</div>
          </div>
        </div>
        <p className="text-sm opacity-90">{circuit.explanation}</p>
      </div>

      {/* Research Explanation */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-300 mb-2 flex items-center gap-2">
          <span>📚</span> What is a Two-Head Circuit?
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed">
          From <strong>Anthropic's 2022 research</strong>: Induction heads are actually a <strong>circuit of TWO attention heads</strong> working together:
        </p>
        <div className="mt-3 space-y-2">
          <div className="flex items-start gap-2 text-xs text-slate-300">
            <span className="text-cyan-400 font-bold">1.</span>
            <div>
              <strong className="text-cyan-400">Previous Token Head</strong> (early layers): 
              Copies info from position i-1 to i, creating "shifted" representations
            </div>
          </div>
          <div className="flex items-start gap-2 text-xs text-slate-300">
            <span className="text-purple-400 font-bold">2.</span>
            <div>
              <strong className="text-purple-400">Induction Head</strong> (later layers): 
              Finds pattern matches [A][B]...[A] and copies what came after B
            </div>
          </div>
          <div className="mt-2 text-xs text-blue-300">
            💡 <strong>Note:</strong> Layer ranges shown are <em>discovered from actual data</em>, not assumed!
          </div>
        </div>
      </div>

      {/* Circuit Components Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Previous Token Heads */}
        <div className={`border-2 rounded-lg p-4 ${
          circuit.has_prev_head 
            ? 'border-cyan-500 bg-cyan-500/5' 
            : 'border-slate-600 bg-slate-800/50'
        }`}>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <span className="text-xl">{circuit.has_prev_head ? '✅' : '❌'}</span>
            <span className={circuit.has_prev_head ? 'text-cyan-300' : 'text-slate-400'}>
              Previous Token Heads
            </span>
          </h4>
          
          {circuit.has_prev_head ? (
            <>
              <div className="text-2xl font-bold text-cyan-400 mb-2">
                {circuit.previous_token_heads.length}
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Found in layers <strong className="text-cyan-300">{prevTokenLayerRange}</strong> (discovered from data)
              </p>
              
              {/* Top Previous Token Heads */}
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {circuit.previous_token_heads.slice(0, 8).map((head, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between text-xs bg-slate-700/50 rounded px-2 py-1"
                  >
                    <span className="text-slate-300">
                      L{head.layer}H{head.head}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-600 rounded-full h-1.5">
                        <div 
                          className="bg-cyan-400 h-1.5 rounded-full"
                          style={{ width: `${head.avg_prev_attention * 100}%` }}
                        />
                      </div>
                      <span className="text-cyan-400 font-mono w-12 text-right">
                        {(head.avg_prev_attention * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {circuit.previous_token_heads.length > 8 && (
                <p className="text-xs text-slate-500 mt-2 text-center">
                  + {circuit.previous_token_heads.length - 8} more heads
                </p>
              )}
            </>
          ) : (
            <p className="text-xs text-slate-500">
              No clear previous-token heads detected in any layer
            </p>
          )}
        </div>

        {/* Induction Heads */}
        <div className={`border-2 rounded-lg p-4 ${
          circuit.has_induction_head 
            ? 'border-purple-500 bg-purple-500/5' 
            : 'border-slate-600 bg-slate-800/50'
        }`}>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <span className="text-xl">{circuit.has_induction_head ? '✅' : '❌'}</span>
            <span className={circuit.has_induction_head ? 'text-purple-300' : 'text-slate-400'}>
              Induction Heads
            </span>
          </h4>
          
          {circuit.has_induction_head ? (
            <>
              <div className="text-2xl font-bold text-purple-400 mb-2">
                {inductionHeads}
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Found in layers <strong className="text-purple-300">{inductionLayerRange}</strong> (discovered from data)
              </p>
              
              <div className="bg-slate-700/50 rounded p-3">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-400">Induction Score</span>
                  <span className="text-purple-400 font-bold">{inductionScore.toFixed(2)}</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                    style={{ width: `${Math.min(inductionScore * 2, 100)}%` }}
                  />
                </div>
              </div>
              
              <p className="text-xs text-slate-500 mt-3">
                See "Induction Heads" tab for detailed breakdown
              </p>
            </>
          ) : (
            <p className="text-xs text-slate-500">
              No induction heads detected in any layer
            </p>
          )}
        </div>
      </div>

      {/* Circuit Flow Diagram */}
      {circuit.circuit_strength === 'STRONG' && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-slate-300 mb-3">🔄 Circuit Information Flow</h4>
          <div className="flex items-center justify-center gap-4 text-xs">
            <div className="text-center">
              <div className="bg-cyan-500/20 border-2 border-cyan-500 rounded-lg p-3 mb-2">
                <div className="text-cyan-400 font-bold">Layers {prevTokenLayerRange}</div>
                <div className="text-slate-300 text-xs mt-1">Previous Token</div>
              </div>
              <div className="text-slate-400 text-xs">Shift i-1 → i</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-2xl">→</div>
              <div className="text-xs text-slate-500">passes to</div>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-500/20 border-2 border-purple-500 rounded-lg p-3 mb-2">
                <div className="text-purple-400 font-bold">Layers {inductionLayerRange}</div>
                <div className="text-slate-300 text-xs mt-1">Induction</div>
              </div>
              <div className="text-slate-400 text-xs">Find & Copy</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-2xl">→</div>
              <div className="text-xs text-slate-500">produces</div>
            </div>
            
            <div className="text-center">
              <div className="bg-green-500/20 border-2 border-green-500 rounded-lg p-3 mb-2">
                <div className="text-green-400 font-bold">ICL</div>
                <div className="text-slate-300 text-xs mt-1">Pattern Learning</div>
              </div>
              <div className="text-slate-400 text-xs">Output</div>
            </div>
          </div>
        </div>
      )}

      {/* Research Citation */}
      <div className="bg-slate-800/50 border border-slate-700 rounded p-3 text-xs text-slate-400">
        <strong className="text-slate-300">📖 Research Reference:</strong> Olsson et al. (2022). 
        "In-context Learning and Induction Heads." <em>Transformer Circuits Thread</em>, Anthropic.
      </div>
    </div>
  );
};

export default InductionCircuitVisualizer;


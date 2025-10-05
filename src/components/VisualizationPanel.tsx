import React, { useState, useEffect, useRef } from 'react';
import Plot from 'react-plotly.js';
import { Network } from 'vis-network';
import InductionHeadVisualizer from './InductionHeadVisualizer';
import InductionCircuitVisualizer from './InductionCircuitVisualizer';
import 'vis-network/styles/vis-network.css'; // Required for default hover tooltips

interface VisualizationPanelProps {
  analysisData: any;
  fullHistory: any[];
  onStepSelect: (step: number) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const VisualizationPanel: React.FC<VisualizationPanelProps> = ({ analysisData, fullHistory, onStepSelect, activeTab, setActiveTab }) => {
  const [selectedLayer, setSelectedLayer] = useState('layer_0');
  const [selectedColorscale, setSelectedColorscale] = useState('Blues');
  // User-adjustable minimum edge strength (fraction of max weight)
  const [edgeThreshold, setEdgeThreshold] = useState(0.2);
  const [showCircuitDetails, setShowCircuitDetails] = useState(false);
  const graphRef = useRef(null);
  const networkRef = useRef<Network | null>(null);

  useEffect(() => {
    if (analysisData && activeTab === 'attention-graph' && graphRef.current) {
      try {
        const { nodes: rawNodes, edges: rawEdges } = analysisData.attention_graph;

        // Check if we have valid data
        if (!rawNodes || !rawEdges || rawNodes.length === 0) {
          console.warn("No attention graph data available");
          return;
        }

        const maxWeight = rawEdges.length > 0 ? Math.max(...rawEdges.map((e: any) => e.value), 0) : 0;

        // --- Calculate per-node statistics for richer tooltips ---
        interface NodeStats { inDeg: number; outDeg: number; inW: number; outW: number; }
        const stats: Record<string, NodeStats> = {};
        rawNodes.forEach((n: any) => {
          stats[n.id] = { inDeg: 0, outDeg: 0, inW: 0, outW: 0 };
        });
        rawEdges.forEach((edge: any) => {
          if (!stats[edge.from]) stats[edge.from] = { inDeg: 0, outDeg: 0, inW: 0, outW: 0 };
          if (!stats[edge.to]) stats[edge.to] = { inDeg: 0, outDeg: 0, inW: 0, outW: 0 };
          stats[edge.from].outDeg += 1;
          stats[edge.from].outW += edge.value;
          stats[edge.to].inDeg += 1;
          stats[edge.to].inW += edge.value;
        });

        const seqLen = rawNodes.length;

        const nodes = rawNodes.map((node: any, index: number) => {
          const ratio = seqLen > 1 ? node.position / (seqLen - 1) : 0;
          const startColor = { r: 59, g: 130, b: 246 }; // blue-500
          const endColor = { r: 168, g: 85, b: 247 }; // purple-500
          const r = Math.round((1 - ratio) * startColor.r + ratio * endColor.r);
          const g = Math.round((1 - ratio) * startColor.g + ratio * endColor.g);
          const b = Math.round((1 - ratio) * startColor.b + ratio * endColor.b);
          
          const s = stats[node.id];
          return {
            id: node.id,
            label: node.label,
            title: `Token ${index}: ${node.label}\nIncoming: ${s.inDeg} (Σ ${s.inW.toFixed(2)})\nOutgoing: ${s.outDeg} (Σ ${s.outW.toFixed(2)})`,
            color: {
              background: `rgb(${r}, ${g}, ${b})`,
              border: '#1e293b',
              highlight: {
                background: '#38bdf8',
                border: '#0ea5e9'
              }
            },
            font: { 
              color: '#ffffff',
              size: 12,
              face: 'monospace'
            },
            borderWidth: 2,
            shape: 'box',
            margin: { top: 8, right: 8, bottom: 8, left: 8 }
          };
        });

        // Apply threshold chosen by the user to reduce hub-and-spoke effect
        const adaptiveThreshold = maxWeight * edgeThreshold;
        
        const edges = rawEdges
          .filter((edge: any) => edge.value > adaptiveThreshold) // Filter first
          .sort((a: any, b: any) => b.value - a.value) // Sort by strength
          .slice(0, Math.min(50, rawNodes.length * 3)) // Limit to top edges
          .map((edge: any) => {
            const ratio = Math.min((edge.value - adaptiveThreshold) / (maxWeight - adaptiveThreshold), 1);
            const startColor = { r: 100, g: 116, b: 139 }; // slate-500
            const endColor = { r: 34, g: 211, b: 238 };   // cyan-400
            const r = Math.round((1 - ratio) * startColor.r + ratio * endColor.r);
            const g = Math.round((1 - ratio) * startColor.g + ratio * endColor.g);
            const b = Math.round((1 - ratio) * startColor.b + ratio * endColor.b);
            const color = `rgb(${r}, ${g}, ${b})`;
            const width = 1 + ratio * 3; // Scale width from 1 to 4
            
            return {
              from: edge.from,
              to: edge.to,
              value: edge.value,
              color: {
                color: color,
                highlight: '#38bdf8',
                opacity: 0.8
              },
              width: width,
              arrows: {
                to: {
                  enabled: true,
                  scaleFactor: 0.8
                }
              },
              smooth: {
                enabled: true,
                type: 'cubicBezier',
                roundness: 0.3
              },
              title: `From: ${rawNodes[edge.from]?.label || edge.from}\nTo: ${rawNodes[edge.to]?.label || edge.to}\nAttention: ${edge.value.toFixed(3)}`
            };
          });

        const data = { nodes, edges };
        
        const options = {
          nodes: {
            shape: 'box',
            borderWidth: 2,
            borderWidthSelected: 3,
            font: {
              size: 12,
              face: 'monospace'
            }
          },
          edges: {
            smooth: {
              enabled: true,
              type: 'cubicBezier',
              roundness: 0.3
            },
            arrows: {
              to: {
                enabled: true,
                scaleFactor: 0.8
              }
            }
          },
          physics: {
            enabled: true,
            solver: 'forceAtlas2Based',
            forceAtlas2Based: {
              gravitationalConstant: -120,  // Even stronger repulsion to spread nodes
              centralGravity: 0.002,        // Minimal central pull to reduce hub effect
              springLength: 200,            // Longer springs for more space
              springConstant: 0.03,         // More flexible springs
              damping: 0.7,                 // Higher damping for smoother settling
              avoidOverlap: 1.0             // Prevent node overlap
            },
            maxVelocity: 40,                // Allow faster movement to spread out
            minVelocity: 0.1,
            stabilization: { 
              iterations: 300,              // More iterations for better layout
              fit: true                     // Fit to viewport after stabilization
            }
          },
          interaction: {
            hover: true,
            tooltipDelay: 200,
            dragNodes: true,
            dragView: true,
            zoomView: true
          },
          layout: {
            improvedLayout: true,
            clusterThreshold: 150
          }
        };

        // Clean up previous network
        if (networkRef.current) {
          networkRef.current.destroy();
          networkRef.current = null;
        }

        // Create new network
        networkRef.current = new Network(graphRef.current, data, options);

        // Handle stabilization
        networkRef.current.once('stabilizationIterationsDone', () => {
          networkRef.current?.setOptions({ physics: { enabled: false } });
        });

      } catch (error) {
        console.error("Error creating attention graph:", error);
        
        // Fallback: show error message in the container
        if (graphRef.current) {
          (graphRef.current as HTMLElement).innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #94a3b8; font-size: 14px;">
              <div style="text-align: center;">
                <div style="font-size: 24px; margin-bottom: 8px;">⚠️</div>
                <div>Failed to render attention graph</div>
                <div style="font-size: 12px; margin-top: 4px; opacity: 0.7;">Check browser console for details</div>
              </div>
            </div>
          `;
        }
      }
    }
  }, [analysisData, activeTab, edgeThreshold]);

  const renderContent = () => {
    if (!analysisData) {
      return <div className="text-center p-12 text-slate-500">Generate text to see visualizations.</div>;
    }

    switch (activeTab) {
      case 'attention-heatmap':
        const heatmapData = analysisData.attention_heatmap;
        const layers = Object.keys(heatmapData);
        const z = heatmapData[selectedLayer] || heatmapData[layers[0]];
        const labels = analysisData.tokens.map((t: any, index: number) => {
          let tokenText = t.text || '';
          
          // Handle special characters
          if (tokenText === '\n') return '\\n';
          if (tokenText === '\t') return '\\t';
          if (tokenText.trim() === '') return `[${index}]`;
          
          // Clean and truncate for better display
          tokenText = tokenText.trim();
          return tokenText.length > 10 ? tokenText.substring(0, 8) + '..' : tokenText;
        });
        const colorScales = [
          { value: 'Blues', name: 'Blues' }
        ];
        
        const currentLayerNum = selectedLayer.replace('layer_', '');
        
        return (
          <div className="space-y-4">
            {/* Explanation Card */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-3xl">🔥</div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-slate-200 mb-2">Attention Heatmap - Who's Talking to Whom?</h4>
                  <div className="text-sm text-slate-300 space-y-2">
                    <p>
                      This heatmap shows <strong>which words the AI is paying attention to</strong> when generating each new word.
                      {selectedColorscale === 'Blues' || selectedColorscale === 'Viridis' || selectedColorscale === 'Plasma' 
                        ? ' Lighter colors indicate stronger attention, darker colors indicate weaker attention (see the colorbar).'
                        : ' Brighter colors indicate stronger attention, darker colors indicate weaker attention (see the colorbar).'}
                    </p>
                    <div className="grid md:grid-cols-2 gap-3 mt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📍</span>
                        <span><strong>Rows (Y-axis):</strong> Current word being generated</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">👀</span>
                        <span><strong>Columns (X-axis):</strong> Words being looked at</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🌈</span>
                        <span><strong>{selectedColorscale === 'Blues' ? 'Lighter blues' : selectedColorscale === 'Viridis' ? 'Yellow/bright' : selectedColorscale === 'Plasma' ? 'Yellow/pink' : 'Bright colors'}:</strong> Strong attention connections</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🔲</span>
                        <span><strong>Darker areas:</strong> Weak/no attention</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-300">AI Layer:</label>
                <select 
                  value={selectedLayer} 
                  onChange={e => setSelectedLayer(e.target.value)} 
                  className="bg-slate-800 border border-slate-600 text-slate-300 rounded-md px-3 py-2 text-sm"
                >
                  {layers.map(l => {
                    const layerNum = l.replace('layer_', '');
                    return <option key={l} value={l}>Layer {parseInt(layerNum) + 1} of {layers.length}</option>
                  })}
                </select>
                <span className="text-xs text-slate-400 ml-2">
                  (Layer {parseInt(currentLayerNum) + 1} processes {parseInt(currentLayerNum) === 0 ? 'basic patterns' : parseInt(currentLayerNum) < layers.length/2 ? 'intermediate patterns' : 'complex patterns'})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-300">Color Theme:</label>
                <select 
                  value={selectedColorscale} 
                  onChange={e => setSelectedColorscale(e.target.value)} 
                  className="bg-slate-800 border border-slate-600 text-slate-300 rounded-md px-3 py-2 text-sm"
                >
                  {colorScales.map(scale => <option key={scale.value} value={scale.value}>{scale.name}</option>)}
                </select>
                <span className="text-xs text-slate-400">(Lighter = stronger)</span>
              </div>
            </div>

            <Plot
              data={[{ 
                z, 
                x: labels, 
                y: labels, 
                type: 'heatmap', 
                colorscale: selectedColorscale, 
                reversescale: true,
                colorbar: {
                  title: { text: 'Attention', side: 'right' },
                  tickfont: { color: '#94a3b8' },
                  outlinecolor: '#334155'
                },
                hovertemplate: 'From: %{y}<br>To: %{x}<br>Attention: %{z:.3f}<extra></extra>'
              }]}
              layout={{
                title: { 
                  text: `AI Attention Patterns - Layer ${parseInt(currentLayerNum) + 1}`, 
                  font: { color: '#e2e8f0', size: 16 } 
                },
                xaxis: { 
                  title: { text: 'Words Being Looked At', font: { color: '#94a3b8', size: 12 } },
                  side: 'top', 
                  tickfont: { color: '#94a3b8', size: 9 }, 
                  automargin: true,
                  tickangle: -45,
                  showticklabels: true
                },
                yaxis: { 
                  title: { text: 'Current Word Position', font: { color: '#94a3b8', size: 12 } },
                  autorange: 'reversed', 
                  tickfont: { color: '#94a3b8', size: 9 }, 
                  automargin: true,
                  showticklabels: true
                },
                paper_bgcolor: '#1e293b',
                plot_bgcolor: '#1e293b',
                font: { color: '#e2e8f0' },
                margin: { l: 100, r: 40, b: 80, t: 100, pad: 8 }
              }}
              className="w-full h-[600px]"
            />

            {/* Interpretation Guide */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
              <h5 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
                <span>💡</span> Reading This Heatmap
              </h5>
              <div className="text-xs text-slate-400 space-y-1">
                <p><strong>Diagonal line:</strong> Words paying attention to themselves (self-attention)</p>
                <p><strong>Vertical lines:</strong> Popular words that many others attend to (important context)</p>
                <p><strong>Horizontal lines:</strong> Words that look at many others (gathering lots of context)</p>
                <p><strong>Light clusters:</strong> Groups of related words attending to each other</p>
              </div>
            </div>
          </div>
        );
      case 'attention-graph':
        return (
          <div className="space-y-4">
            {/* Explanation Card */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-3xl">🕸️</div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-slate-200 mb-2">Attention Network - The AI's Information Flow</h4>
                  <div className="text-sm text-slate-300 space-y-2">
                    <p>
                      This network shows <strong>how information flows between words</strong> in the AI's "mind". 
                      Each word is a node, and arrows show which words are paying attention to which others.
                      Nodes spread out automatically to reveal hidden connections beyond central hubs.
                    </p>
                    <div className="grid md:grid-cols-2 gap-3 mt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🔵</span>
                        <span><strong>Blue boxes:</strong> Words/tokens in the text</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">➡️</span>
                        <span><strong>Arrows:</strong> Attention connections (thicker = stronger)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🌊</span>
                        <span><strong>Cyan lines:</strong> Strong attention flows</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🎯</span>
                        <span><strong>Central nodes:</strong> Important words getting lots of attention</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Edge filtering control */}
            <div className="flex items-center gap-2 mb-2 ml-1">
              <label className="text-xs text-slate-300 whitespace-nowrap">Min edge strength:</label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={edgeThreshold}
                onChange={e => setEdgeThreshold(parseFloat(e.target.value))}
                className="w-32 accent-cyan-400"
              />
              <span className="text-xs text-slate-400 w-10 text-right">{(edgeThreshold * 100).toFixed(0)}%</span>
            </div>

            {/* Graph */}
            <div className="relative">
              <div ref={graphRef} className="w-full h-[450px] border border-slate-700 rounded-md bg-slate-800"></div>
              
              {/* Interactive tips */}
              <div className="absolute top-2 right-2 bg-slate-900/90 border border-slate-600 rounded-lg p-2 text-xs text-slate-300">
                <div className="flex items-center gap-1 mb-1">
                  <span>🖱️</span>
                  <span><strong>Interactive:</strong></span>
                </div>
                <div className="space-y-1 text-slate-400">
                  <div>• Drag nodes to explore</div>
                  <div>• Hover nodes/edges for details</div>
                  <div>• Zoom with mouse wheel</div>
                  <div>• Only strongest connections shown</div>
                </div>
              </div>
            </div>

            {/* Interpretation Guide */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
              <h5 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
                <span>🔍</span> What to Look For
              </h5>
              <div className="grid md:grid-cols-2 gap-3 text-xs text-slate-400">
                <div>
                  <p><strong>Hub nodes:</strong> Words with many incoming arrows are "important" - they provide key context</p>
                  <p><strong>Clusters:</strong> Groups of connected words show related concepts</p>
                </div>
                <div>
                  <p><strong>Long arrows:</strong> The AI is connecting distant words (long-range dependencies)</p>
                  <p><strong>Self-loops:</strong> Words paying attention to themselves (self-reflection)</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'induction-timeline': {
        if (!fullHistory || fullHistory.length === 0) {
          return <div className="text-center p-12 text-slate-500">Generate data to see the timeline.</div>;
        }
        const timelineData = fullHistory[fullHistory.length - 1].pattern_evolution;
        const circuitData = analysisData?.icl_metrics?.induction_circuit;
        const steps = timelineData.map((d: any) => d.step);
        const scores = timelineData.map((d: any) => d.induction_score);
        const heads = timelineData.map((d: any) => d.num_induction_heads);
        
        // Detect learning moments with better logic
        const detectLearningMoments = () => {
          if (scores.length < 3) return [];
          
          const moments = [];
          const maxScore = Math.max(...scores);
          const avgScore = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
          
          // Define thresholds based on data distribution
          const highThreshold = Math.max(maxScore * 0.7, avgScore * 2); // Top 30% or 2x average
          const mediumThreshold = Math.max(maxScore * 0.4, avgScore * 1.5); // Top 60% or 1.5x average
          
          for (let i = 1; i < scores.length - 1; i++) {
            const current = scores[i];
            const prev = scores[i - 1];
            const next = scores[i + 1] || current;
            
            // Priority 1: Absolute peaks (highest scores get rockets regardless)
            const isAbsolutePeak = current >= highThreshold;
            
            // Priority 2: Significant breakthrough (big relative jump)
            const isBreakthrough = current > prev * 2 && current > mediumThreshold && current - prev > 5;
            
            // Priority 3: Sustained high activity
            const isSustained = current > highThreshold && next > highThreshold * 0.8;
            
            if (isAbsolutePeak || isBreakthrough || isSustained) {
              const stepData = fullHistory.find(h => h.step === steps[i]);
              const tokenAtStep = stepData?.tokens?.[stepData.tokens.length - 1];
              
              // Determine type and strength more intuitively
              let type = 'sustained';
              let strength = 'moderate';
              
              if (isAbsolutePeak) {
                type = current >= maxScore * 0.9 ? 'breakthrough' : 'sustained'; // Top 10% get rockets
                strength = current >= maxScore * 0.8 ? 'strong' : 'moderate';    // Top 20% are strong
              } else if (isBreakthrough) {
                type = 'breakthrough';
                strength = current > highThreshold ? 'strong' : 'moderate';
              }
              
              moments.push({
                x: steps[i],
                y: current,
                step: i,
                token: tokenAtStep?.text || '',
                type: type,
                strength: strength,
                reason: isAbsolutePeak ? `Peak score (${current.toFixed(1)})` : 
                       isBreakthrough ? `Breakthrough (+${(current - prev).toFixed(1)})` : 
                       'Sustained activity'
              });
            }
          }
          
          // Sort by score (highest first) and limit to top 8 most important moments
          return moments
            .sort((a, b) => b.y - a.y)
            .slice(0, 8);
        };
        
        const learningMoments = detectLearningMoments();
        
        const layout: Partial<Plotly.Layout> = {
            title: { text: 'Induction Head Timeline - In-Context Learning Progress', font: { color: '#e2e8f0', size: 18 } },
            xaxis: { 
              title: { text: 'Generation Step', font: { color: '#94a3b8' } }, 
              gridcolor: '#334155', 
              tickfont: { color: '#94a3b8' } 
            },
            yaxis: { 
              title: { text: 'Induction Score', font: { color: '#38bdf8' } }, 
              side: 'left', 
              color: '#38bdf8', 
              gridcolor: '#334155', 
              tickfont: { color: '#38bdf8' } 
            },
            yaxis2: { 
              title: { text: 'Number of Induction Heads', font: { color: '#f472b6' } }, 
              side: 'right', 
              overlaying: 'y', 
              color: '#f472b6', 
              gridcolor: '#334155', 
              tickfont: { color: '#f472b6' } 
            },
            paper_bgcolor: '#1e293b',
            plot_bgcolor: '#1e293b',
            legend: { x: 0.5, y: 1.15, orientation: 'h', xanchor: 'center', font: { color: '#e2e8f0' } },
            shapes: [
              // Current step indicator
              ...(analysisData ? [{
                type: 'line' as const,
                x0: analysisData.step,
                y0: 0,
                x1: analysisData.step,
                y1: 1,
                yref: 'paper' as const,
                line: {
                  color: 'rgba(255, 255, 255, 0.3)',
                  width: 2,
                  dash: 'dot' as any
                }
              }] : []),
              // Elegant highlighting for learning moments - subtle background highlights instead of circles
              ...learningMoments.map(moment => ({
                type: 'rect' as const,
                xref: 'x' as const,
                yref: 'paper' as const,
                x0: moment.x - 0.5,
                y0: 0,
                x1: moment.x + 0.5,
                y1: 1,
                fillcolor: moment.strength === 'strong' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.08)',
                line: { width: 0 }
              }))
            ],
            annotations: [
              // Add subtle markers for learning moments
              ...learningMoments.slice(0, 5).map(moment => ({
                x: moment.x,
                y: moment.y,
                text: moment.type === 'breakthrough' ? '●' : '◐',
                showarrow: false,
                font: { 
                  size: 14, 
                  color: moment.type === 'breakthrough' ? '#ef4444' : '#eab308'
                },
                xshift: 0,
                yshift: 10
              }))
            ]
        };

        return (
            <div className="space-y-4">
              {/* Circuit Status Card - Expandable */}
              {circuitData && (
                <div className={`border-2 rounded-lg ${
                  circuitData.circuit_strength === 'STRONG' ? 'bg-green-500/10 border-green-500' :
                  circuitData.circuit_strength === 'PARTIAL' ? 'bg-yellow-500/10 border-yellow-500' :
                  circuitData.circuit_strength === 'WEAK' ? 'bg-orange-500/10 border-orange-500' :
                  'bg-slate-700/50 border-slate-600'
                }`}>
                  {/* Compact Header - Always Visible */}
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {circuitData.circuit_strength === 'STRONG' ? '✅' : 
                           circuitData.circuit_strength === 'PARTIAL' ? '⚠️' : 
                           circuitData.circuit_strength === 'WEAK' ? '⚡' : '❌'}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-base font-bold ${
                              circuitData.circuit_strength === 'STRONG' ? 'text-green-400' :
                              circuitData.circuit_strength === 'PARTIAL' ? 'text-yellow-400' :
                              circuitData.circuit_strength === 'WEAK' ? 'text-orange-400' :
                              'text-slate-400'
                            }`}>
                              Two-Head Circuit: {circuitData.circuit_strength}
                            </span>
                            <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded">
                              Score: {circuitData.combined_score.toFixed(1)}
                            </span>
                          </div>
                          <div className="text-xs text-slate-300 mt-1 flex items-center gap-3">
                            <span>
                              {circuitData.has_prev_head ? '✅' : '❌'} {circuitData.previous_token_heads.length} Prev-Token
                            </span>
                            <span className="text-slate-600">•</span>
                            <span>
                              {circuitData.has_induction_head ? '✅' : '❌'} {analysisData?.icl_metrics?.induction_heads || 0} Induction
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowCircuitDetails(!showCircuitDetails)}
                        className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded transition flex items-center gap-1"
                        title="Toggle detailed circuit breakdown"
                      >
                        {showCircuitDetails ? 'Hide Details' : 'Show Details'} {showCircuitDetails ? '▲' : '▼'}
                      </button>
                    </div>
                    {circuitData.circuit_strength === 'STRONG' && !showCircuitDetails && (
                      <div className="mt-2 pt-2 border-t border-green-600/30 text-xs text-green-300/90">
                        <strong>🔬 Full Circuit Active:</strong> Previous-token heads (early layers) + Induction heads (later layers) = True In-Context Learning
                      </div>
                    )}
                    {circuitData.circuit_strength === 'PARTIAL' && !showCircuitDetails && (
                      <div className="mt-2 pt-2 border-t border-yellow-600/30 text-xs text-yellow-300/90">
                        <strong>⚠️ Incomplete Circuit:</strong> {circuitData.explanation}
                      </div>
                    )}
                  </div>

                  {/* Detailed Breakdown - Collapsible */}
                  {showCircuitDetails && (
                    <div className="border-t border-slate-600/50 p-4 space-y-4">
                      {/* Full Explanation */}
                      <div className="text-sm text-slate-300">
                        {circuitData.explanation}
                      </div>

                      {/* Components Grid */}
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Previous Token Heads */}
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <h4 className="font-semibold text-cyan-400 mb-2 flex items-center gap-2">
                            <span>🔄</span> Previous-Token Heads ({circuitData.previous_token_heads.length})
                          </h4>
                          {circuitData.previous_token_heads.length > 0 ? (
                            <>
                              <p className="text-xs text-slate-400 mb-3">
                                Creating shifted representations in layers{' '}
                                {(() => {
                                  const layers = circuitData.previous_token_heads.map((h: any) => h.layer);
                                  return `${Math.min(...layers)}-${Math.max(...layers)}`;
                                })()}
                              </p>
                              <div className="space-y-1 max-h-48 overflow-y-auto">
                                {circuitData.previous_token_heads.map((head: any, idx: number) => (
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
                            </>
                          ) : (
                            <p className="text-xs text-slate-500">No previous-token heads detected</p>
                          )}
                        </div>

                        {/* Induction Heads Summary */}
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <h4 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
                            <span>🧠</span> Induction Heads ({analysisData?.icl_metrics?.induction_heads || 0})
                          </h4>
                          {circuitData.has_induction_head ? (
                            <>
                              <p className="text-xs text-slate-400 mb-3">
                                Pattern matching in layers{' '}
                                {circuitData.explanation.match(/layers (\d+-\d+)/)?.[1] || 'multiple'}
                              </p>
                              <div className="bg-slate-700/50 rounded p-3">
                                <div className="flex justify-between items-center text-xs mb-1">
                                  <span className="text-slate-400">Induction Score</span>
                                  <span className="text-purple-400 font-bold">
                                    {analysisData?.icl_metrics?.induction_score.toFixed(2)}
                                  </span>
                                </div>
                                <div className="w-full bg-slate-600 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                                    style={{ width: `${Math.min((analysisData?.icl_metrics?.induction_score || 0) * 2, 100)}%` }}
                                  />
                                </div>
                              </div>
                              <button
                                onClick={() => setActiveTab('induction')}
                                className="mt-3 w-full text-xs bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 px-3 py-1.5 rounded transition"
                              >
                                View All {analysisData?.icl_metrics?.induction_heads} Heads →
                              </button>
                            </>
                          ) : (
                            <p className="text-xs text-slate-500">No induction heads detected</p>
                          )}
                        </div>
                      </div>

                      {/* Circuit Flow Diagram */}
                      {circuitData.circuit_strength === 'STRONG' && (
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <h4 className="text-sm font-semibold text-slate-300 mb-3">🔄 Circuit Information Flow</h4>
                          <div className="flex items-center justify-center gap-3 text-xs">
                            <div className="text-center">
                              <div className="bg-cyan-500/20 border-2 border-cyan-500 rounded-lg p-2 mb-1">
                                <div className="text-cyan-400 font-bold text-xs">
                                  Layers {(() => {
                                    const layers = circuitData.previous_token_heads.map((h: any) => h.layer);
                                    return layers.length > 0 ? `${Math.min(...layers)}-${Math.max(...layers)}` : '?';
                                  })()}
                                </div>
                                <div className="text-slate-300 text-xs mt-1">Prev-Token</div>
                              </div>
                            </div>
                            <div className="text-slate-500">→</div>
                            <div className="text-center">
                              <div className="bg-purple-500/20 border-2 border-purple-500 rounded-lg p-2 mb-1">
                                <div className="text-purple-400 font-bold text-xs">
                                  Layers {circuitData.explanation.match(/layers (\d+-\d+)/)?.[1] || '?'}
                                </div>
                                <div className="text-slate-300 text-xs mt-1">Induction</div>
                              </div>
                            </div>
                            <div className="text-slate-500">→</div>
                            <div className="text-center">
                              <div className="bg-green-500/20 border-2 border-green-500 rounded-lg p-2 mb-1">
                                <div className="text-green-400 font-bold text-xs">ICL</div>
                                <div className="text-slate-300 text-xs mt-1">Output</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Friendly explanation card */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">🧠</div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-slate-200 mb-2">Understanding In-Context Learning</h4>
                    <div className="text-sm text-slate-300 space-y-2">
                      <p>
                        This graph shows how the AI learns patterns <strong>while generating text</strong>, 
                        without any training updates. It's like watching someone learn to answer questions 
                        by studying examples in real-time!
                      </p>
                      <div className="grid md:grid-cols-2 gap-3 mt-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                          <span><strong>Blue line:</strong> Induction Score (how well it detects and copies patterns)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
                          <span><strong>Pink dots:</strong> Number of active induction heads</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full border border-red-300"></div>
                          <span><strong>Peak Moments:</strong> Major induction head breakthroughs</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full border border-yellow-300"></div>
                          <span><strong>Sustained Activity:</strong> Consistent induction patterns</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Plot
                data={[
                  { 
                    x: steps, 
                    y: scores, 
                    name: 'Induction Score', 
                    type: 'scatter', 
                    mode: 'lines+markers', 
                    yaxis: 'y1', 
                    line: {color: '#38bdf8', width: 3, shape: 'spline'},
                    marker: { size: 6, color: '#38bdf8' },
                    fill: 'tonexty',
                    fillcolor: 'rgba(56, 189, 248, 0.1)',
                    hovertemplate: '<b>Step %{x}</b><br>Induction Score: %{y:.1f}<br>%{customdata}<extra></extra>',
                    customdata: scores.map((s: number) => {
                      if (s > 30) return 'Very Strong Induction 🔥';
                      if (s > 20) return 'Strong Induction 💪';
                      if (s > 10) return 'Moderate Induction 📈';
                      return 'Weak Induction 🌱';
                    })
                  },
                  { 
                    x: steps, 
                    y: heads, 
                    name: 'Number of Induction Heads', 
                    type: 'scatter', 
                    mode: 'lines+markers', 
                    yaxis: 'y2', 
                    line: {color: '#f472b6', dash: 'dot', width: 2},
                    marker: { size: 4, color: '#f472b6' }
                  }
                ]}
                layout={layout}
                className="w-full h-[500px]"
                onClick={(e: any) => onStepSelect(e.points[0].x)}
              />
              
              {/* Learning moments summary */}
              {learningMoments.length > 0 && (
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-slate-200 mb-3 flex items-center gap-2">
                    <span>🎯</span>
                    Key Learning Moments
                  </h4>
                  <p className="text-sm text-slate-400 mb-3">
                    Click on any moment below to see exactly when and how the AI learned to copy patterns:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {learningMoments.map((moment, idx) => {
                      const stepData = fullHistory.find(h => h.step === moment.x);
                      const tokenAtStep = stepData?.tokens?.[stepData.tokens.length - 1];
                      return (
                        <button
                          key={idx}
                          onClick={() => onStepSelect(moment.x)}
                          className={`text-left p-3 rounded-lg text-sm transition-all duration-200 hover:scale-105 ${
                            moment.strength === 'strong' 
                              ? 'bg-gradient-to-br from-green-900/40 to-emerald-900/40 border border-green-700/50 hover:border-green-600' 
                              : 'bg-gradient-to-br from-blue-900/40 to-sky-900/40 border border-blue-700/50 hover:border-blue-600'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-2 h-2 rounded-full ${
                              moment.type === 'breakthrough' ? 'bg-red-500' : 'bg-yellow-500'
                            }`}></div>
                            <span className="font-medium text-slate-200">
                              Step {moment.x}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              moment.strength === 'strong' 
                                ? 'bg-green-900/50 text-green-300' 
                                : 'bg-blue-900/50 text-blue-300'
                            }`}>
                              {moment.strength}
                            </span>
                          </div>
                          <div className="text-slate-300 mb-1">
                            Learning Score: <span className="font-mono">{moment.y.toFixed(1)}</span>
                          </div>
                          {tokenAtStep && (
                            <div className="text-slate-400 text-xs">
                              Context: "<span className="font-mono">{tokenAtStep.text}</span>"
                            </div>
                          )}
                          <div className="text-xs text-slate-500 mt-1">
                            {moment.type === 'breakthrough' ? 'Major pattern breakthrough' : 'Sustained pattern recognition'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
        );
      }

      case 'strategy-timeline': {
        if (!fullHistory || fullHistory.length === 0) {
          return <div className="text-center p-12 text-slate-500">Generate data to see the timeline.</div>;
        }
        const timelineData = fullHistory[fullHistory.length - 1].pattern_evolution;
        const steps = timelineData.map((d: any) => d.step);
        const inductionStrength = timelineData.map((d: any) => d.induction_strength);
        const copyingStrength = timelineData.map((d: any) => d.copying_strength);
        const prevTokenStrength = timelineData.map((d: any) => d.previous_token_strength);
        
        const layout: Partial<Plotly.Layout> = {
            title: { text: 'Pattern Strategy Timeline', font: { color: '#e2e8f0' } },
            xaxis: { title: { text: 'Generation Step', font: { color: '#94a3b8' } }, gridcolor: '#334155', tickfont: { color: '#94a3b8' } },
            yaxis: { title: { text: 'Strength', font: { color: '#94a3b8' } }, gridcolor: '#334155', tickfont: { color: '#94a3b8' }, range: [0, 1] },
            paper_bgcolor: '#1e293b',
            plot_bgcolor: '#1e293b',
            legend: { x: 0.5, y: 1.1, orientation: 'h', xanchor: 'center', font: { color: '#e2e8f0' } },
            shapes: analysisData ? [
              {
                type: 'line',
                x0: analysisData.step,
                y0: 0,
                x1: analysisData.step,
                y1: 1,
                yref: 'paper',
                line: {
                  color: 'rgba(255, 255, 255, 0.5)',
                  width: 2,
                  dash: 'dot'
                }
              }
            ] : []
        };

        return (
            <Plot
              data={[
                { x: steps, y: inductionStrength, name: 'Induction Strength', type: 'scatter', mode: 'lines', line: {color: '#3b82f6'} },
                { x: steps, y: copyingStrength, name: 'Copying Strength', type: 'scatter', mode: 'lines', line: {color: '#10b981'} },
                { x: steps, y: prevTokenStrength, name: 'Previous Token Strength', type: 'scatter', mode: 'lines', line: {color: '#f59e0b'} }
              ]}
              layout={layout}
              className="w-full h-[550px]"
              onClick={(e: any) => onStepSelect(e.points[0].x)}
            />
        );
      }

      case 'token-importance':
        const importanceData = analysisData.token_importance;
        
        // Sort tokens by importance metrics for better visualization
        const sortedData = [...importanceData].sort((a: any, b: any) => 
          (b.incoming_attention + b.outgoing_attention) - (a.incoming_attention + a.outgoing_attention)
        );

        const hubCount = sortedData.filter((item: any) => item.incoming_attention > item.outgoing_attention * 2).length;
        const scannerCount = sortedData.filter((item: any) => item.outgoing_attention > item.incoming_attention * 2).length;
        const bridgeCount = sortedData.filter((item: any) => 
          (item.incoming_attention + item.outgoing_attention) > 1.5 && 
          Math.abs(item.incoming_attention - item.outgoing_attention) < 0.5
        ).length;

        return (
          <div className="space-y-4">
            {/* Explanation Card */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-3xl">⭐</div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-slate-200 mb-2">Token Importance Analysis</h4>
                  <div className="text-sm text-slate-300 space-y-2">
                    <p>
                      This table shows <strong>how important each word/token is</strong> in the AI's decision-making process. 
                      Higher numbers mean the token plays a bigger role in generating text.
                    </p>
                    <div className="grid md:grid-cols-2 gap-3 mt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📥</span>
                        <span><strong>Incoming Attention:</strong> How much other tokens look at this one</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📤</span>
                        <span><strong>Outgoing Attention:</strong> How much this token looks at others</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🌐</span>
                        <span><strong>Attention Entropy:</strong> How focused vs. scattered its attention is</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🏆</span>
                        <span><strong>Top tokens:</strong> Most important for context and meaning</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Table */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              <div className="overflow-y-auto max-h-[400px]">
                <table className="table-auto w-full text-sm">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-900 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left">Token</th>
                      <th className="px-4 py-3 text-center">Incoming</th>
                      <th className="px-4 py-3 text-center">Outgoing</th>
                      <th className="px-4 py-3 text-center">Entropy</th>
                      <th className="px-4 py-3 text-center">Role</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300">
                    {sortedData.map((item: any, index: number) => {
                      const totalAttention = item.incoming_attention + item.outgoing_attention;
                      const isHighImportance = totalAttention > 1.5;
                      const isMediumImportance = totalAttention > 0.8;
                      
                      const getRole = () => {
                        if (item.incoming_attention > item.outgoing_attention * 2) return { role: "Hub", color: "text-purple-400", desc: "Key context provider" };
                        if (item.outgoing_attention > item.incoming_attention * 2) return { role: "Scanner", color: "text-blue-400", desc: "Information gatherer" };
                        if (totalAttention > 1.5) return { role: "Bridge", color: "text-green-400", desc: "Connects concepts" };
                        return { role: "Support", color: "text-slate-400", desc: "Background context" };
                      };
                      
                      const roleInfo = getRole();

                      return (
                        <tr 
                          key={index} 
                          className={`border-b border-slate-700 hover:bg-slate-700/50 ${
                            isHighImportance ? 'bg-emerald-900/20' : 
                            isMediumImportance ? 'bg-blue-900/20' : ''
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sky-400 font-medium">
                                {item.token}
                              </span>
                              {isHighImportance && <span className="text-yellow-400">⭐</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span className="font-mono">{item.incoming_attention.toFixed(2)}</span>
                              <div className="w-16 bg-slate-700 rounded-full h-1.5">
                                <div 
                                  className="bg-purple-400 h-1.5 rounded-full" 
                                  style={{ width: `${Math.min(item.incoming_attention * 50, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span className="font-mono">{item.outgoing_attention.toFixed(2)}</span>
                              <div className="w-16 bg-slate-700 rounded-full h-1.5">
                                <div 
                                  className="bg-blue-400 h-1.5 rounded-full" 
                                  style={{ width: `${Math.min(item.outgoing_attention * 50, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="font-mono">{item.attention_entropy.toFixed(2)}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex flex-col items-center">
                              <span className={`font-medium ${roleInfo.color}`}>{roleInfo.role}</span>
                              <span className="text-xs text-slate-500">{roleInfo.desc}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                <h5 className="text-sm font-semibold text-purple-400 mb-1">Hub {hubCount === 1 ? 'Token' : 'Tokens'}</h5>
                <p className="text-xs text-slate-400">
                  {hubCount} {hubCount === 1 ? 'token' : 'tokens'} act as key context providers
                </p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                <h5 className="text-sm font-semibold text-blue-400 mb-1">Scanner {scannerCount === 1 ? 'Token' : 'Tokens'}</h5>
                <p className="text-xs text-slate-400">
                  {scannerCount} {scannerCount === 1 ? 'token' : 'tokens'} actively gather information
                </p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                <h5 className="text-sm font-semibold text-green-400 mb-1">Bridge {bridgeCount === 1 ? 'Token' : 'Tokens'}</h5>
                <p className="text-xs text-slate-400">
                  {bridgeCount} {bridgeCount === 1 ? 'token' : 'tokens'} connect different concepts
                </p>
              </div>
            </div>
          </div>
        );
      case 'induction':
        return <InductionHeadVisualizer 
          inductionDetails={analysisData?.icl_metrics?.induction_details || []} 
          tokens={analysisData?.tokens || []}
        />;
      default:
        return null;
    }
  };

  const tabs = [
    { id: 'induction-timeline', label: 'Induction Timeline', tooltip: '📈 ICL progress + circuit status - see the full learning story!' },
    { id: 'attention-heatmap', label: 'Attention Heatmap', tooltip: '🔥 See which tokens connect - bright spots = strong attention' },
    { id: 'attention-graph', label: 'Attention Graph', tooltip: '🕸️ Network view of attention flow - arrows show connections' },
    { id: 'strategy-timeline', label: 'Strategy Timeline', tooltip: '📊 How model balances induction vs copying strategies' },
    { id: 'token-importance', label: 'Token Importance', tooltip: '⭐ Bar charts showing each token\'s role and importance' },
    { id: 'induction', label: 'Induction Heads', tooltip: '🧠 Which parts of the AI brain are doing pattern recognition' }
  ];

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 flex flex-col h-full">
      <div className="flex border-b border-slate-700 mb-4" id="visualization-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            title={tab.tooltip}
            className={`px-4 py-2 -mb-px font-semibold text-sm rounded-t-md transition-colors ${activeTab === tab.id ? 'text-sky-400 border-b-2 border-sky-400 bg-slate-800' : 'text-slate-400 border-b-2 border-transparent hover:bg-slate-800 hover:text-slate-200'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-grow">
        {renderContent()}
      </div>
    </div>
  );
};

export default VisualizationPanel;

'use client';

import React from 'react';

interface HeadSpecializationVisualizerProps {
  tokens: { id: number; text: string }[];
  attentionMatrix: number[][]; // Attention for a single head: (seq_len, seq_len)
  threshold?: number;
}

const HeadSpecializationVisualizer: React.FC<HeadSpecializationVisualizerProps> = ({
  tokens,
  attentionMatrix,
  threshold = 0.1,
}) => {
  if (!tokens || tokens.length === 0 || !attentionMatrix || attentionMatrix.length === 0) {
    return <div className="p-4 text-slate-400">Select a head to visualize its attention pattern.</div>;
  }

  return (
    <div className="p-4 bg-slate-800 border border-slate-700 rounded-lg text-lg leading-relaxed">
      <p className="whitespace-pre-wrap">
        {tokens.map((token, to_index) => {
          // Find the token this token is paying the most attention to
          let maxAttention = 0;
          let from_index = -1;
          if (attentionMatrix[to_index]) {
            for (let i = 0; i < to_index; i++) {
              if (attentionMatrix[to_index][i] > maxAttention) {
                maxAttention = attentionMatrix[to_index][i];
                from_index = i;
              }
            }
          }

          const shouldHighlight = maxAttention > threshold;
          const hue = shouldHighlight ? (from_index / tokens.length) * 360 : 0;
          const color = shouldHighlight ? `hsl(${hue}, 70%, 60%)` : 'inherit';
          const textShadow = shouldHighlight ? `0 0 5px ${color}` : 'none';

          return (
            <span
              key={to_index}
              className="relative inline-block"
              title={`Attends to '${tokens[from_index]?.text}' (pos ${from_index}) with score ${maxAttention.toFixed(3)}`}
              style={{ 
                color,
                textShadow,
                transition: 'color 0.3s, text-shadow 0.3s',
              }}
            >
              {token.text.replace(/ /g, '\u00a0')}
            </span>
          );
        })}
      </p>
    </div>
  );
};

export default HeadSpecializationVisualizer;

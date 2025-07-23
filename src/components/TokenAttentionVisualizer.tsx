import React, { useState, useRef, useEffect } from 'react';

interface Token {
  id: number;
  text: string;
}

interface TokenAttentionVisualizerProps {
  tokens: Token[];
  attentionMatrix: number[][]; // Expects a 2D matrix for the last layer avg
}

const TokenAttentionVisualizer: React.FC<TokenAttentionVisualizerProps> = ({ tokens, attentionMatrix }) => {
  const [hoveredTokenIndex, setHoveredTokenIndex] = useState<number | null>(null);
  const tokenRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    tokenRefs.current = tokenRefs.current.slice(0, tokens.length);
  }, [tokens]);

  const getAttentionForToken = (tokenIndex: number) => {
    if (!attentionMatrix || tokenIndex < 0 || tokenIndex >= attentionMatrix.length) {
      return [];
    }
    const attentionWeights = attentionMatrix[tokenIndex];
    return attentionWeights
      .map((weight, index) => ({ index, weight }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5); // Get top 5 attended tokens
  };

  const renderAttentionLines = () => {
    if (hoveredTokenIndex === null || !containerRef.current) return null;

    const targetToken = tokenRefs.current[hoveredTokenIndex];
    if (!targetToken) return null;

    const containerRect = containerRef.current.getBoundingClientRect();
    const targetRect = targetToken.getBoundingClientRect();
    const endX = targetRect.left - containerRect.left + targetRect.width / 2;
    const endY = targetRect.top - containerRect.top + targetRect.height / 2;

    const attendedTokens = getAttentionForToken(hoveredTokenIndex);

    return attendedTokens.map(({ index, weight }) => {
      const sourceToken = tokenRefs.current[index];
      if (!sourceToken) return null;

      const sourceRect = sourceToken.getBoundingClientRect();
      const startX = sourceRect.left - containerRect.left + sourceRect.width / 2;
      const startY = sourceRect.top - containerRect.top + sourceRect.height / 2;

      return (
        <line
          key={`${index}-${hoveredTokenIndex}`}
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke="rgba(56, 189, 248, 0.6)" // sky-400 with opacity
          strokeWidth={1 + weight * 4}
          markerEnd="url(#arrow)"
        />
      );
    });
  };

  return (
    <div ref={containerRef} className="relative bg-slate-800 border border-slate-700 rounded-md p-3 h-48 overflow-y-auto">
      <div className="flex flex-wrap gap-1">
        {tokens.map((token, index) => (
          <span
            key={index}
            ref={el => { tokenRefs.current[index] = el; }}
            onMouseEnter={() => setHoveredTokenIndex(index)}
            onMouseLeave={() => setHoveredTokenIndex(null)}
            className={`cursor-pointer transition-colors duration-200 px-2 py-1 rounded text-xs font-mono ${hoveredTokenIndex === index ? 'bg-sky-500 text-white' : 'bg-slate-700 text-slate-300'}`}
          >
            {token.text.replace(/ /g, ' ')}
          </span>
        ))}
      </div>
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5"
              markerWidth="4" markerHeight="4"
              orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(56, 189, 248, 0.6)" />
          </marker>
        </defs>
        {renderAttentionLines()}
      </svg>
    </div>
  );
};

export default TokenAttentionVisualizer;

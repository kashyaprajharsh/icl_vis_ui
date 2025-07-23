// frontend/src/components/PatternStrengthVisualizer.tsx
'use client';

import React from 'react';

// Define the type for the new data
interface PatternStrength {
  induction: number;
  copying: number;
  previous_token: number;
}

interface Props {
  data: PatternStrength | null;
}

// A helper component for the bar
const StrengthBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div style={{ marginBottom: '8px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#E5E7EB' }}>
      <span>{label}</span>
      <span>{(value * 100).toFixed(1)}%</span>
    </div>
    <div style={{ backgroundColor: '#374151', borderRadius: '4px', overflow: 'hidden' }}>
      <div style={{
        width: `${value * 100}%`,
        backgroundColor: color,
        height: '10px',
        transition: 'width 0.3s ease-in-out'
      }} />
    </div>
  </div>
);


export const PatternStrengthVisualizer: React.FC<Props> = ({ data }) => {
  if (!data) {
    return null;
  }

  return (
    <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 mt-4">
      <h3 className="text-lg font-semibold text-slate-200 mb-3">Attention Pattern Strength</h3>
      <StrengthBar label="Induction" value={data.induction} color="#4299e1" />
      <StrengthBar label="Copying" value={data.copying} color="#48bb78" />
      <StrengthBar label="Previous Token" value={data.previous_token} color="#f6ad55" />
    </div>
  );
};

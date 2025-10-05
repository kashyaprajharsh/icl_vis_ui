/**
 * ICL Visualizer - Color Guide
 * 
 * This file documents the consistent color scheme used throughout the application.
 * Colors are semantically meaningful and consistent across all visualizations.
 */

export const COLOR_GUIDE = {
  /**
   * PRIMARY SEMANTIC COLORS
   * These colors represent specific ICL concepts consistently across the app
   */
  
  // PURPLE: Induction / Pattern Recognition
  induction: {
    name: 'Purple',
    hex: '#a855f7',
    tailwind: 'purple-500',
    usage: [
      'Induction target tokens (text highlighting)',
      'Strong induction circuit badges',
      'Induction head bars (high activity)',
      'Pattern recognition indicators'
    ],
    meaning: 'The model is using induction heads to predict based on recognized patterns [A][B]...[A]→[B]'
  },
  
  // BLUE/CYAN: Copying / Exact Repetition / Attention Flow
  copying: {
    name: 'Blue/Cyan',
    hex: '#38bdf8',
    tailwind: 'sky-400',
    usage: [
      'Copying source tokens (text highlighting)',
      'Induction score line (timeline)',
      'Attention heatmap (Blues colorscale)',
      'Network graph edges',
      'Copying strength bars'
    ],
    meaning: 'The model is copying or paying attention to this specific token/pattern'
  },
  
  // GREEN: High Attention / Important Context
  highAttention: {
    name: 'Green',
    hex: '#22c55e',
    tailwind: 'green-500',
    usage: [
      'High incoming attention tokens (text highlighting)',
      'Strong circuit status badges',
      'Important context markers',
      'Success states'
    ],
    meaning: 'This token receives high attention from other tokens - it provides important context'
  },
  
  // YELLOW/AMBER: Attention Source / Scanning / Moderate Activity
  attentionSource: {
    name: 'Yellow/Amber',
    hex: '#eab308',
    tailwind: 'yellow-500',
    usage: [
      'Attention source tokens (tokens attending to others)',
      'Sustained learning moments (timeline markers)',
      'Partial circuit status badges',
      'Moderate induction activity'
    ],
    meaning: 'This token is actively scanning/attending to other tokens to gather information'
  },
  
  // PINK/MAGENTA: Induction Head Count
  inductionHeads: {
    name: 'Pink',
    hex: '#f472b6',
    tailwind: 'pink-400',
    usage: [
      'Number of active induction heads (timeline)',
      'Induction head count dots',
      'Secondary induction metrics'
    ],
    meaning: 'Number of attention heads actively performing induction at this step'
  },
  
  // RED: Breakthrough Moments / Strong Activity
  breakthrough: {
    name: 'Red',
    hex: '#ef4444',
    tailwind: 'red-500',
    usage: [
      'Peak learning moments (timeline markers)',
      'Major induction breakthroughs',
      'Very strong induction head activity',
      'Critical alerts'
    ],
    meaning: 'Major breakthrough - significant pattern recognition occurring'
  },
  
  // ORANGE: Weak/Partial Activity
  weak: {
    name: 'Orange',
    hex: '#f97316',
    tailwind: 'orange-500',
    usage: [
      'Weak circuit status badges',
      'Moderate induction head bars',
      'Partial pattern detection',
      'Warning states'
    ],
    meaning: 'Weak or partial pattern recognition - ICL is present but not strong'
  },
  
  /**
   * NEUTRAL/UI COLORS
   * Used for interface elements, not semantic meaning
   */
  
  neutral: {
    slate: {
      name: 'Slate Gray',
      usage: ['Backgrounds', 'Borders', 'Normal text', 'Inactive elements'],
      tailwind: 'slate-300/400/700/800/900'
    },
    white: {
      name: 'White',
      usage: ['Primary text', 'Headers', 'High contrast elements'],
      tailwind: 'white/slate-100'
    }
  }
};

/**
 * COLOR USAGE BY COMPONENT
 */

export const COMPONENT_COLORS = {
  'ICLHighlightedText': {
    purple: 'Induction target - model predicting using patterns',
    blue: 'Copying source - token being referenced/copied',
    green: 'High attention - important for context',
    yellow: 'Attention source - attending to other tokens'
  },
  
  'InductionTimeline': {
    cyan: 'Induction score line (primary metric)',
    pink: 'Number of active induction heads',
    red: 'Peak breakthrough moments',
    yellow: 'Sustained learning activity',
    blueBackground: 'Confidence area under curve'
  },
  
  'AttentionHeatmap': {
    blues: 'Lighter = stronger attention, darker = weaker',
    viridis: 'Yellow/bright = stronger, purple/dark = weaker',
    plasma: 'Yellow/pink = stronger, purple/dark = weaker'
  },
  
  'AttentionGraph': {
    cyan: 'Network edges (attention connections)',
    colorGradient: 'Node colors by importance (red=high, blue=low)'
  },
  
  'StrategyTimeline': {
    purple: 'Induction strategy strength',
    blue: 'Copying strategy strength',
    green: 'Previous token attention strength'
  },
  
  'GenerationControls': {
    cyan: 'Induction bar',
    green: 'Copying bar',
    orange: 'Previous token bar',
    circuitBadges: {
      green: 'STRONG circuit',
      yellow: 'PARTIAL circuit',
      orange: 'WEAK circuit',
      gray: 'NO circuit'
    }
  },
  
  'InductionHeads': {
    purple: 'Very strong heads (score > 0.5)',
    red: 'Very strong heads (alternate)',
    orange: 'Strong heads (score > 0.3)',
    amber: 'Moderate heads (score > 0.1)',
    gray: 'Weak heads (score < 0.1)'
  }
};

/**
 * ACCESSIBILITY NOTES
 * - All colors maintain WCAG AA contrast ratios
 * - Color is never the only indicator (icons, text, patterns also used)
 * - Hover tooltips provide text descriptions
 * - Color meanings are documented in help system
 */

export const ACCESSIBILITY = {
  contrastRatios: {
    purple: '4.5:1 (AA compliant)',
    blue: '7:1 (AAA compliant)',
    green: '4.5:1 (AA compliant)',
    yellow: '4.5:1 (AA compliant)'
  },
  alternatives: [
    'Icons accompany all colored elements',
    'Text labels explain color meanings',
    'Hover tooltips provide detailed information',
    'Help system documents all color semantics'
  ]
};

export default COLOR_GUIDE;


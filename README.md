# In-Context Learning Visualization Frontend

An interactive visualization interface for exploring **In-Context Learning (ICL)** mechanisms in transformer models, with specialized visualizations for **induction heads** - the key attention patterns that enable few-shot learning capabilities.

## 🎯 Overview

This Next.js application provides real-time, interactive visualizations of how transformer models learn from context. It connects to the ICL analysis backend via WebSocket to stream and visualize attention patterns, induction head behavior, and pattern evolution during text generation.

### Why Visualize Induction Heads?

Induction heads are fundamental to understanding how transformers:
- Recognize and complete patterns from examples
- Perform few-shot learning without fine-tuning
- Implement the "copy" mechanism that underlies ICL

## ✨ Key Features

### 🧠 Induction Head Visualizations

- **Induction Timeline**: Real-time graph showing induction score evolution during generation
- **Head Specialization View**: Identify which attention heads function as induction heads
- **Pattern Matching Visualization**: See exactly where and how patterns are recognized

### 📊 Interactive Dashboards

- **Attention Heatmaps**: Layer-by-layer, head-by-head attention visualization
- **Token Attention Flow**: Interactive network graph of attention connections
- **Pattern Strength Meters**: Real-time indicators for induction, copying, and positional patterns
- **Token Importance Analysis**: Visual breakdown of influential tokens

### 🎮 User Experience

- **Guided Onboarding Tour**: Interactive tutorial for first-time users
- **Pre-configured ICL Examples**: Quick-start patterns for common ICL tasks:
  - Translation patterns
  - Arithmetic sequences
  - Question-answering
  - Code completion
- **Real-time Generation**: Watch patterns emerge token by token
- **Step Navigation**: Replay and analyze any generation step

### 🎨 Visualization Components

1. **InductionHeadVisualizer**: Displays per-head induction scores with interactive tooltips
2. **PatternStrengthVisualizer**: Real-time gauges for different attention patterns
3. **TokenAttentionVisualizer**: Network graph powered by vis-network
4. **HeadSpecializationVisualizer**: 3D surface plot of head specialization
5. **ICLHighlightedText**: Color-coded text showing pattern matches

## 🚀 Getting Started

### Prerequisites

- Node.js 16.0+ 
- npm or yarn
- The ICL backend server running on `http://localhost:8000`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kashyaprajharsh/icl_vis_ui.git
   cd icl_vis_ui/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment (optional):**
   Create a `.env.local` file if you need to change the backend URL:
   ```
   NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws/generate
   ```

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## 🗂️ Project Structure

```
frontend/
├── src/
│   ├── app/                      # Next.js app directory
│   │   ├── page.tsx             # Main application page
│   │   ├── layout.tsx           # Root layout with metadata
│   │   └── globals.css          # Global styles
│   └── components/              # React components
│       ├── GenerationControls.tsx    # Model & prompt controls
│       ├── VisualizationPanel.tsx    # Main viz container
│       ├── InductionHeadVisualizer.tsx
│       ├── TokenAttentionVisualizer.tsx
│       ├── PatternStrengthVisualizer.tsx
│       ├── HeadSpecializationVisualizer.tsx
│       ├── ICLHighlightedText.tsx
│       ├── GenerationOutput.tsx      # Token display
│       ├── Header.tsx               # App header
│       └── OnboardingTour.tsx       # Interactive guide
├── public/                      # Static assets
├── package.json                # Dependencies & scripts
├── tsconfig.json              # TypeScript config
├── tailwind.config.js         # Tailwind CSS config
└── next.config.ts             # Next.js configuration
```

## 🔧 Key Technologies

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Plotly.js**: Scientific visualizations
- **vis-network**: Interactive network graphs
- **D3.js**: Custom data visualizations
- **Framer Motion**: Smooth animations
- **WebSocket**: Real-time backend communication

## 📱 Usage Guide

### 1. Select a Model
Choose from available Hugging Face models (default: gpt2-medium)

### 2. Enter a Prompt
Use one of the pre-configured ICL patterns or create your own:
- **Pattern**: `[example1] → [output1]\n[example2] → [output2]\n[example3] → `
- **Repetition**: `The X says Y. The X says Y. The Z says`

### 3. Generate & Analyze
- Click "Generate" to start the analysis
- Watch the induction timeline update in real-time
- Navigate through steps to see pattern evolution
- Explore different visualization tabs

### 4. Interpret Results
- **High Induction Score**: Model recognizes and uses patterns
- **Multiple Induction Heads**: Robust pattern recognition
- **Pattern Evolution**: See how patterns strengthen over tokens

## 🎯 Understanding the Visualizations

### Induction Timeline
- **X-axis**: Generation steps
- **Y-axis**: Induction score (pattern matching strength)
- **Lines**: Different metrics (induction, copying, attention)

### Attention Heatmap
- **Rows**: Query positions (where attention comes from)
- **Columns**: Key positions (where attention goes to)
- **Color**: Attention weight (darker = stronger)

### Token Network
- **Nodes**: Tokens in the sequence
- **Edges**: Attention connections above threshold
- **Edge Width**: Attention strength

## 🐛 Troubleshooting

### WebSocket Connection Failed
- Ensure the backend is running on `http://localhost:8000`
- Check for CORS issues in browser console
- Verify firewall settings

### Visualizations Not Loading
- Clear browser cache
- Check for JavaScript errors in console
- Ensure WebGL is enabled for 3D visualizations

### Performance Issues
- Reduce max generation length
- Use a smaller model
- Close other browser tabs

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Research References

This visualization tool is built to explore concepts from:

- [In-context Learning and Induction Heads](https://transformer-circuits.pub/2022/in-context-learning-and-induction-heads/index.html) - Anthropic
- [A Mathematical Framework for Transformer Circuits](https://transformer-circuits.pub/2021/framework/index.html) - Anthropic
- [Attention is All You Need](https://arxiv.org/abs/1706.03762) - Vaswani et al.

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Anthropic's mechanistic interpretability research team.
- Hugging Face for model hosting.
- The open-source ML visualization community.

import React, { useState, useEffect } from 'react';
import { FaQuestionCircle, FaTimes, FaChevronRight, FaExternalLinkAlt, FaBook, FaGraduationCap, FaRobot } from 'react-icons/fa';

interface HelpTopic {
  id: string;
  title: string;
  content: string;
  subtopics?: HelpTopic[];
  references?: Reference[];
}

interface Reference {
  title: string;
  authors?: string;
  url: string;
  type: 'paper' | 'blog' | 'documentation';
  description?: string;
}

const HELP_TOPICS: HelpTopic[] = [
  {
    id: 'overview',
    title: 'In-Context Learning Visualization Tool',
    content: 'This tool helps you understand how large language models perform in-context learning - the ability to recognize and apply patterns from context without updating model weights. Watch GPT-2 medium analyze patterns in real-time as it generates text.',
    subtopics: [
      {
        id: 'overview-icl',
        title: 'What is In-Context Learning?',
        content: 'In-context learning is when a language model learns from examples in its input without changing its weights. Examples: Q&A format ("Q: 2+2? A: 4. Q: 3+3? A: 6. Q: 4+4? A:"), JSON completion ({"name": "John", "age": 25}, {"name": "Sarah", "age": 30}, {"name": "Mike", "age":), or code patterns (def add(a,b): return a+b; def sub(a,b): return a-b; def mul(a,b):). This tool shows HOW this learning happens through attention mechanisms.'
      },
      {
        id: 'overview-mechanism',
        title: 'The Induction Head Mechanism',
        content: 'Research shows that in-context learning primarily works through "induction heads" - attention mechanisms that detect patterns like [A][B]...[A] and predict [B]. When the model sees "cat" followed by "sat", then sees "cat" again, induction heads attend back to "sat" to predict it as the next word.'
      },
      {
        id: 'overview-learning',
        title: 'What You Will Learn',
        content: 'Understand how transformers implement few-shot learning, see which attention heads specialize in pattern recognition, observe how attention flows between tokens, and identify what makes some prompts more effective for in-context learning than others.'
      }
    ],
    references: [
      {
        title: 'In-context Learning and Induction Heads',
        authors: 'Olsson, C., Elhage, N., Nanda, N., et al.',
        url: 'https://transformer-circuits.pub/2022/in-context-learning-and-induction-heads/index.html',
        type: 'paper',
        description: 'Foundational Anthropic research establishing induction heads as the primary mechanism for ICL'
      },
      {
        title: 'Understanding In-Context Learning',
        authors: 'Stanford AI Blog',
        url: 'https://ai.stanford.edu/blog/understanding-incontext/',
        type: 'blog',
        description: 'Accessible explanation of ICL mechanisms and their implications'
      },
      {
        title: 'Mathematical Analysis of In-Context Learning',
        authors: 'Wang, Y., et al.',
        url: 'https://arxiv.org/abs/2410.11474',
        type: 'paper',
        description: 'Source of the induction score formula IH₂(X_L) implemented in this tool'
      }
    ]
  },
  {
    id: 'icl-concepts',
    title: 'Core In-Context Learning Concepts',
    content: 'Understanding these fundamental concepts is essential for interpreting what you see in the visualizations. These are the building blocks of how transformers perform few-shot learning.',
    subtopics: [
      {
        id: 'concept-induction-heads',
        title: 'Induction Heads: The Pattern Recognition Mechanism',
        content: 'Induction heads are specific attention heads that implement pattern copying. Examples: ["function"]["add"] ... ["function"] → predict "add"; ["{"]["name"] ... ["{"] → predict "name"; ["Q:"]["What"] ... ["Q:"] → predict "What". They detect when the current token matches a previous token that was followed by something specific. Research has shown these are the primary mechanism enabling in-context learning in transformers.'
      },
      {
        id: 'concept-copying-vs-induction',
        title: 'Copying vs. Pattern Matching',
        content: 'Copying behavior: exact repetition ("Paris is the capital of France. London is the capital of England. Paris is the capital of France."). Pattern matching: structural generalization ("English: hello, French: bonjour. English: goodbye, French: au revoir. English: thank you, French: [merci]"). Advanced induction: JSON completion ({"users": [{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}, {"id": 3, "name": ["Charlie"]}]). Induction heads enable both - copying when patterns are exact, generalization when patterns are structural.'
      },
      {
        id: 'concept-attention-patterns',
        title: 'Attention Patterns in ICL',
        content: 'Attention determines which previous tokens influence the current prediction. ICL examples: Code completion (def calculate(x): return x*2; def process(y): return y*2; def transform(z): → attends to "return z*"), API patterns (GET /users/1 → {id: 1}; GET /users/2 → {id: 2}; GET /users/3 → attends to "{id: 3}"), Translation (en: cat, fr: chat; en: dog, fr: chien; en: bird, fr: → attends to "oiseau"). This attention flow enables pattern transfer between similar contexts.'
      },
      {
        id: 'concept-sequence-analysis',
        title: 'Token-by-Token Analysis',
        content: 'ICL happens incrementally as the model processes each token. Early tokens establish context, middle tokens form patterns, later tokens benefit from learned patterns. The tool shows this progression: watch how induction scores change as more context becomes available and patterns become clearer.'
      },
      {
        id: 'concept-mathematical-foundation',
        title: 'Mathematical Foundation',
        content: 'The tool implements the induction score formula: IH₂(X_L) = Σ attention_weights where X_L is the current token and we sum attention from current position to all positions that complete detected [A][B]...[A] patterns. Higher scores indicate stronger reliance on pattern-based prediction rather than random guessing.'
      },
      {
        id: 'concept-two-head-circuit',
        title: 'The Two-Head Circuit: How ICL Actually Works',
        content: 'Research has discovered that in-context learning requires TWO types of attention heads working together in sequence - like a relay race where one head passes information to another.\n\n**Stage 1: Previous-Token Heads (The "Shifters")**\nThese heads create shifted representations by attending from position i to position i-1. Example: When processing "Berlin", they attend back to "Germany". This creates a "memory pointer" that links tokens together.\n\n**Stage 2: Induction Heads (The "Matchers")**\nThese heads use the shifted representations to match patterns. When they see "Italy" (similar context to "Germany"), they use the previous-token head\'s pointer to find and copy "Rome" (similar to how "Berlin" followed "Germany").\n\n**Why Both Are Needed:**\nWithout previous-token heads, induction heads can\'t access the shifted representations needed for pattern matching. Without induction heads, there\'s no pattern recognition. Both components working together enable true in-context learning.\n\n**The Circuit Badge:**\nThe green "STRONG" badge in your timeline shows both components are active and working together. The checkmarks (✅ 9 Prev-Token • ✅ 102 Induction) confirm both stages are present. The score quantifies how strongly they\'re operating. Click "Show Details" to see individual head performance and the circuit flow diagram.'
      },
    ],
    references: [
      {
        title: 'In-context Learning and Induction Heads',
        authors: 'Olsson, C., Elhage, N., Nanda, N., et al.',
        url: 'https://transformer-circuits.pub/2022/in-context-learning-and-induction-heads/index.html',
        type: 'paper',
        description: 'Comprehensive analysis of induction head mechanisms and their role in ICL'
      },
      {
        title: 'Mathematical Analysis of In-Context Learning',
        authors: 'Wang, Y., et al.',
        url: 'https://arxiv.org/abs/2410.11474',
        type: 'paper',
        description: 'Mathematical framework for induction score calculation used in this tool'
      },
      {
        title: 'Transformer Circuits Framework',
        authors: 'Elhage, N., et al.',
        url: 'https://transformer-circuits.pub/2021/framework/index.html',
        type: 'paper',
        description: 'Mathematical framework for understanding transformer attention mechanisms'
      }
    ]
  },
  {
    id: 'quick-start',
    title: '🚀 Quick Start Guide',
    content: 'New to this tool? Start here for a 2-minute introduction to analyzing in-context learning.',
    subtopics: [
      {
        id: 'quick-first-steps',
        title: 'Your First Analysis (30 seconds)',
        content: '1. **Use a sample prompt** from the dropdown (try "Question Answering")\n2. **Click the blue "Generate" button** (left panel)\n3. **Watch the blue line spike** on the Induction Timeline - those spikes show the AI learning!\n4. **Look for the green badge** at the top - "STRONG" means ICL is working\n\nThat\'s it! You\'ve just watched AI learn a pattern in real-time.'
      },
      {
        id: 'quick-interpret',
        title: 'Reading Your Results (1 minute)',
        content: '**Good ICL looks like:**\n✅ Green "STRONG" circuit badge\n✅ Blue line spikes above 20 on the timeline\n✅ Colored tokens in the output (purple = pattern prediction)\n✅ Multiple "Key Learning Moments" below the graph\n\n**Weak ICL looks like:**\n⚠️ Gray or Orange circuit badge\n⚠️ Flat timeline with scores under 10\n⚠️ Few or no colored tokens\n⚠️ No breakthrough moments\n\n**What to do next:** Try the "ICL Guide Demo" button (top right) for an automated tour of all features!'
      },
      {
        id: 'quick-workflow',
        title: 'Recommended Workflow',
        content: '1. **Start with Induction Timeline** - Quick overview of ICL strength\n2. **Check the Circuit Badge** - Confirms both components working\n3. **Explore colored output** - See which tokens used patterns\n4. **Try Attention Heatmap** - Understand connections between words\n5. **Compare different prompts** - Learn what makes good ICL!\n\nPro tip: Use the "Quick Tour" button (top right) for an interactive walkthrough.'
      },
      {
        id: 'quick-best-prompts',
        title: 'What Makes a Good Prompt?',
        content: '**Strong ICL prompts have:**\n✅ Clear, repetitive structure\n✅ 2-3+ examples of the same pattern\n✅ Consistent format throughout\n✅ Simple, learnable relationships\n\n**Examples:**\n🟢 Good: "Q: 2+2? A: 4. Q: 3+3? A: 6. Q: 4+4? A:"\n🔴 Bad: "What is 2+2? The answer is 4. 3+3 equals 6. Calculate 4+4:"\n\nConsistency is key - the AI learns better from predictable patterns!'
      }
    ]
  },
  {
    id: 'measurements',
    title: 'Understanding the Measurements',
    content: 'The tool provides quantitative metrics to measure in-context learning performance. These metrics help you understand when and how strongly ICL is occurring.',
    subtopics: [
      {
        id: 'measure-induction-score',
        title: 'Induction Score: Measuring Pattern-Based Prediction',
        content: 'This is the primary ICL metric. It quantifies how much the model relies on induction patterns versus random guessing. Score calculation: sum of attention weights from current position to all tokens that complete [A][B]...[A] patterns. Values 0-5: weak ICL, 5-20: moderate ICL, 20+: strong ICL with clear pattern recognition.'
      },
      {
        id: 'measure-induction-heads',
        title: 'Active Induction Heads: Specialization Analysis',
        content: 'Counts how many attention heads are actively performing induction at each step. More active heads indicates more robust and distributed pattern recognition. Helps identify whether ICL relies on few specialized heads or many generalized ones. Critical for understanding model reliability and failure modes.'
      },
      {
        id: 'measure-copying-score',
        title: 'Copying Score: Direct Repetition vs. Generalization',
        content: 'Measures verbatim copying behavior - when the model exactly repeats previous sequences. Helps distinguish between two ICL modes: mechanical copying ("the cat sat on the mat. the cat sat on the mat") versus intelligent generalization (learning Q&A format to answer new questions). Balance between copying and induction reveals learning sophistication.'
      },
      {
        id: 'measure-attention-analysis',
        title: 'Attention Flow Analysis: Information Routing',
        content: 'Analyzes how attention is distributed across the sequence. Entropy measures attention focus (low entropy = focused, high entropy = scattered). Sparsity indicates selective attention. These metrics reveal whether ICL involves targeted information retrieval or diffuse context integration - crucial for understanding ICL efficiency.'
      },
    ]
  },
  {
    id: 'visualization-tabs',
    title: 'Analysis Views: Six Perspectives on ICL',
    content: 'Each visualization tab provides a different analytical lens for understanding in-context learning. Use these views together to build a complete picture of how the model processes patterns.',
    subtopics: [
      {
        id: 'tab-induction-timeline',
        title: '📈 Induction Timeline: Tracking Learning Dynamics',
        content: 'Shows ICL strength evolution during generation. Blue line = induction score (pattern-based prediction strength), pink line = number of active induction heads. Spikes indicate moments when the model discovers or applies patterns. Use this to identify when ICL occurs and measure its intensity. Essential for understanding ICL temporal dynamics.'
      },
      {
        id: 'tab-attention-heatmap',
        title: '🔥 Attention Heatmap: Visualizing Information Flow',
        content: 'Matrix visualization of token-to-token attention weights. Bright cells show strong attention connections. Look for patterns: diagonal attention (local context), off-diagonal patterns (long-range dependencies), block structures (repeated patterns). Critical for understanding which tokens influence current predictions and how induction heads route information.'
      },
      {
        id: 'tab-attention-graph',
        title: '🕸️ Attention Graph: Network Analysis of Context',
        content: 'Network representation where nodes are tokens and edges are attention weights. Reveals attention topology: which tokens are attention "hubs" receiving many connections, which create "bridges" between distant concepts. Helps identify key tokens that enable ICL and understand attention flow patterns critical for pattern transfer.'
      },
      {
        id: 'tab-strategy-timeline',
        title: '📊 Strategy Timeline: ICL Mechanism Analysis',
        content: 'Compares three ICL strategies over time: induction (pattern-based), copying (exact repetition), previous-token attention (local context). Shows how the model balances different approaches. High induction indicates sophisticated pattern recognition; high copying suggests mechanical repetition. Use to understand ICL sophistication level.'
      },
      {
        id: 'tab-token-importance',
        title: '⭐ Token Importance: Context Contribution Analysis',
        content: 'Quantifies each token\'s role in ICL: incoming attention (how much others attend to this token), outgoing attention (how much this token attends elsewhere), attention entropy (selectivity). Identifies which tokens provide essential context, which gather information, and which serve as pattern anchors for induction heads.'
      },
      {
        id: 'tab-induction-heads',
        title: '🧠 Induction Heads: Specialization and Distribution',
        content: 'Lists attention heads ranked by induction activity. Shows which layers and heads specialize in pattern recognition. Multiple active heads indicate robust, distributed ICL; few active heads suggest brittle, specialized ICL. Essential for understanding model architecture\'s role in ICL and identifying potential failure points.'
      }
    ]
  },
  {
    id: 'icl-guided-tour',
    title: '🎬 ICL Guided Tour',
    content: 'The ICL Guided Tour is an automated demonstration system that showcases all tool features by running through them systematically. Perfect for first-time users and demonstrations.',
    subtopics: [
      {
        id: 'tour-overview',
        title: 'Tour Overview',
        content: 'The guided tour acts as your personal ICL assistant, automatically generating sample text, switching between visualization tabs, and explaining each feature in real-time. Total duration: ~18-20 seconds of fast-paced demonstration.'
      },
      {
        id: 'tour-features',
        title: 'Tour Features',
        content: 'Automated navigation between all tabs, professional spotlight highlighting, real-time explanations, interactive controls (play/pause/stop), speed adjustment (1x, 1.5x, 2x), step navigation, and mobile-responsive design.'
      },
      {
        id: 'tour-structure',
        title: 'Tour Structure',
        content: 'Welcome (0.5s) → Generate Q&A Pattern (1s) → Processing (0.5s) → Learning Timeline (2s) → Attention Heatmap (2s) → Network Graph (2s) → Induction Heads (2s) → Token Importance (2s) → Strategy Timeline (2s) → Conclusion (2s)'
      },
      {
        id: 'tour-usage',
        title: 'How to Use',
        content: 'Click the "ICL Guide Demo" button (purple gradient with robot icon) in the header. The tour control panel appears in the top-right with all controls. Click "Start Tour" to begin the automated demonstration. Use pause/resume, speed controls, and step navigation as needed.'
      }
    ]
  },
  {
    id: 'getting-started',
    title: 'ICL Research Workflow',
    content: 'How to systematically analyze in-context learning using this tool. Follow this workflow to conduct meaningful ICL experiments and understand model behavior.',
    subtopics: [
      {
        id: 'start-experimental-design',
        title: 'Step 1: Design Your ICL Experiment',
        content: 'Choose prompts with clear patterns: \n\n**Programming patterns**: "function add(a,b) { return a+b; } function sub(a,b) { return a-b; } function mul(a,b) {" \n\n**Data patterns**: "{\"name\": \"Alice\", \"age\": 25}, {\"name\": \"Bob\", \"age\": 30}, {\"name\": \"Carol\", \"age\":" \n\n**Language patterns**: "English: hello → Spanish: hola; English: goodbye → Spanish: adiós; English: thank you → Spanish:" \n\n**Math patterns**: "Input: 2+3, Output: 5; Input: 7+1, Output: 8; Input: 4+6, Output:" \n\nThe model needs 2+ pattern instances to demonstrate induction. Document your hypothesis about expected ICL behavior.'
      },
      {
        id: 'start-analysis-workflow',
        title: 'Step 2: Systematic Analysis Sequence',
        content: 'Start with Timeline tab (overall ICL strength trends) → Induction Heads tab (which mechanisms are active) → Heatmap tab (attention patterns) → Strategy Timeline (mechanism balance). Use this sequence to build understanding from macro (overall ICL) to micro (specific mechanisms).'
      },
      {
        id: 'start-pattern-identification',
        title: 'Step 3: Interpreting ICL Patterns',
        content: 'Strong ICL indicators: induction scores >20, multiple active heads (>5), clear attention patterns in heatmap connecting similar contexts, high induction vs copying ratio. \n\n**Score ranges by pattern type**: Simple repetition (5-15), Q&A pairs (15-30), JSON completion (10-25), Code patterns (15-35), Translation (10-20), Random text (0-5). \n\n**Weak ICL signs**: Flat timeline, few active heads (<3), random attention patterns, high copying scores (>80% of total), scattered attention without clear structure. Use these benchmarks to evaluate ICL success and compare different prompt strategies.'
      },
      {
        id: 'start-comparative-analysis',
        title: 'Step 4: Comparative Analysis',
        content: 'Test multiple prompt formats: vary example count (2 vs 4 vs 6 examples), change pattern complexity (simple repetition vs abstract rules), modify context structure (structured vs unstructured). Compare induction scores and head activation patterns to understand what enables effective ICL.'
      }
    ]
  },
  {
    id: 'color-guide',
    title: '🎨 Color Guide - Understanding Visual Indicators',
    content: 'Colors in this tool are semantically meaningful and consistent across all visualizations. Each color represents a specific ICL concept or behavior.',
    subtopics: [
      {
        id: 'color-primary',
        title: 'Primary ICL Colors',
        content: '🟣 **Purple = Induction/Pattern Recognition**: Model predicting using recognized patterns [A][B]...[A]→[B]. Used for: induction target tokens, strong circuit badges, pattern indicators.\n\n🔵 **Blue/Cyan = Copying/Attention**: Model copying or attending to specific tokens. Used for: copying source tokens, induction score line, attention heatmap, network edges.\n\n🟢 **Green = High Attention/Important Context**: Token receiving high attention from others. Used for: important context markers, strong circuit status, success states.\n\n🟡 **Yellow = Attention Source/Scanning**: Token actively attending to others to gather information. Used for: scanning tokens, sustained learning markers, partial circuit status.'
      },
      {
        id: 'color-intensity',
        title: 'Activity Intensity Colors',
        content: '🔴 **Red = Breakthrough Moments**: Major pattern recognition breakthroughs. Peak learning moments on timeline where induction score spikes dramatically.\n\n🟠 **Orange = Weak/Partial Activity**: Weak or partial pattern recognition. Used for: weak circuit badges, moderate induction activity, warning states.\n\n🩷 **Pink = Induction Head Count**: Number of attention heads actively performing induction at each step (secondary metric on timeline).'
      },
      {
        id: 'color-components',
        title: 'Color Usage By Component',
        content: '**Highlighted Text (Output Panel)**: Purple=induction target, Blue=copying source, Green=high attention, Yellow=attention source. Hover for details!\n\n**Timeline Graph**: Cyan line=induction score, Pink dots=head count, Red markers=breakthroughs, Yellow background=sustained activity.\n\n**Circuit Badges**: Green=STRONG, Yellow=PARTIAL, Orange=WEAK, Gray=NONE.\n\n**Heatmap**: Lighter/brighter colors = stronger attention (description adapts to selected color scale).\n\n**Network Graph**: Cyan edges = attention connections, node colors = importance gradient (red=high, blue=low).'
      },
      {
        id: 'color-consistency',
        title: 'Color Consistency Rules',
        content: '✅ **Purple always means induction** across all views\n✅ **Blue/Cyan always means copying or attention** flow\n✅ **Green always means high importance** or strong status\n✅ **Yellow always means scanning** or moderate activity\n✅ **Red always means breakthrough** or very strong activity\n\n**Accessibility**: All colors maintain WCAG AA contrast ratios. Color is never the only indicator - we also use icons, text labels, and tooltips.'
      }
    ]
  },
  {
    id: 'research-applications',
    title: 'Research Applications and Use Cases',
    content: 'This tool enables systematic study of in-context learning mechanisms. Use it to investigate ICL phenomena, validate theoretical predictions, and develop better few-shot learning strategies.',
    subtopics: [
      {
        id: 'research-mechanistic',
        title: 'Mechanistic Understanding of ICL',
        content: 'Investigate how induction heads implement pattern recognition: Which layers specialize in pattern detection? How does attention flow enable pattern transfer? What makes some patterns easier to learn than others? Use head activation patterns and attention flows to understand the computational mechanisms underlying few-shot learning.'
      },
      {
        id: 'research-prompt-engineering',
        title: 'Systematic Prompt Engineering',
        content: 'Optimize few-shot prompts using quantitative ICL metrics: \n\n**Test different structures**: \n- Explicit labels: "Example 1: input → output; Example 2: input → output" \n- Implicit patterns: "apple → fruit; car → vehicle; dog →" \n- Mixed formats: "Q: What is the capital of France? A: Paris\\nQ: What is the capital of Germany? A: Berlin\\nQ: What is the capital of Italy? A:" \n\n**Vary complexity**: \n- Simple: "1+1=2, 2+2=4, 3+3=" \n- Structured: "{\"operation\": \"add\", \"a\": 1, \"b\": 1, \"result\": 2}, {\"operation\": \"add\", \"a\": 2, \"b\": 2, \"result\": 4}" \n- Abstract: "If sunny then beach, if rainy then home, if snowy then" \n\nUse induction scores to objectively measure prompt effectiveness and identify optimal structural features.'
      },
      {
        id: 'research-failure-analysis',
        title: 'ICL Failure Mode Analysis',
        content: 'Study when and why ICL fails: \\n\\n**Common failure patterns**: \\n- Inconsistent structure: \"Q: 2+2? A: 4. Question: What is 3+3? Answer: 6\" (mixed formats) \\n- Conflicting examples: \"big → small; large → tiny; huge → massive\" (inconsistent relationships) \\n- Insufficient context: \"cat → animal\" (single example, no pattern) \\n- Noisy patterns: \"a→1, b→2, xyz→999, c→3\" (disrupted sequence) \\n\\n**Analysis approach**: Identify contexts where induction heads remain inactive (<3 active heads), analyze attention patterns during poor performance (scattered, unfocused), understand copying vs. generalization trade-offs (>70% copying indicates failure to generalize). Use these insights to predict ICL reliability and develop robust few-shot strategies.'
      }
    ]
  }
];

interface HelpSystemProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab?: string;
}

const HelpSystem: React.FC<HelpSystemProps> = ({ isOpen, onClose, currentTab }) => {
  // Map current tab to relevant help topic
  const getRelevantTopicId = (tabId?: string): string | null => {
    const tabToTopicMap: { [key: string]: string } = {
      'induction-timeline': 'tab-induction-timeline',
      'attention-heatmap': 'tab-attention-heatmap',
      'attention-graph': 'tab-attention-graph',
      'strategy-timeline': 'tab-strategy-timeline',
      'token-importance': 'tab-token-importance',
      'induction': 'tab-induction-heads'
    };
    return tabId ? tabToTopicMap[tabId] || null : null;
  };
  
  const relevantTopicId = getRelevantTopicId(currentTab);
  
  // Auto-scroll to relevant section when help opens
  useEffect(() => {
    if (isOpen && relevantTopicId) {
      // Small delay to ensure the modal is fully rendered
      setTimeout(() => {
        const element = document.getElementById(relevantTopicId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [isOpen, relevantTopicId]);
  
  if (!isOpen) return null;

  const getIconForReferenceType = (type: 'paper' | 'blog' | 'documentation') => {
    switch (type) {
      case 'paper': return <FaGraduationCap className="text-blue-400" />;
      case 'blog': return <FaBook className="text-green-400" />;
      case 'documentation': return <FaQuestionCircle className="text-purple-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <FaBook className="text-purple-400 text-2xl" />
            <div>
              <h2 className="text-2xl font-bold text-white">In-Context Learning Research Documentation</h2>
              <p className="text-gray-400 text-sm">Comprehensive guide to ICL visualization and analysis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Context Banner */}
          {currentTab && relevantTopicId && (
            <div className="max-w-4xl mx-auto mb-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👁️</span>
                <div>
                  <p className="text-white font-semibold">Context-Aware Help</p>
                  <p className="text-sm text-gray-300">Showing information relevant to your current tab. Scroll down to see the highlighted section.</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="max-w-4xl mx-auto space-y-12">
            {HELP_TOPICS.map((topic, topicIndex) => (
              <section key={topic.id} className="space-y-6">
                {/* Topic Header */}
                <div className="border-l-4 border-blue-500 pl-6">
                  <h1 className="text-3xl font-bold text-white mb-4">
                    {topicIndex + 1}. {topic.title}
                  </h1>
                  <div className="prose prose-invert prose-lg max-w-none">
                    <p className="text-gray-300 leading-relaxed text-lg">{topic.content}</p>
                  </div>
                </div>

                {/* Subtopics */}
                {topic.subtopics && topic.subtopics.length > 0 && (
                  <div className="ml-6 space-y-6">
                    {topic.subtopics.map((subtopic, subtopicIndex) => {
                      const isRelevant = subtopic.id === relevantTopicId;
                      return (
                        <div 
                          key={subtopic.id} 
                          id={subtopic.id}
                          className={`rounded-lg p-6 transition-all duration-300 ${
                            isRelevant 
                              ? 'bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-2 border-blue-500 shadow-lg shadow-blue-500/20' 
                              : 'bg-gray-800/30 border border-gray-700'
                          }`}
                        >
                          <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              isRelevant ? 'bg-blue-500 animate-pulse-subtle' : 'bg-blue-600'
                            }`}>
                              {topicIndex + 1}.{subtopicIndex + 1}
                            </span>
                            {subtopic.title}
                            {isRelevant && (
                              <span className="ml-2 px-3 py-1 bg-blue-500/30 text-blue-300 text-xs rounded-full border border-blue-500/50">
                                📍 Current Tab
                              </span>
                            )}
                          </h3>
                          <div className="prose prose-invert max-w-none">
                            <p className="text-gray-300 leading-relaxed">{subtopic.content}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* References */}
                {topic.references && topic.references.length > 0 && (
                  <div className="ml-6 space-y-4">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                      <FaGraduationCap className="text-blue-400" />
                      Research References
                    </h3>
                    <div className="space-y-4">
                      {topic.references.map((ref, index) => (
                        <div key={index} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-blue-500/50 transition-colors">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 p-2 bg-gray-700/50 rounded-lg">
                              {getIconForReferenceType(ref.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <div>
                                  <h4 className="text-white font-medium mb-1">{ref.title}</h4>
                                  {ref.authors && (
                                    <p className="text-blue-300 text-sm mb-2">{ref.authors}</p>
                                  )}
                                </div>
                                <a
                                  href={ref.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-2 rounded-md transition-colors whitespace-nowrap"
                                >
                                  <FaExternalLinkAlt size={12} />
                                  {ref.type === 'paper' ? 'Read Paper' : ref.type === 'blog' ? 'Read Article' : 'View Docs'}
                                </a>
                              </div>
                              {ref.description && (
                                <p className="text-gray-300 text-sm leading-relaxed">{ref.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Separator between topics */}
                {topicIndex < HELP_TOPICS.length - 1 && (
                  <hr className="border-gray-700 my-8" />
                )}
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSystem;

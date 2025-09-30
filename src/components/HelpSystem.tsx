import React, { useState } from 'react';
import { FaQuestionCircle, FaTimes, FaChevronRight, FaExternalLinkAlt, FaBook, FaGraduationCap } from 'react-icons/fa';

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
    title: 'In-Context Learning Visualization Dashboard',
    content: 'This dashboard provides real-time visualization of In-Context Learning (ICL) mechanisms in GPT-2 models during text generation, focusing on induction heads and pattern recognition behavior. Built on groundbreaking research from Anthropic and leading AI institutions.',
    subtopics: [
      {
        id: 'overview-purpose',
        title: 'Purpose & Research Foundation',
        content: 'This tool reveals how transformer models learn patterns during inference without any training updates. It implements cutting-edge research from Anthropic\'s "Induction Heads" paper, Stanford\'s ICL analysis, and recent mathematical frameworks to make the "invisible" learning process visible and measurable.'
      },
      {
        id: 'overview-features',
        title: 'Key Features',
        content: 'Real-time induction head analysis, copying mechanism detection, attention pattern visualization, token importance analysis, ICL strength measurement with color-coded text highlighting, and automated guided tour system.'
      },
      {
        id: 'overview-theory',
        title: 'Theoretical Foundation',
        content: 'Based on the discovery that induction heads constitute the primary mechanism for in-context learning in transformer models. Research shows these circuits implement "fuzzy" pattern completion, completing [A*][B*] ... [A] → [B] where A* ≈ A and B* ≈ B are similar in embedding space.'
      }
    ],
    references: [
      {
        title: 'In-context Learning and Induction Heads',
        authors: 'Olsson, C., Elhage, N., Nanda, N., et al.',
        url: 'https://transformer-circuits.pub/2022/in-context-learning-and-induction-heads/index.html',
        type: 'paper',
        description: 'Foundational research establishing induction heads as the primary mechanism for ICL'
      },
      {
        title: 'Understanding In-Context Learning',
        authors: 'Stanford AI Blog',
        url: 'https://ai.stanford.edu/blog/understanding-incontext/',
        type: 'blog',
        description: 'Accessible explanation of ICL mechanisms and their implications'
      }
    ]
  },
  {
    id: 'key-concepts',
    title: 'Key Concepts & Theory',
    content: 'Understanding these fundamental concepts from transformer circuits research will help you interpret the visualizations. These concepts are backed by rigorous mathematical analysis and empirical evidence.',
    subtopics: [
      {
        id: 'concept-induction-heads',
        title: 'Induction Heads',
        content: 'Induction heads are circuits that look back over the sequence for previous instances of the current token (A), find the token that came after it (B), and predict that the same completion will occur again ([A][B] ... [A] → [B]). They implement pattern copying behavior and are the primary source of in-context learning. Mechanistically implemented by two attention heads: a "previous token head" and an "induction head".'
      },
      {
        id: 'concept-icl',
        title: 'In-Context Learning',
        content: 'In-context learning is the model\'s ability to adapt its predictions based on patterns in the input context without parameter updates. Research provides six lines of evidence that induction heads constitute the mechanism for the majority of ICL in transformer models, including co-occurrence, co-perturbation, and direct ablation studies.'
      },
      {
        id: 'concept-fuzzy-matching',
        title: 'Fuzzy Pattern Completion',
        content: 'Induction heads perform "fuzzy" or "nearest neighbor" pattern completion, completing [A*][B*] ... [A] → [B], where A* ≈ A and B* ≈ B are similar in embedding space. This allows for abstract pattern recognition beyond exact matches, enabling generalization to translation, code completion, and complex reasoning tasks.'
      },
      {
        id: 'concept-phase-change',
        title: 'Phase Change Phenomenon',
        content: 'Models undergo a dramatic "phase change" early in training where ICL abilities emerge suddenly. During this phase, induction heads form and ICL performance improves dramatically. This phase change is visible as a bump in the training loss and occurs consistently across model sizes.'
      },
      {
        id: 'concept-mathematical-framework',
        title: 'Mathematical Framework',
        content: 'ICL strength is measured using attention pattern analysis: Induction_Score = Σ A[i,j] × Pattern_Match[i,j]. Token importance combines incoming attention, outgoing attention, and attention entropy. Pattern evolution tracks induction, copying, and previous-token strengths over time.'
      }
    ],
    references: [
      {
        title: 'Mathematical Framework for ICL Analysis',
        authors: 'arXiv:2410.11474',
        url: 'https://arxiv.org/pdf/2410.11474',
        type: 'paper',
        description: 'Advanced mathematical formulations for measuring ICL capabilities'
      },
      {
        title: 'ICL Analysis Methodology',
        authors: 'arXiv:2407.07011', 
        url: 'https://arxiv.org/pdf/2407.07011',
        type: 'paper',
        description: 'Comprehensive analysis techniques for understanding ICL behavior'
      }
    ]
  },
  {
    id: 'circuit-mechanics',
    title: 'Circuit Mechanics',
    content: 'Understanding how induction heads work mechanically in the model.',
    subtopics: [
      {
        id: 'mechanics-implementation',
        title: 'Implementation',
        content: 'Induction heads are implemented by a circuit of two attention heads: a "previous token head" which copies information from the previous token into the next token, and an "induction head" which uses that information to find tokens preceded by the present token.'
      },
      {
        id: 'mechanics-attention',
        title: 'Attention Patterns',
        content: 'The visualization shows attention patterns that reveal how induction heads operate: looking back for similar contexts and using them to predict the next token.'
      }
    ]
  },
  {
    id: 'measurements',
    title: 'Understanding Measurements',
    content: 'The dashboard provides various real-time measurements to analyze ICL behavior during text generation.',
    subtopics: [
      {
        id: 'measure-induction',
        title: 'Induction Score',
        content: 'Measures pattern completion strength using the Wang et al. formula. High scores (20+) indicate strong ICL. This is the total attention weight from current tokens to positions that followed similar previous patterns.'
      },
      {
        id: 'measure-copying',
        title: 'Copying Score',
        content: 'Measures direct token copying behavior - how much the model attends to previous identical tokens. Complements induction by showing when the model reuses exact content rather than learning abstract patterns.'
      },
      {
        id: 'measure-attention-stats',
        title: 'Attention Statistics',
        content: 'Entropy (focus level), Sparsity (concentration), and Max Attention (strongest connection). These reveal how the model allocates attention and whether it\'s learning efficiently.'
      },
      {
        id: 'measure-token-importance',
        title: 'Token Importance',
        content: 'Each token shows Incoming Attention (how important it is to others), Outgoing Attention (how much it looks around), and Attention Entropy (how focused it is). Visible in token hover tooltips.'
      }
    ]
  },
  {
    id: 'visualization-tabs',
    title: 'Visualization Tabs Explained',
    content: 'The dashboard has 6 different tabs, each showing a unique perspective on how the model processes and learns from context.',
    subtopics: [
      {
        id: 'tab-induction-timeline',
        title: '📈 Induction Timeline',
        content: 'Shows ICL strength over time as the model generates text. Blue line = induction score, Pink line = number of active induction heads. Spikes indicate "aha!" moments where the model recognizes patterns. This is usually the most important tab to watch!'
      },
      {
        id: 'tab-attention-heatmap',
        title: '🔥 Attention Heatmap',
        content: 'Color-coded matrix showing which tokens attend to which. Bright yellow/white = strong attention, Dark blue = weak attention. Look for off-diagonal bright spots connecting similar words - that\'s induction! You can select different layers to explore.'
      },
      {
        id: 'tab-attention-graph',
        title: '🕸️ Attention Graph',
        content: 'Network visualization showing attention as arrows between tokens. Thicker arrows = stronger attention. Node colors progress from blue (early tokens) to purple (recent tokens). Great for seeing the overall attention flow pattern.'
      },
      {
        id: 'tab-strategy-timeline',
        title: '📊 Strategy Timeline',
        content: 'Shows how the model balances different learning strategies over time. Purple = Induction (pattern learning), Blue = Copying (exact reuse), Green = Previous Token attention. Watch how strategies shift during generation!'
      },
      {
        id: 'tab-token-importance',
        title: '⭐ Token Importance',
        content: 'Bar charts showing each token\'s role: Incoming Attention (how important others find this token), Outgoing Attention (how much this token looks around), Attention Entropy (how focused it is). Helps identify key tokens in the sequence.'
      },
      {
        id: 'tab-induction-heads',
        title: '🧠 Induction Heads',
        content: 'Lists all attention heads ranked by induction strength. Each bar shows a specific layer.head (like L12H8) and its induction score. Multiple strong heads = robust pattern recognition. This shows which parts of the model are doing the learning!'
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
    title: 'Getting Started Guide',
    content: 'Learn how to use the dashboard effectively to analyze in-context learning behavior. Start with the ICL Guided Tour for an automated introduction.',
    subtopics: [
      {
        id: 'start-basic-usage',
        title: 'Basic Usage',
        content: '1) Try the ICL Guided Tour first (purple button in header), 2) Enter a prompt with patterns (like Q&A examples), 3) Click Generate, 4) Watch the timeline for learning spikes, 5) Examine color-coded tokens, 6) Check the induction score - higher means better pattern learning.'
      },
      {
        id: 'start-tab-workflow',
        title: 'Recommended Tab Workflow',
        content: 'Start with "Induction Timeline" (shows overall learning), then "Attention Heatmap" (see the patterns), then "Induction Heads" (which parts of model are active). Advanced: "Strategy Timeline" (learning strategies), "Attention Graph" (network view), "Token Importance" (detailed analysis).'
      },
      {
        id: 'start-good-prompts',
        title: 'Good Test Prompts',
        content: 'Question-Answer pairs (Q: What is 2+2? A: 4. Q: What is 3+3? A: 6. Q: What is 4+4? A:), translation examples, code completion patterns, or any text with repeating structures. The model needs to see a pattern at least twice to demonstrate induction behavior.'
      },
      {
        id: 'start-troubleshooting',
        title: 'Common Issues',
        content: 'Low scores? Try prompts with clearer patterns. No color highlighting? The model may not be recognizing patterns - try more explicit examples. WebSocket disconnected? Check that the backend server is running. Tour not working? Refresh and try again.'
      },
      {
        id: 'start-quick-reference',
        title: 'Quick Tab Reference',
        content: '📈 Timeline = Overall ICL strength | 🔥 Heatmap = Which tokens connect | 🕸️ Graph = Attention flow network | 📊 Strategy = Learning approaches | ⭐ Importance = Token roles | 🧠 Heads = Active model parts'
      }
    ]
  },
  {
    id: 'research-applications',
    title: '🔬 Research Applications',
    content: 'This tool serves multiple research purposes, from educational demonstrations to cutting-edge mechanistic interpretability research.',
    subtopics: [
      {
        id: 'research-educational',
        title: 'Educational Applications',
        content: 'Teaching ICL concepts through visual demonstration, exploring mechanistic interpretability hands-on, understanding when and why models succeed/fail, and testing which patterns are most learnable by different architectures.'
      },
      {
        id: 'research-scientific',
        title: 'Research Applications',
        content: 'Hypothesis testing for ICL theories, model comparison across architectures, studying training dynamics and emergence of ICL abilities, safety research on failure modes and limitations, and validation of theoretical predictions.'
      },
      {
        id: 'research-practical',
        title: 'Practical Applications',
        content: 'Prompt engineering for more effective few-shot learning, model selection based on ICL capabilities, performance debugging when prompts fail, capability assessment for specific tasks, and optimization of in-context learning strategies.'
      }
    ],
    references: [
      {
        title: 'Transformer Circuits Framework',
        authors: 'Elhage, N., et al.',
        url: 'https://transformer-circuits.pub/2021/framework/index.html',
        type: 'paper',
        description: 'Mathematical framework for decomposing transformer operations and understanding attention circuits'
      }
    ]
  }
];

interface HelpSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpSystem: React.FC<HelpSystemProps> = ({ isOpen, onClose }) => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentTopic = HELP_TOPICS.find(topic => topic.id === selectedTopic);
  const currentSubtopic = currentTopic?.subtopics?.find(subtopic => subtopic.id === selectedSubtopic);

  const getIconForReferenceType = (type: 'paper' | 'blog' | 'documentation') => {
    switch (type) {
      case 'paper': return <FaGraduationCap className="text-blue-400" />;
      case 'blog': return <FaBook className="text-green-400" />;
      case 'documentation': return <FaQuestionCircle className="text-purple-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex">
        {/* Topics Sidebar */}
        <div className="w-64 border-r border-gray-700 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaBook className="text-purple-400" />
              Documentation
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes size={20} />
            </button>
          </div>
          <nav>
            {HELP_TOPICS.map(topic => (
              <div key={topic.id} className="mb-2">
                <button
                  onClick={() => {
                    setSelectedTopic(topic.id);
                    setSelectedSubtopic(null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md flex items-center justify-between ${
                    selectedTopic === topic.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  {topic.title}
                  {topic.subtopics && <FaChevronRight size={12} />}
                </button>
                {selectedTopic === topic.id && topic.subtopics && (
                  <div className="ml-4 mt-1 space-y-1">
                    {topic.subtopics.map(subtopic => (
                      <button
                        key={subtopic.id}
                        onClick={() => setSelectedSubtopic(subtopic.id)}
                        className={`w-full text-left px-3 py-1.5 rounded-md ${
                          selectedSubtopic === subtopic.id
                            ? 'bg-blue-500/30 text-blue-300'
                            : 'text-gray-400 hover:bg-gray-800'
                        }`}
                      >
                        {subtopic.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {currentTopic && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">{currentTopic.title}</h2>
              <p className="text-gray-300 mb-6 leading-relaxed">{currentTopic.content}</p>
              
              {currentSubtopic && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-white mb-3">{currentSubtopic.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{currentSubtopic.content}</p>
                </div>
              )}

              {/* References Section */}
              {currentTopic.references && currentTopic.references.length > 0 && (
                <div className="mt-8 border-t border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FaBook className="text-blue-400" />
                    Research References & Further Reading
                  </h3>
                  <div className="space-y-4">
                    {currentTopic.references.map((ref, index) => (
                      <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-blue-500/50 transition-colors">
                        <div className="flex items-start gap-3">
                          {getIconForReferenceType(ref.type)}
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h4 className="text-white font-medium mb-1">{ref.title}</h4>
                                {ref.authors && (
                                  <p className="text-gray-400 text-sm mb-2">{ref.authors}</p>
                                )}
                                {ref.description && (
                                  <p className="text-gray-300 text-sm leading-relaxed">{ref.description}</p>
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
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {!currentTopic && (
            <div className="text-center py-12">
              <FaQuestionCircle size={48} className="text-blue-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Welcome to the ICL Documentation</h2>
              <p className="text-gray-400 mb-4">Select a topic from the sidebar to learn more about the dashboard's features.</p>
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-blue-300 text-sm">
                  💡 <strong>New to the tool?</strong> Try the <strong>ICL Guided Tour</strong> first! 
                  Click the purple "ICL Guide Demo" button in the header for an automated walkthrough.
                </p>
              </div>
              <div className="mt-6 text-left max-w-md mx-auto">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <FaBook className="text-green-400" />
                  Research-Based Tool
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  This visualization tool is built on cutting-edge research from Anthropic, Stanford, 
                  and recent mathematical frameworks for understanding in-context learning mechanisms.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpSystem;

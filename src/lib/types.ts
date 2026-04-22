export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  modelUsed?: string;
  modelCategory?: 'general' | 'coding' | 'math' | 'conversation' | 'multimodal';
  autoRouted?: boolean;
  imageUrl?: string;
  imageProvider?: string;
};

export type Chat = {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

// All available model IDs (tested and verified working)
export type ModelId =
  // Groq — fastest inference
  | 'llama-3.1-8b-instant'
  | 'llama-3.3-70b-versatile'
  | 'groq-llama-4-scout-17b'
  | 'groq-qwen3-32b'
  | 'groq-gpt-oss-120b'
  | 'groq-gpt-oss-20b'
  // Cerebras — ultra-fast hardware
  | 'cerebras-llama3.1-8b'
  | 'cerebras-qwen-3-235b'
  // Google Gemini — multimodal
  | 'gemini-2.5-flash'
  | 'gemini-2.5-flash-lite'
  | 'gemini-2.5-pro'
  // HuggingFace — free fallback
  | 'hf-llama-3.1-8b-instruct'
  | 'hf-llama-3.3-70b-instruct'
  | 'hf-qwen2.5-72b-instruct'
  | 'hf-qwen2.5-7b-instruct'
  | 'hf-deepseek-r1-distill-llama-70b'
  // OpenRouter — free tier
  | 'openrouter-gpt-oss-20b-free'
  | 'openrouter-gpt-oss-120b-free'
  | 'openrouter-nvidia-nemotron-super-free'
  | 'openrouter-gemma-3-12b-free'
  | 'openrouter-arcee-trinity-free'
  | 'openrouter-minimax-m2.5-free'
  | 'openrouter-elephant-alpha';

// Alias for backward compatibility
export type Model = ModelId;

export type Voice = 'troy' | 'diana' | 'hannah' | 'autumn' | 'austin' | 'daniel';

// Model category type
export type ModelCategory = 'general' | 'coding' | 'math' | 'conversation' | 'multimodal';

export type Settings = {
  model: 'auto' | ModelId;
  preferredCategory?: ModelCategory;
  tone: 'helpful' | 'formal' | 'casual';
  technicalLevel: 'beginner' | 'intermediate' | 'expert';
  enableSpeech: boolean;
  voice: Voice;
};

// User profile for personality feature
export type UserProfile = {
  userId: string;
  communicationStyle?: 'direct' | 'detailed' | 'casual' | 'technical';
  preferences?: {
    responseLength?: 'concise' | 'balanced' | 'detailed';
    codeExamples?: boolean;
    explanationStyle?: 'simple' | 'moderate' | 'advanced';
  };
  memories?: UserMemory[];
  createdAt: string;
  updatedAt: string;
};

export type UserMemory = {
  id: string;
  content: string;
  category: 'preference' | 'fact' | 'context' | 'skill';
  timestamp: string;
  relevance: number; // 0-1 score for memory importance
};

// Types for Genkit flows
export interface ProcessUserMessageInput {
  message: string;
  // Use a simpler history type that only includes what the AI needs.
  // This prevents schema validation errors from extra fields like id or createdAt.
  history: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  settings: Settings;
  userId?: string; // Optional user ID for memory system integration
}

export interface TextToSpeechInput {
  text: string;
  voice: Voice;
}

export interface TextToSpeechOutput {
  audio: string;
}

export interface SolveImageEquationInput {
  photoDataUri: string;
}

export interface SolveImageEquationOutput {
  recognizedEquation: string;
  solutionSteps: string;
  isSolvable: boolean;
}

export interface AnalyzePdfInput {
  pdfDataUri: string;
  question: string;
}

export interface AnalyzePdfOutput {
  answer: string;
}

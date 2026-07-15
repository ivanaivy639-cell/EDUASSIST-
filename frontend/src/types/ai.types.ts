export type AiGenerationType = 'lesson_plan' | 'exercise' | 'quiz' | 'correction' | 'summary';

export type AiProvider = 'firebase_ai_logic' | 'local';

export interface AiGenerationRequest {
  type: AiGenerationType;
  theme: string;
  niveau?: string;
  matiere?: string;
  duree?: string;
  objectifs?: string;
  consignes?: string;
  agent?: string;
}

export interface AiGenerationResult {
  content: string;
  provider: AiProvider;
  agent: string | null;
  model: string | null;
  fallback: boolean;
  generated_at: string;
}

export interface AiGenerationResponse {
  success: boolean;
  message: string;
  data?: AiGenerationResult;
}

export interface AiAgentOption {
  id: string;
  label: string;
  model: string | null;
  description: string;
  unlocked: boolean;
}

export interface AiAgentsResult {
  plan: string;
  plan_label: string;
  default_agent: string;
  agents: AiAgentOption[];
}

export interface AiAgentsResponse {
  success: boolean;
  message?: string;
  data?: AiAgentsResult;
}

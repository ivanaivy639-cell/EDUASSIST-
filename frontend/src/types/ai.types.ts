export type AiGenerationType = 'lesson_plan' | 'exercise' | 'quiz' | 'correction' | 'summary';

export type AiProvider = 'groq' | 'local';

export interface AiChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface AiGenerationRequest {
  message: string;
  history?: AiChatMessage[];
  agent?: string;
  class_id?: number;
  course_id?: number;
  file_data?: string;
  file_name?: string;
  file_type?: string;
  conversation_id?: number;
}

export interface AiGenerationResult {
  content: string;
  provider: AiProvider;
  agent: string | null;
  model: string | null;
  fallback: boolean;
  generated_at: string;
  conversation_id?: number;
  conversation_title?: string;
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

export interface AiConversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface AiConversationMessage {
  id: number;
  role: 'user' | 'model';
  content: string;
  created_at: string;
}

export interface AiConversationsResponse {
  success: boolean;
  data: AiConversation[];
}

export interface AiConversationDetailResponse {
  success: boolean;
  data: {
    conversation: AiConversation;
    messages: AiConversationMessage[];
  };
}

export interface AiCreateConversationResponse {
  success: boolean;
  data: AiConversation;
}
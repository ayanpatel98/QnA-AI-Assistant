// Shared interfaces and types for the USC AI Assistant server

export interface StudentProfile {
  id?: string;
  linkedinUrl?: string;
  resume?: {
    filename: string;
    base64: string;
    size: number;
  };
  currentEducation?: string;
  interests?: string;
  uploadedAt?: string;
}

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: string; text?: string; file?: any }>;
}

export interface OpenRouterPayload {
  model: string;
  messages: OpenRouterMessage[];
  max_tokens: number;
  plugins?: Array<{ id: string; pdf?: { engine: string } }>;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
}

export interface ProfileUploadResponse extends ApiResponse {
  profile?: StudentProfile;
}

export interface ChatResponse extends ApiResponse {
  response?: string;
  timestamp?: string;
}

export interface PluginConfig {
  id: string;
  pdf?: {
    engine: string;
  };
}

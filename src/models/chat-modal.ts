// Shared interfaces for the USC AI Assistant application

export interface StudentProfile {
  id?: string;
  linkedinUrl?: string;
  resume?: {
    filename: string;
    originalName?: string;
    base64: string;
    size: number;
  };
  currentEducation?: string;
  interests?: string;
  uploadedAt?: string;
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  timestamp: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  profile: StudentProfile;
}

export interface ChatInterfaceProps {
  userProfile: StudentProfile | null;
}

export interface ProfileUploadProps {
  userProfile: StudentProfile | null;
  setUserProfile: (profile: StudentProfile) => void;
}

export type TabType = 'chat' | 'profile';

export type EducationLevel = 'high_school' | 'undergraduate' | 'graduate' | 'working_professional';

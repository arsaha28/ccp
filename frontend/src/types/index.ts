export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  intent?: string;
  confidence?: number;
}

export interface VoiceAgentState {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  error: string | null;
}

export interface DialogflowResponse {
  queryText: string;
  fulfillmentText: string;
  intent: {
    displayName: string;
    confidence: number;
  };
  parameters?: Record<string, unknown>;
  outputContexts?: Array<{
    name: string;
    lifespanCount: number;
    parameters: Record<string, unknown>;
  }>;
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface AgentConfig {
  projectId: string;
  languageCode: string;
  voiceGender: 'MALE' | 'FEMALE' | 'NEUTRAL';
  speechRate: number;
  pitch: number;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  query: string;
}

// Web Speech API types
export interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export interface SpeechRecognitionResultItem {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

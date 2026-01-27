export enum SupportedLanguage {
  Tamil = 'Tamil',
  English = 'English',
  Hindi = 'Hindi',
  Malayalam = 'Malayalam',
  Telugu = 'Telugu'
}

export enum Classification {
  AI_GENERATED = 'AI_GENERATED',
  HUMAN = 'HUMAN'
}

// Internal File State
export interface AudioFileState {
  file: File | null;
  base64: string | null;
  previewUrl: string | null;
}

// API Request Body
export interface ApiRequest {
  language: SupportedLanguage;
  audioFormat: string;
  audioBase64: string;
}

// API Success Response
export interface ApiSuccessResponse {
  status: 'success';
  language: string;
  classification: Classification;
  confidenceScore: number;
  explanation: string;
}

// API Error Response
export interface ApiErrorResponse {
  status: 'error';
  message: string;
}

export type ApiResponse = ApiSuccessResponse | ApiErrorResponse;

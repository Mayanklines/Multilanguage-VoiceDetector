import { ApiRequest, ApiResponse, ApiSuccessResponse, Classification, SupportedLanguage } from '../types';
import { analyzeAudio } from '../services/geminiService';

// This file simulates the backend controller for the route:
// POST https://your-domain.com/api/voice-detection

const VALID_API_KEY = "sk_test_123456789";

export const voiceDetectionHandler = async (
  headers: Record<string, string>,
  body: ApiRequest
): Promise<ApiResponse> => {
  
  // 1. Validate API Key Header
  // Note: We use a case-insensitive check for headers usually, but here we check strict x-api-key
  const apiKey = headers['x-api-key'] || headers['X-API-KEY'];
  if (apiKey !== VALID_API_KEY) {
    return {
      status: 'error',
      message: 'Invalid API key or malformed request'
    };
  }

  // 2. Validate Request Body Fields
  if (!body.language || !body.audioFormat || !body.audioBase64) {
    return {
      status: 'error',
      message: 'Missing required fields: language, audioFormat, or audioBase64'
    };
  }

  // 3. Validate Language
  if (!Object.values(SupportedLanguage).includes(body.language)) {
    return {
      status: 'error',
      message: `Unsupported language. Supported: ${Object.values(SupportedLanguage).join(', ')}`
    };
  }

  // 4. Validate Audio Format
  if (body.audioFormat.toLowerCase() !== 'mp3') {
    return {
      status: 'error',
      message: 'Invalid audioFormat. Only "mp3" is supported.'
    };
  }

  // 5. Process Logic (Call Service)
  try {
    const analysis = await analyzeAudio(body.audioBase64, body.language);
    
    // 6. Return Success Response
    return {
      status: 'success',
      language: body.language,
      classification: analysis.classification,
      confidenceScore: analysis.confidenceScore,
      explanation: analysis.explanation
    };

  } catch (error) {
    console.error("API Internal Error", error);
    return {
      status: 'error',
      message: 'Internal processing error during voice analysis.'
    };
  }
};
import { GoogleGenAI, Type } from "@google/genai";
import { Classification, SupportedLanguage } from "../types";

// This service acts as the "Service Layer" called by the API Controller.

const API_KEY = process.env.API_KEY || '';

if (!API_KEY) {
  console.error("Missing API_KEY in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

interface GeminiServiceResult {
  classification: Classification;
  confidenceScore: number;
  explanation: string;
}

export const analyzeAudio = async (
  base64Audio: string,
  language: SupportedLanguage
): Promise<GeminiServiceResult> => {
  try {
    // Clean base64 if it has data URI scheme, though the API controller expects raw base64 usually,
    // we handle both for robustness in this service layer.
    const cleanBase64 = base64Audio.includes(',') 
      ? base64Audio.split(',')[1] 
      : base64Audio;

    // Use Gemini 3 Pro for advanced reasoning capabilities on complex forensic tasks
    const model = 'gemini-3-pro-preview';

    // Detailed forensic prompt to guide the model's analysis
    const prompt = `
      Perform a deep forensic acoustic analysis on the provided audio sample to detect if it is AI-generated (Deepfake/TTS) or Human.
      
      Target Language: ${language}

      Analysis Framework:
      1. **Spectral Artifacts**: Listen for high-frequency metallic buzzing, phasing, or "vocoder" quality common in neural vocoders.
      2. **Breath Dynamics**: Humans have natural, irregular micro-breaths between phrases. AI often has either no breaths, or pre-recorded, repetitive breath sounds that don't match the exertion of speech.
      3. **Prosody & Intonation**: Check for "flatness" in pitch or unnaturally perfect rhythm (isochrony). Humans vary speed and pitch based on emotion and emphasis.
      4. **Noise Floor**: Humans have a consistent background noise floor. AI often has "digital silence" (absolute 0 amplitude) between words or spectral gating artifacts.
      5. **Glottal Artifacts**: Listen to the vocal fry and glottal stops. AI often struggles to replicate the chaotic nature of human vocal folds.

      Evaluate the evidence and determine the likelihood.
      
      Return a strictly formatted JSON response.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: 'audio/mp3', data: cleanBase64 } }
        ]
      },
      config: {
        // Thinking Config allows the model to "reason" before outputting, improving accuracy on complex classification
        thinkingConfig: { thinkingBudget: 2048 }, 
        // maxOutputTokens must be > thinkingBudget. 4096 gives ample room for the final JSON.
        maxOutputTokens: 4096, 
        
        systemInstruction: "You are a world-class audio forensic analyst. Your analysis must be extremely critical. If you detect ANY signs of neural synthesis (vocoder artifacts, unnatural phase coherence), classify as AI_GENERATED. Be precise with your confidence score based on the strength of the artifacts found.",
        
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            classification: { type: Type.STRING, enum: ["AI_GENERATED", "HUMAN"] },
            confidenceScore: { type: Type.NUMBER, description: "A precise float between 0.0 and 1.0 representing certainty. 1.0 is absolute certainty." },
            explanation: { type: Type.STRING, description: "Technical forensic explanation citing specific artifacts (e.g., 'Lack of breathing sounds', 'Metallic phasing at 8kHz')." },
          },
          required: ["classification", "confidenceScore", "explanation"],
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text received from Gemini.");
    }

    return JSON.parse(text) as GeminiServiceResult;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    // In a real scenario, we might want to throw specific errors for the controller to catch
    throw new Error("Gemini API processing failed");
  }
};
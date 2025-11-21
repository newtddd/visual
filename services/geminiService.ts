import { GoogleGenAI, Modality } from "@google/genai";
import { decodeBase64, decodeAudioData } from "./audioUtils";

// Initialize Gemini Client
// NOTE: API Key is accessed securely via process.env.API_KEY as per instructions
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes an image and ghostwrites a story opening.
 */
export const generateStoryFromImage = async (
  base64Image: string,
  mimeType: string
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: `Act as a master creative writer. Analyze the mood, lighting, and scene of this image. 
            Based on your analysis, ghostwrite a compelling opening paragraph to a story set in this world.
            Focus on sensory details and atmosphere. Do not preamble, just write the story snippet.`,
          },
        ],
      },
    });

    return response.text || "Could not generate a story.";
  } catch (error) {
    console.error("Error generating story:", error);
    throw error;
  }
};

/**
 * Generates speech from text using Gemini TTS.
 * Returns an AudioBuffer ready to play.
 */
export const generateSpeech = async (
  text: string,
  audioContext: AudioContext
): Promise<AudioBuffer> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // 'Kore' is usually good for storytelling
          },
        },
      },
    });

    const candidate = response.candidates?.[0];
    const base64Audio = candidate?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error("No audio data received from Gemini.");
    }

    const audioBytes = decodeBase64(base64Audio);
    const audioBuffer = await decodeAudioData(audioBytes, audioContext);
    
    return audioBuffer;
  } catch (error) {
    console.error("Error generating speech:", error);
    throw error;
  }
};

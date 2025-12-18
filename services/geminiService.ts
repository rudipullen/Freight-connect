
import { GoogleGenAI } from "@google/genai";

// Use gemini-3-flash-preview for basic text tasks
const MODEL_NAME = 'gemini-3-flash-preview';

export const getLogisticsAdvice = async (query: string, context: string): Promise<string> => {
  // Always initialize GoogleGenAI inside the call using process.env.API_KEY directly
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const systemInstruction = `You are an expert logistics assistant for FreightConnect.
    You help shippers and carriers with route optimization, pricing estimates, and document requirements in South Africa.
    Keep answers concise and professional.
    Context: ${context}`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: query,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    // Access the text property directly (not a method)
    return response.text || "I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Sorry, I encountered an error processing your request.";
  }
};
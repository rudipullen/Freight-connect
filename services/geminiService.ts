import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

let aiClient: GoogleGenAI | null = null;

try {
  if (apiKey) {
    aiClient = new GoogleGenAI({ apiKey });
  }
} catch (error) {
  console.error("Failed to initialize GoogleGenAI client:", error);
}

export const getLogisticsAdvice = async (query: string, context: string): Promise<string> => {
  if (!aiClient) {
    return "AI Assistant is offline. Please configure the API Key.";
  }

  try {
    const model = "gemini-2.5-flash";
    const systemInstruction = `You are an expert logistics assistant for FreightConnect.
    You help shippers and carriers with route optimization, pricing estimates, and document requirements in South Africa.
    Keep answers concise and professional.
    Context: ${context}`;

    const response = await aiClient.models.generateContent({
      model: model,
      contents: query,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Sorry, I encountered an error processing your request.";
  }
};
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

export interface AIResponse {
  text: string;
  groundingChunks?: any[];
}

export interface LocationParams {
  lat: number;
  lng: number;
}

export const getLogisticsAdvice = async (query: string, context: string, location?: LocationParams): Promise<AIResponse> => {
  if (!aiClient) {
    return { text: "AI Assistant is offline. Please configure the API Key." };
  }

  try {
    const model = "gemini-2.5-flash";
    const systemInstruction = `You are an expert logistics assistant for FreightConnect.
    You help shippers and carriers with route optimization, pricing estimates, and document requirements in South Africa.
    Keep answers concise and professional.
    Use Google Maps to provide accurate location information, distances, and place details when relevant.
    Context: ${context}`;

    const config: any = {
      systemInstruction: systemInstruction,
      tools: [{ googleMaps: {} }],
    };

    if (location) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: location.lat,
            longitude: location.lng
          }
        }
      };
    }

    const response = await aiClient.models.generateContent({
      model: model,
      contents: query,
      config: config
    });

    return {
      text: response.text || "I couldn't generate a response at this time.",
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
    };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return { text: "Sorry, I encountered an error processing your request." };
  }
};
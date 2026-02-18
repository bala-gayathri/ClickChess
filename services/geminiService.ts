
import { GoogleGenAI, Type } from "@google/genai";
import { ChessMove, GameMetadata } from "../types";

export interface ScanResult {
  moves: ChessMove[];
  metadata: Partial<GameMetadata>;
}

export const parseScoresheet = async (base64Image: string): Promise<ScanResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          {
            text: "Chess OCR: Extract White, Black, and algebraic moves into JSON. Standard notation only.",
          },
        ],
      },
    ],
    config: {
      thinkingConfig: { thinkingBudget: 0 }, // Disable thinking for faster direct response
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          metadata: {
            type: Type.OBJECT,
            properties: {
              white: { type: Type.STRING },
              black: { type: Type.STRING },
              event: { type: Type.STRING },
              date: { type: Type.STRING },
            },
          },
          moves: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                moveNumber: { type: Type.INTEGER },
                white: { type: Type.STRING },
                black: { type: Type.STRING },
              },
              required: ["moveNumber", "white", "black"],
            },
          },
        },
        required: ["metadata", "moves"],
      },
    },
  });

  try {
    const text = response.text || '{"metadata": {}, "moves": []}';
    const parsed = JSON.parse(text);
    const cleanedMoves = (parsed.moves || []).map((m: any) => ({
      moveNumber: m.moveNumber || 0,
      white: m.white || '',
      black: m.black || ''
    }));
    return { ...parsed, moves: cleanedMoves };
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    return { metadata: {}, moves: [] };
  }
};

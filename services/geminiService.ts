import { GoogleGenAI, Type } from "@google/genai";
import { ChessMove, GameMetadata } from "../types";

export interface ScanResult {
  moves: ChessMove[];
  metadata: Partial<GameMetadata>;
}

export const parseScoresheet = async (base64Image: string): Promise<ScanResult> => {
  const apiKey = import.meta.env.VITE_API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("VITE_API_KEY is missing. Please add it to your Environment Variables.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
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
            text: "Chess OCR: Extract White, Black, and algebraic moves into JSON. Standard notation only. If move is unclear, use standard '?' or leave empty.",
          },
        ],
      },
    ],
    config: {
      thinkingConfig: { thinkingBudget: 0 },
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

  const text = response.text || '{"metadata": {}, "moves": []}';
  const parsed = JSON.parse(text);
  
  const cleanedMoves = (parsed.moves || []).map((m: any) => ({
    moveNumber: m.moveNumber || 0,
    white: m.white || '',
    black: m.black || ''
  }));

  return { 
    metadata: parsed.metadata || {}, 
    moves: cleanedMoves 
  };
};
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function askGemini(message: string) {
  const interaction = await ai.interactions.create({
    model: "gemini-3.8-flash",
    input: message,
  });

  return interaction.output_text;
}
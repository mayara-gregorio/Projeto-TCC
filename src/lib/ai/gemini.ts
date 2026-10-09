import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

type HistoryItem = { role: "user" | "assistant"; content: string }

export async function askGemini(history: HistoryItem[]) {
  const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: history.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
  })

  console.log("esta é a response da IA", response)
  return response.text ?? ""
}
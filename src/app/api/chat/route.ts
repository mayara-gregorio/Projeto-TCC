import { askGemini } from "@/lib/ai/gemini";

export async function POST(request: Request) {
  const { message } = await request.json();

  const response = await askGemini(message);

  return Response.json({
    response,
  });
}
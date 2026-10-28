type Msg = { role: "system" | "user" | "assistant"; content: string };

export async function askLocal(messages: Msg[]): Promise<string> {
  const res = await fetch(`${process.env.LLM_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: messages.slice(-20), temperature: 0.2 }),
  });
  if (!res.ok) throw new Error("A LLM local não respondeu. O servidor está ligado?");
  const data = await res.json();
  return data.choices[0].message.content;
}
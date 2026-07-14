import type { ChatMessage, ChatRequest, ChatResponse } from "../types/chat";

export async function sendChatMessage(
  characterId: string,
  messages: ChatMessage[],
): Promise<ChatMessage> {
  const response = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      character_id: characterId,
      messages,
    } satisfies ChatRequest),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(data?.error ?? "Failed to send chat message.");
  }

  const data = (await response.json()) as ChatResponse;
  return data.message;
}

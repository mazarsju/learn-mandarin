export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ChatRequest = {
  character_id: string;
  messages: ChatMessage[];
};

export type ChatResponse = {
  message: ChatMessage;
};

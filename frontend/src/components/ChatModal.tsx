import { useEffect, useState, type FormEvent } from "react";
import type { ChatCharacter } from "./ChatCharacterCard";
import ChatCharacterAvatar from "./ChatCharacterAvatar";
import type { ChatMessage } from "../types/chat";
import { sendChatMessage } from "../utils/chatApi";

type ChatModalProps = {
  character: ChatCharacter | null;
  onClose: () => void;
};

export default function ChatModal({ character, onClose }: ChatModalProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMessage("");
    setMessages([]);
    setError(null);
    setIsSending(false);
  }, [character?.id]);

  if (character === null) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (trimmedMessage === "" || isSending) {
      return;
    }

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmedMessage },
    ];

    setMessages(nextMessages);
    setMessage("");
    setError(null);
    setIsSending(true);

    try {
      const assistantMessage = await sendChatMessage(character.id, nextMessages);
      setMessages((current) => [...current, assistantMessage]);
    } catch (sendError) {
      setMessages(messages);
      setMessage(trimmedMessage);
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Failed to send chat message.",
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="chat-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="chat-modal-header">
          <div className="chat-modal-participant">
            <ChatCharacterAvatar
              variant={character.avatarVariant}
              className="chat-character-avatar-image--compact"
            />
            <div className="chat-modal-participant-text">
              <h2 id="chat-modal-title" className="chat-modal-participant-name">
                {character.name}{" "}
                <span className="chat-modal-participant-chinese-name">
                  ({character.chineseName})
                </span>
              </h2>
            </div>
          </div>
          <button
            type="button"
            className="chat-modal-close-button"
            aria-label="Close chat"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="chat-modal-messages" aria-live="polite">
          {messages.length === 0 ? (
            <p className="chat-modal-empty-state">
              Start a conversation with {character.name}.
            </p>
          ) : (
            <ul className="chat-message-list">
              {messages.map((chatMessage, index) => (
                <li
                  key={`${chatMessage.role}-${index}-${chatMessage.content}`}
                  className={
                    chatMessage.role === "user"
                      ? "chat-message chat-message--user"
                      : "chat-message chat-message--assistant"
                  }
                >
                  {chatMessage.content}
                </li>
              ))}
            </ul>
          )}
          {isSending && (
            <p className="chat-modal-typing-indicator">
              {character.name} is typing...
            </p>
          )}
        </div>

        {error && <p className="chat-modal-error table-error">{error}</p>}

        <form className="chat-modal-composer" onSubmit={(event) => void handleSubmit(event)}>
          <label className="chat-modal-composer-label" htmlFor="chat-message-input">
            Message
          </label>
          <div className="chat-modal-composer-row">
            <input
              id="chat-message-input"
              type="text"
              value={message}
              placeholder="Type your message..."
              disabled={isSending}
              onChange={(event) => setMessage(event.target.value)}
            />
            <button
              type="submit"
              className="page-add-button"
              disabled={isSending || message.trim() === ""}
            >
              {isSending ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

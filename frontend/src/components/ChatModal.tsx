import { useEffect, useState, type FormEvent } from "react";
import type { ChatCharacter } from "./ChatCharacterCard";
import ChatCharacterAvatar from "./ChatCharacterAvatar";
import ConfirmModal from "./ConfirmModal";
import { CloseIcon, SendIcon, TrashIcon } from "./icons";
import type { ChatMessage } from "../types/chat";
import {
  clearChatHistory,
  fetchChatHistory,
  sendChatMessage,
} from "../utils/chatApi";

type ChatModalProps = {
  character: ChatCharacter | null;
  onClose: () => void;
};

export default function ChatModal({ character, onClose }: ChatModalProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (character === null) {
      return;
    }

    let isMounted = true;

    setMessage("");
    setMessages([]);
    setError(null);
    setIsSending(false);
    setIsClearing(false);
    setIsClearConfirmOpen(false);
    setIsLoadingHistory(true);

    void fetchChatHistory(character.id)
      .then((history) => {
        if (isMounted) {
          setMessages(history);
        }
      })
      .catch((historyError) => {
        if (isMounted) {
          setError(
            historyError instanceof Error
              ? historyError.message
              : "Failed to load chat history.",
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingHistory(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [character]);

  if (character === null) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (trimmedMessage === "" || isSending || isClearing) {
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

  async function handleClearHistory() {
    if (isClearing || isSending || messages.length === 0) {
      return;
    }

    setIsClearConfirmOpen(false);
    setIsClearing(true);
    setError(null);

    try {
      await clearChatHistory(character.id);
      setMessages([]);
      setMessage("");
    } catch (clearError) {
      setError(
        clearError instanceof Error
          ? clearError.message
          : "Failed to clear chat history.",
      );
    } finally {
      setIsClearing(false);
    }
  }

  return (
    <>
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
            <div className="chat-modal-header-actions">
              <button
                type="button"
                className="chat-modal-clear-button"
                disabled={
                  isLoadingHistory ||
                  isSending ||
                  isClearing ||
                  messages.length === 0
                }
                onClick={() => setIsClearConfirmOpen(true)}
              >
                <TrashIcon className="chat-modal-clear-icon" />
                <span>{isClearing ? "Clearing..." : "Clear chat history"}</span>
              </button>
              <button
                type="button"
                className="chat-modal-close-button"
                aria-label="Close chat"
                onClick={onClose}
              >
                <CloseIcon className="chat-modal-close-icon" />
              </button>
            </div>
          </header>

          <div className="chat-modal-messages" aria-live="polite">
            {isLoadingHistory ? (
              <p className="chat-modal-empty-state">Loading conversation...</p>
            ) : messages.length === 0 ? (
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

          <form
            className="chat-modal-composer"
            onSubmit={(event) => void handleSubmit(event)}
          >
            <label
              className="chat-modal-composer-label"
              htmlFor="chat-message-input"
            >
              Message
            </label>
            <div className="chat-modal-composer-row">
              <input
                id="chat-message-input"
                type="text"
                value={message}
                placeholder="Type your message..."
                disabled={isSending || isClearing}
                onChange={(event) => setMessage(event.target.value)}
              />
              <button
                type="submit"
                className="chat-modal-send-button"
                disabled={isSending || isClearing || message.trim() === ""}
              >
                <SendIcon className="chat-modal-send-icon" />
                <span>{isSending ? "Sending..." : "Send"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmModal
        isOpen={isClearConfirmOpen}
        message={`Clear all chat history with ${character.name}? This cannot be undone.`}
        onConfirm={() => void handleClearHistory()}
        onCancel={() => setIsClearConfirmOpen(false)}
      />
    </>
  );
}

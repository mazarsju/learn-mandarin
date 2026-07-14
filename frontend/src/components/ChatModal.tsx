import { useState, type FormEvent } from "react";
import type { ChatCharacter } from "./ChatCharacterCard";
import ChatCharacterAvatar from "./ChatCharacterAvatar";

type ChatModalProps = {
  character: ChatCharacter | null;
  onClose: () => void;
};

export default function ChatModal({ character, onClose }: ChatModalProps) {
  const [message, setMessage] = useState("");

  if (character === null) {
    return null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (message.trim() === "") {
      return;
    }

    setMessage("");
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
          <p className="chat-modal-empty-state">
            Start a conversation with {character.name}.
          </p>
        </div>

        <form className="chat-modal-composer" onSubmit={handleSubmit}>
          <label className="chat-modal-composer-label" htmlFor="chat-message-input">
            Message
          </label>
          <div className="chat-modal-composer-row">
            <input
              id="chat-message-input"
              type="text"
              value={message}
              placeholder="Type your message..."
              onChange={(event) => setMessage(event.target.value)}
            />
            <button type="submit" className="page-add-button">
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

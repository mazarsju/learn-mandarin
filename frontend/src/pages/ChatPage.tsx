import { useState } from "react";
import ChatCharacterCard, {
  type ChatCharacter,
} from "../components/ChatCharacterCard";
import ChatModal from "../components/ChatModal";
import Page from "../components/Page";
import { CHAT_CHARACTERS } from "../data/chatCharacters";

export default function ChatPage() {
  const [selectedCharacter, setSelectedCharacter] =
    useState<ChatCharacter | null>(null);

  return (
    <Page title="Chat">
      <ChatModal
        character={selectedCharacter}
        onClose={() => setSelectedCharacter(null)}
      />
      <p className="chat-intro">Who do you want to speak with today?</p>
      <div className="chat-character-grid">
        {CHAT_CHARACTERS.map((character) => (
          <ChatCharacterCard
            key={character.id}
            character={character}
            onSelect={setSelectedCharacter}
          />
        ))}
      </div>
    </Page>
  );
}

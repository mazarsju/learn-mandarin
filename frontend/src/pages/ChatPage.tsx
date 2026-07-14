import { useState } from "react";
import ChatCharacterCard, {
  type ChatCharacter,
} from "../components/ChatCharacterCard";
import ChatModal from "../components/ChatModal";
import Page from "../components/Page";

const chatCharacters: ChatCharacter[] = [
  {
    id: "teacher-wang",
    name: "Teacher Wang",
    chineseName: "王老师",
    description: "The native Chinese teacher who can also speak English",
    avatarVariant: "teacher",
  },
  {
    id: "xiao-ming",
    name: "Xiao Ming",
    chineseName: "小明",
    description: "Your native Chinese friend",
    avatarVariant: "friend",
  },
];

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
        {chatCharacters.map((character) => (
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

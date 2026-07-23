import type { ChatCharacter } from "../components/ChatCharacterCard";

export const TEACHER_WANG: ChatCharacter = {
  id: "teacher-wang",
  name: "Teacher Wang",
  chineseName: "王老师",
  description: "The native Chinese teacher who can also speak English",
  avatarVariant: "teacher",
};

export const XIAO_MING: ChatCharacter = {
  id: "xiao-ming",
  name: "Xiao Ming",
  chineseName: "小明",
  description: "Your native Chinese friend",
  avatarVariant: "friend",
};

export const CHAT_CHARACTERS: ChatCharacter[] = [TEACHER_WANG, XIAO_MING];

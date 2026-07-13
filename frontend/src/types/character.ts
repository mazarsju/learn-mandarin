export type Character = {
  char: string;
  pinyin: string;
  writting_known: boolean;
  updated_at: string;
};

export function isValidCharacter(value: string): boolean {
  const trimmed = value.trim();
  return [...trimmed].length === 1;
}

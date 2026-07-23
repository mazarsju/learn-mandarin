export const HSK_MAX_LEVEL = 7;
export const HSK_LEVEL_COMPLETION_RATIO = 0.85;

export type HskCharacterEntry = {
  character: string;
  level: number;
  frequency: number;
};

export type HskLevelStatus = {
  currentLevel: number | null;
  nextLevel: number | null;
  charactersToNextLevel: number | null;
  progressToNextLevel: number;
  missingCharacters: string[];
};

function entriesUpToLevel(
  vocabulary: HskCharacterEntry[],
  level: number,
): HskCharacterEntry[] {
  return vocabulary.filter((entry) => entry.level <= level);
}

function requiredKnownCount(totalCharacters: number): number {
  return Math.ceil(totalCharacters * HSK_LEVEL_COMPLETION_RATIO);
}

function isLevelComplete(
  knownCharacters: Set<string>,
  vocabulary: HskCharacterEntry[],
  level: number,
): boolean {
  const required = entriesUpToLevel(vocabulary, level);
  if (required.length === 0) {
    return false;
  }

  const knownUpToLevel = required.filter((entry) =>
    knownCharacters.has(entry.character),
  ).length;
  return knownUpToLevel >= requiredKnownCount(required.length);
}

export function getHskLevelStatus(
  knownCharacters: Iterable<string>,
  vocabulary: HskCharacterEntry[],
): HskLevelStatus {
  const known = new Set(knownCharacters);

  let currentLevel: number | null = null;
  for (let level = 1; level <= HSK_MAX_LEVEL; level++) {
    if (!isLevelComplete(known, vocabulary, level)) {
      break;
    }
    currentLevel = level;
  }

  if (currentLevel === HSK_MAX_LEVEL) {
    return {
      currentLevel: HSK_MAX_LEVEL,
      nextLevel: null,
      charactersToNextLevel: null,
      progressToNextLevel: 100,
      missingCharacters: [],
    };
  }

  const nextLevel = currentLevel === null ? 1 : currentLevel + 1;
  const required = entriesUpToLevel(vocabulary, nextLevel);
  const targetKnown = requiredKnownCount(required.length);
  const missingEntries = required
    .filter((entry) => !known.has(entry.character))
    .sort((a, b) => a.frequency - b.frequency);
  const missingCharacters = missingEntries.map((entry) => entry.character);
  const knownForNext = required.length - missingCharacters.length;
  const charactersToNextLevel = Math.max(0, targetKnown - knownForNext);

  return {
    currentLevel,
    nextLevel,
    charactersToNextLevel,
    progressToNextLevel:
      targetKnown === 0 ? 0 : Math.min(100, (knownForNext / targetKnown) * 100),
    missingCharacters,
  };
}

export function getMotivationMessages(recognizedCount: number): string[] {
  const messages: string[] = [];

  if (recognizedCount > 1000) {
    messages.push(
      "You should know more than 90% of the characters in a newspaper",
    );
  }

  if (recognizedCount > 2000) {
    messages.push(
      "You should know more than 98% of the characters of a newspaper",
    );
  }

  if (recognizedCount > 3000) {
    messages.push(
      "You should know more than 99% of the characters of a newspaper",
    );
  }

  if (recognizedCount > 2500) {
    messages.push(
      "You know more characters than a kid at the end of primary school !",
    );
  }

  return messages;
}

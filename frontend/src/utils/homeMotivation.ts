const HSK_THRESHOLDS = [
  { level: 1, threshold: 300 },
  { level: 2, threshold: 600 },
  { level: 3, threshold: 900 },
  { level: 4, threshold: 1200 },
  { level: 5, threshold: 1500 },
  { level: 6, threshold: 1800 },
] as const;

export type HskLevelStatus = {
  currentLevel: number | null;
  nextLevel: number | null;
  charactersToNextLevel: number | null;
  progressToNextLevel: number;
};

export function getHskLevelStatus(characterCount: number): HskLevelStatus {
  let currentLevel: number | null = null;
  let previousThreshold = 0;

  for (const { level, threshold } of HSK_THRESHOLDS) {
    if (characterCount >= threshold) {
      currentLevel = level;
      previousThreshold = threshold;
      continue;
    }

    return {
      currentLevel,
      nextLevel: level,
      charactersToNextLevel: threshold - characterCount,
      progressToNextLevel: Math.min(
        100,
        Math.max(
          0,
          ((characterCount - previousThreshold) /
            (threshold - previousThreshold)) *
            100,
        ),
      ),
    };
  }

  return {
    currentLevel: 6,
    nextLevel: null,
    charactersToNextLevel: null,
    progressToNextLevel: 100,
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

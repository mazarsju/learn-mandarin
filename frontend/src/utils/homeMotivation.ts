const HSK_THRESHOLDS = [
  { level: 1, threshold: 300 },
  { level: 2, threshold: 600 },
  { level: 3, threshold: 900 },
  { level: 4, threshold: 1200 },
  { level: 5, threshold: 1500 },
  { level: 6, threshold: 1800 },
] as const;

export type HskProgress = {
  remaining: number;
  level: number;
};

export function getNextHskProgress(recognizedCount: number): HskProgress | null {
  const nextLevel = HSK_THRESHOLDS.find(
    ({ threshold }) => recognizedCount < threshold,
  );

  if (!nextLevel) {
    return null;
  }

  return {
    remaining: nextLevel.threshold - recognizedCount,
    level: nextLevel.level,
  };
}

export function getMotivationMessages(recognizedCount: number): string[] {
  const messages: string[] = [];

  const hskProgress = getNextHskProgress(recognizedCount);
  if (hskProgress) {
    messages.push(
      `${hskProgress.remaining} more to go to reach a general HSK ${hskProgress.level} level`,
    );
  }

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

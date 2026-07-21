import { writeFileSync } from "node:fs";
import { join } from "node:path";

type VocabularyEntry = {
  simplified: string;
  level: string[];
};

export function groupSimplifiedByNewLevel(
  entries: VocabularyEntry[],
  outputDir?: string,
): [string[], string[], string[], string[], string[], string[], string[]] {
  const lists: [string[], string[], string[], string[], string[], string[], string[]] =
    [[], [], [], [], [], [], []];

  for (const entry of entries) {
    for (let level = 1; level <= 7; level++) {
      if (entry.level.includes(`new-${level}`)) {
        lists[level - 1].push(entry.simplified);
      }
    }
  }

  if (outputDir !== undefined) {
    lists.forEach((words, index) => {
      writeFileSync(
        join(outputDir, `hsk-${index + 1}.txt`),
        words.length > 0 ? `${words.join("\n")}\n` : "",
        "utf-8",
      );
    });
  }

  return lists;
}

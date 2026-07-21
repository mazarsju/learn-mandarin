import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const HAN_CHARACTER_PATTERN = /^\p{Script=Han}$/u;

export function writeCharacterHskFiles(
  inputDir: string,
  outputDir: string = inputDir,
): string[] {
  const outputs: string[] = [];

  for (let level = 1; level <= 7; level++) {
    const words = readFileSync(join(inputDir, `hsk-${level}.txt`), "utf-8")
      .split("\n")
      .filter(Boolean);

    const uniqueChars = new Set<string>();
    for (const word of words) {
      for (const char of word) {
        if (HAN_CHARACTER_PATTERN.test(char)) {
          uniqueChars.add(char);
        }
      }
    }

    const line = [...uniqueChars].join(",");
    writeFileSync(
      join(outputDir, `character-hsk-${level}.txt`),
      line.length > 0 ? `${line}\n` : "",
      "utf-8",
    );
    outputs.push(line);
  }

  return outputs;
}

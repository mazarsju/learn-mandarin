import { useMemo, type ReactNode } from "react";
import type { Character } from "../types/character";
import { FINAL, parsePinyinSyllable, START } from "../types/pinyin";

function formatStartLabel(start: string): string {
  return start === "" ? "—" : start;
}

export function getColumnMinWidthCh(finalValue: string): number {
  return Math.max(finalValue.length, 3);
}

export function chunkCharacters(
  characters: string[],
  lineSize = 3,
): string[] {
  const lines: string[] = [];

  for (let index = 0; index < characters.length; index += lineSize) {
    lines.push(characters.slice(index, index + lineSize).join(""));
  }

  return lines;
}

function renderCellCharacters(characters: string[]): ReactNode {
  const lines = chunkCharacters(characters);

  return (
    <span className="pinyin-grid-cell-content">
      {lines.map((line, index) => (
        <span key={`${line}-${index}`} className="pinyin-grid-cell-line">
          {line}
        </span>
      ))}
    </span>
  );
}

function groupCharactersByPinyin(
  characters: Character[],
): Map<string, Map<string, string[]>> {
  const grid = new Map<string, Map<string, string[]>>();

  for (const character of characters) {
    const syllable = parsePinyinSyllable(character.pinyin);
    if (syllable === null) {
      continue;
    }

    const { start, final } = syllable;
    const finalsForStart = grid.get(start) ?? new Map<string, string[]>();
    const charsForCell = finalsForStart.get(final) ?? [];

    charsForCell.push(character.char);
    finalsForStart.set(final, charsForCell);
    grid.set(start, finalsForStart);
  }

  return grid;
}

type PinyinGridViewProps = {
  characters: Character[];
};

export default function PinyinGridView({ characters }: PinyinGridViewProps) {
  const grid = useMemo(
    () => groupCharactersByPinyin(characters),
    [characters],
  );

  return (
    <div className="pinyin-grid-bleed">
      <div className="pinyin-grid-wrapper">
        <table className="pinyin-grid">
          <colgroup>
            <col className="pinyin-grid-corner-col" />
            {FINAL.map((finalValue) => (
              <col
                key={finalValue}
                className="pinyin-grid-final-col"
                style={{
                  minWidth: `${getColumnMinWidthCh(finalValue)}ch`,
                }}
              />
            ))}
          </colgroup>
        <thead>
          <tr>
            <th className="pinyin-grid-corner" scope="col">
              start \ final
            </th>
            {FINAL.map((finalValue) => (
              <th key={finalValue} scope="col">
                {finalValue}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {START.map((startValue) => (
            <tr key={startValue || "empty-start"}>
              <th className="pinyin-grid-row-header" scope="row">
                {formatStartLabel(startValue)}
              </th>
              {FINAL.map((finalValue) => {
                const cellCharacters =
                  grid.get(startValue)?.get(finalValue) ?? [];

                return (
                  <td key={finalValue}>
                    {cellCharacters.length > 0
                      ? renderCellCharacters(cellCharacters)
                      : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

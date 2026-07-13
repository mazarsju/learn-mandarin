export const START = [
  "",
  "b",
  "p",
  "m",
  "f",
  "d",
  "t",
  "n",
  "l",
  "z",
  "c",
  "s",
  "zh",
  "ch",
  "sh",
  "r",
  "j",
  "q",
  "x",
  "g",
  "k",
  "h",
  "w",
  "y",
];

export const FINAL = [
  "a",
  "ai",
  "ao",
  "an",
  "ang",
  "e",
  "ei",
  "en",
  "eng",
  "er",
  "o",
  "ou",
  "ong",
  "i",
  "i*",
  "ia",
  "iao",
  "ie",
  "iu",
  "ian",
  "iang",
  "in",
  "ing",
  "iong",
  "u",
  "ua",
  "uai",
  "ui",
  "uo",
  "uan",
  "uang",
  "un",
  "ueng",
  "ü",
  "üe",
  "üan",
  "ün",
];

const VALID_TONES = new Set(["1", "2", "3", "4"]);

const STARTS_BY_LENGTH = [...START].sort((a, b) => b.length - a.length);
const FINAL_SET = new Set(FINAL);

export type PinyinSyllable = {
  start: string;
  final: string;
};

function stripTone(value: string): string {
  const tone = value[value.length - 1];
  return tone !== undefined && VALID_TONES.has(tone)
    ? value.slice(0, -1)
    : value;
}

export function parsePinyinSyllable(value: string): PinyinSyllable | null {
  const trimmed = value.trim().toLowerCase();
  if (trimmed === "") {
    return null;
  }

  const pinyin = stripTone(trimmed);
  if (pinyin === "") {
    return null;
  }

  for (const start of STARTS_BY_LENGTH) {
    if (!pinyin.startsWith(start)) {
      continue;
    }

    const remainder = pinyin.slice(start.length);
    if (FINAL_SET.has(remainder)) {
      return { start, final: remainder };
    }
  }

  return null;
}

export function isValidPinyin(value: string): boolean {
  return parsePinyinSyllable(value) !== null;
}

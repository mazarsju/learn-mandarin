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

export function isValidPinyin(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  if (trimmed === "") {
    return false;
  }

  const tone = trimmed[trimmed.length - 1];
  const pinyin =
    tone !== undefined && VALID_TONES.has(tone)
      ? trimmed.slice(0, -1)
      : trimmed;

  if (pinyin === "") {
    return false;
  }

  for (const start of STARTS_BY_LENGTH) {
    if (!pinyin.startsWith(start)) {
      continue;
    }

    const remainder = pinyin.slice(start.length);
    if (FINAL_SET.has(remainder)) {
      return true;
    }
  }

  return false;
}

import { describe, expect, it } from "vitest";
import { isValidPinyin, parsePinyinSyllable } from "./pinyin";

describe("parsePinyinSyllable", () => {
  it.each([
    ["ai4", { start: "", final: "ai" }],
    ["bei3", { start: "b", final: "ei" }],
    ["zhong1", { start: "zh", final: "ong" }],
    ["üe4", { start: "", final: "üe" }],
  ])("parses %s into start and final", (value, expected) => {
    expect(parsePinyinSyllable(value)).toEqual(expected);
  });

  it.each(["", "xyz", "ai5"])("returns null for invalid pinyin %s", (value) => {
    expect(parsePinyinSyllable(value)).toBeNull();
  });
});

describe("isValidPinyin", () => {
  it.each([
    "ai",
    "ai4",
    "zhong",
    "zhong1",
    "bei3",
    "üe4",
  ])("accepts valid pinyin %s", (value) => {
    expect(isValidPinyin(value)).toBe(true);
  });

  it.each(["", "   ", "xyz", "b", "ai5", "zzang"])(
    "rejects invalid pinyin %s",
    (value) => {
      expect(isValidPinyin(value)).toBe(false);
    },
  );
});

import { describe, expect, it } from "vitest";
import { isValidPinyin } from "./pinyin";

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

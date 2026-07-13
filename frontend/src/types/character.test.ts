import { describe, expect, it } from "vitest";
import { isValidCharacter } from "./character";

describe("isValidCharacter", () => {
  it.each(["爱", " 好 "])("accepts a single character in %s", (value) => {
    expect(isValidCharacter(value)).toBe(true);
  });

  it.each(["", "   ", "爱好"])("rejects invalid character value %s", (value) => {
    expect(isValidCharacter(value)).toBe(false);
  });
});

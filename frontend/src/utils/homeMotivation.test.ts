import { getMotivationMessages, getNextHskProgress } from "./homeMotivation";

describe("getNextHskProgress", () => {
  it("returns progress toward HSK 1 when below 300 characters", () => {
    expect(getNextHskProgress(0)).toEqual({ remaining: 300, level: 1 });
    expect(getNextHskProgress(250)).toEqual({ remaining: 50, level: 1 });
  });

  it("returns progress toward the next HSK level after each threshold", () => {
    expect(getNextHskProgress(300)).toEqual({ remaining: 300, level: 2 });
    expect(getNextHskProgress(900)).toEqual({ remaining: 300, level: 4 });
  });

  it("returns null when HSK 6 is reached", () => {
    expect(getNextHskProgress(1800)).toBeNull();
    expect(getNextHskProgress(2500)).toBeNull();
  });
});

describe("getMotivationMessages", () => {
  it("includes only the HSK message for low counts", () => {
    expect(getMotivationMessages(100)).toEqual([
      "200 more to go to reach a general HSK 1 level",
    ]);
  });

  it("adds newspaper and school messages at the configured thresholds", () => {
    expect(getMotivationMessages(1001)).toEqual([
      "199 more to go to reach a general HSK 4 level",
      "You should know more than 90% of the characters in a newspaper",
    ]);

    expect(getMotivationMessages(2501)).toEqual([
      "You should know more than 90% of the characters in a newspaper",
      "You should know more than 98% of the characters of a newspaper",
      "You know more characters than a kid at the end of primary school !",
    ]);

    expect(getMotivationMessages(3001)).toEqual([
      "You should know more than 90% of the characters in a newspaper",
      "You should know more than 98% of the characters of a newspaper",
      "You should know more than 99% of the characters of a newspaper",
      "You know more characters than a kid at the end of primary school !",
    ]);
  });
});

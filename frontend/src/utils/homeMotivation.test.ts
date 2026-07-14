import { getHskLevelStatus, getMotivationMessages } from "./homeMotivation";

describe("getHskLevelStatus", () => {
  it("returns pre-HSK 1 status when character count is below 300", () => {
    expect(getHskLevelStatus(2)).toEqual({
      currentLevel: null,
      nextLevel: 1,
      charactersToNextLevel: 298,
      progressToNextLevel: (2 / 300) * 100,
    });
  });

  it("returns the current level and progress toward the next one", () => {
    expect(getHskLevelStatus(450)).toEqual({
      currentLevel: 1,
      nextLevel: 2,
      charactersToNextLevel: 150,
      progressToNextLevel: ((450 - 300) / (600 - 300)) * 100,
    });
  });

  it("returns HSK 6 when the highest threshold is reached", () => {
    expect(getHskLevelStatus(1800)).toEqual({
      currentLevel: 6,
      nextLevel: null,
      charactersToNextLevel: null,
      progressToNextLevel: 100,
    });
  });
});

describe("getMotivationMessages", () => {
  it("returns no messages for low character counts", () => {
    expect(getMotivationMessages(100)).toEqual([]);
  });

  it("adds newspaper and school messages at the configured thresholds", () => {
    expect(getMotivationMessages(1001)).toEqual([
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

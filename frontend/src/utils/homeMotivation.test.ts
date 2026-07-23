import { getHskLevelStatus, getMotivationMessages } from "./homeMotivation";

const vocabulary = [
  { character: "爱", level: 1, frequency: 30 },
  { character: "好", level: 1, frequency: 10 },
  { character: "八", level: 1, frequency: 20 },
  { character: "学", level: 2, frequency: 40 },
  { character: "习", level: 2, frequency: 50 },
];

describe("getHskLevelStatus", () => {
  it("returns missing characters ordered by frequency ascending", () => {
    expect(getHskLevelStatus(["爱"], vocabulary)).toEqual({
      currentLevel: null,
      nextLevel: 1,
      charactersToNextLevel: 2,
      progressToNextLevel: (1 / 3) * 100,
      missingCharacters: ["好", "八"],
    });
  });

  it("returns the current level once all related characters are known", () => {
    expect(getHskLevelStatus(["爱", "好", "八", "学"], vocabulary)).toEqual({
      currentLevel: 1,
      nextLevel: 2,
      charactersToNextLevel: 1,
      progressToNextLevel: (1 / 2) * 100,
      missingCharacters: ["习"],
    });
  });

  it("returns the max level when every level is complete", () => {
    const completeVocabulary = [1, 2, 3, 4, 5, 6, 7].map((level) => ({
      character: ["一", "二", "三", "四", "五", "六", "七"][level - 1],
      level,
      frequency: level,
    }));
    const known = completeVocabulary.map((entry) => entry.character);

    expect(getHskLevelStatus(known, completeVocabulary)).toEqual({
      currentLevel: 7,
      nextLevel: null,
      charactersToNextLevel: null,
      progressToNextLevel: 100,
      missingCharacters: [],
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

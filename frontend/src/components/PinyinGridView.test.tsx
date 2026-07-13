import { render, screen } from "@testing-library/react";
import PinyinGridView, {
  chunkCharacters,
  getColumnMinWidthCh,
} from "./PinyinGridView";

describe("PinyinGridView helpers", () => {
  it("uses at least three characters of width for short finals", () => {
    expect(getColumnMinWidthCh("a")).toBe(3);
    expect(getColumnMinWidthCh("iang")).toBe(4);
  });

  it("chunks characters into lines of three", () => {
    expect(chunkCharacters(["爱", "艾", "矮", "碍"])).toEqual(["爱艾矮", "碍"]);
  });
});

describe("PinyinGridView", () => {
  it("places characters in the matching start and final cell", () => {
    render(
      <PinyinGridView
        characters={[
          {
            char: "爱",
            pinyin: "ai4",
            writting_known: true,
            updated_at: "2026-07-12T12:00:00+00:00",
          },
          {
            char: "好",
            pinyin: "hao3",
            writting_known: true,
            updated_at: "2026-07-12T12:00:00+00:00",
          },
        ]}
      />,
    );

    expect(screen.getByRole("columnheader", { name: "ai" })).toBeInTheDocument();
    expect(screen.getByRole("rowheader", { name: "h" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "爱" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "好" })).toBeInTheDocument();
  });

  it("wraps more than three characters onto multiple lines", () => {
    const { container } = render(
      <PinyinGridView
        characters={[
          {
            char: "爱",
            pinyin: "ai4",
            writting_known: true,
            updated_at: "2026-07-12T12:00:00+00:00",
          },
          {
            char: "艾",
            pinyin: "ai4",
            writting_known: true,
            updated_at: "2026-07-12T12:00:00+00:00",
          },
          {
            char: "矮",
            pinyin: "ai4",
            writting_known: true,
            updated_at: "2026-07-12T12:00:00+00:00",
          },
          {
            char: "碍",
            pinyin: "ai4",
            writting_known: true,
            updated_at: "2026-07-12T12:00:00+00:00",
          },
        ]}
      />,
    );

    expect(screen.getByRole("cell", { name: "爱艾矮碍" })).toBeInTheDocument();
    expect(container.querySelectorAll(".pinyin-grid-cell-line")).toHaveLength(2);
  });
});

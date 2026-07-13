import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CharacterWordsModal from "./CharacterWordsModal";

describe("CharacterWordsModal", () => {
  it("renders associated words with definitions when present", () => {
    render(
      <CharacterWordsModal
        isOpen
        character="爱"
        words={[
          {
            word: "爱好",
            definition: "hobby",
            updated_at: "2026-07-12T12:00:00+00:00",
            characters: ["爱", "好"],
          },
          {
            word: "爱",
            definition: null,
            updated_at: "2026-07-12T12:00:00+00:00",
            characters: ["爱"],
          },
        ]}
        onClose={() => undefined}
      />,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Associated words:")).toBeInTheDocument();
    expect(screen.getByText("爱好 (hobby)")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")[1]).toHaveTextContent("爱");
  });

  it("calls onClose when the close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <CharacterWordsModal
        isOpen
        character="爱"
        words={[
          {
            word: "爱好",
            definition: "hobby",
            updated_at: "2026-07-12T12:00:00+00:00",
            characters: ["爱", "好"],
          },
        ]}
        onClose={onClose}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

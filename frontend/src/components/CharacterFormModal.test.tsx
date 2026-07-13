import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CharacterFormModal from "./CharacterFormModal";

describe("CharacterFormModal", () => {
  it("prefills fields in add mode and disables confirm until required fields are filled", async () => {
    const user = userEvent.setup();

    render(
      <CharacterFormModal
        mode="add"
        isOpen
        prefilledChar="爱"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Add character" }),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("爱")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeDisabled();

    await user.type(screen.getByLabelText("pinyin"), "ai");

    expect(screen.getByRole("button", { name: "Confirm" })).toBeEnabled();
  });

  it("submits edited values in edit mode", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <CharacterFormModal
        mode="edit"
        isOpen
        initialCharacter={{
          char: "爱",
          pinyin: "ai",
          writting_known: false,
          updated_at: "2026-07-12T12:00:00+00:00",
        }}
        onConfirm={onConfirm}
        onCancel={() => {}}
      />,
    );

    expect(screen.getByDisplayValue("爱")).toHaveAttribute("readonly");
    await user.clear(screen.getByLabelText("pinyin"));
    await user.type(screen.getByLabelText("pinyin"), "ei");
    await user.click(screen.getByRole("switch"));
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    expect(onConfirm).toHaveBeenCalledWith({
      char: "爱",
      pinyin: "ei",
      writting_known: true,
    });
  });
});

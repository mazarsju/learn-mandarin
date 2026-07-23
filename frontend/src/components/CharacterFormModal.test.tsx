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

  it("keeps confirm disabled for invalid pinyin", async () => {
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

    await user.type(screen.getByLabelText("pinyin"), "invalid");

    expect(screen.getByRole("button", { name: "Confirm" })).toBeDisabled();
    expect(screen.getByText("Enter a valid pinyin.")).toBeInTheDocument();
  });

  it("keeps confirm disabled and shows a warning when character already exists", async () => {
    const user = userEvent.setup();

    render(
      <CharacterFormModal
        mode="add"
        isOpen
        existingCharacters={["爱"]}
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );

    await user.type(screen.getByLabelText("character"), "爱");
    await user.type(screen.getByLabelText("pinyin"), "ai");

    expect(screen.getByRole("button", { name: "Confirm" })).toBeDisabled();
    expect(
      screen.getByText("This character already exists in the database."),
    ).toBeInTheDocument();
  });

  it("keeps confirm disabled and shows a warning for multiple characters", async () => {
    const user = userEvent.setup();

    render(
      <CharacterFormModal
        mode="add"
        isOpen
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );

    await user.type(screen.getByLabelText("character"), "爱");
    await user.type(screen.getByLabelText("pinyin"), "ai");

    expect(screen.getByRole("button", { name: "Confirm" })).toBeEnabled();

    await user.type(screen.getByLabelText("character"), "好");

    expect(screen.getByRole("button", { name: "Confirm" })).toBeDisabled();
    expect(screen.getByText("Enter exactly one Chinese character.")).toBeInTheDocument();
  });

  it("keeps confirm disabled for non-Chinese characters", async () => {
    const user = userEvent.setup();

    render(
      <CharacterFormModal
        mode="add"
        isOpen
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );

    await user.type(screen.getByLabelText("character"), "a");
    await user.type(screen.getByLabelText("pinyin"), "ai");

    expect(screen.getByRole("button", { name: "Confirm" })).toBeDisabled();
    expect(
      screen.getByText("Enter exactly one Chinese character."),
    ).toBeInTheDocument();
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

  it("suggests ü pinyin when u-for-ü would make the value valid", async () => {
    const user = userEvent.setup();

    render(
      <CharacterFormModal
        mode="add"
        isOpen
        prefilledChar="略"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );

    await user.type(screen.getByLabelText("pinyin"), "lue4");

    expect(screen.getByRole("button", { name: "Confirm" })).toBeDisabled();
    expect(screen.getByText("Don't you mean lüe4?")).toBeInTheDocument();
    expect(screen.queryByText("Enter a valid pinyin.")).not.toBeInTheDocument();
  });
});

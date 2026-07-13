import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddWordModal from "./AddWordModal";

describe("AddWordModal", () => {
  it("shows a warning and disables confirm when a character is missing", async () => {
    const user = userEvent.setup();

    render(
      <AddWordModal
        isOpen
        knownCharacters={["爱"]}
        onConfirm={() => {}}
        onCancel={() => {}}
        onAddCharacter={() => {}}
      />,
    );

    await user.type(screen.getByLabelText("words"), "爱好");

    expect(
      screen.getByText(
        '"好" does not exist yet in the database and needs to be added priorly.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeDisabled();
  });

  it("calls onAddCharacter from the warning action", async () => {
    const user = userEvent.setup();
    const onAddCharacter = vi.fn();

    render(
      <AddWordModal
        isOpen
        knownCharacters={["爱"]}
        onConfirm={() => {}}
        onCancel={() => {}}
        onAddCharacter={onAddCharacter}
      />,
    );

    await user.type(screen.getByLabelText("words"), "爱好");
    await user.click(screen.getByRole("button", { name: "Add character 好" }));

    expect(onAddCharacter).toHaveBeenCalledWith("好");
  });

  it("submits the word when all characters exist", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <AddWordModal
        isOpen
        knownCharacters={["爱", "好"]}
        onConfirm={onConfirm}
        onCancel={() => {}}
        onAddCharacter={() => {}}
      />,
    );

    await user.type(screen.getByLabelText("words"), "爱好");
    await user.type(screen.getByLabelText("definition"), "to like");
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    expect(onConfirm).toHaveBeenCalledWith({
      word: "爱好",
      definition: "to like",
    });
  });
});

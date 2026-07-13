import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfirmModal from "./ConfirmModal";

describe("ConfirmModal", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <ConfirmModal
        isOpen={false}
        message="Are you sure?"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("calls onConfirm and onCancel", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <ConfirmModal
        isOpen
        message='Are you sure you want to delete "爱"?'
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    expect(
      screen.getByText('Are you sure you want to delete "爱"?'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledOnce();

    await user.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});

import { render } from "@testing-library/react";
import {
  ChatBubbleIcon,
  EyeIcon,
  HouseIcon,
  NotebookIcon,
  PenIcon,
  SettingsIcon,
} from "./icons";

describe("icons", () => {
  it.each([
    ["HouseIcon", HouseIcon],
    ["NotebookIcon", NotebookIcon],
    ["ChatBubbleIcon", ChatBubbleIcon],
    ["SettingsIcon", SettingsIcon],
    ["PenIcon", PenIcon],
    ["EyeIcon", EyeIcon],
  ])("renders %s as an accessible decorative svg", (_name, Icon) => {
    const { container } = render(<Icon className="navbar-icon" />);

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("navbar-icon");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });
});

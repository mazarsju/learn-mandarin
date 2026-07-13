import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("App", () => {
  it("renders the home page by default and switches tabs", async () => {
    const user = userEvent.setup();

    render(<App />);

    expect(screen.getByRole("heading", { name: "Home" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Chat" }));

    expect(screen.getByRole("heading", { name: "Chat" })).toBeInTheDocument();
  });
});

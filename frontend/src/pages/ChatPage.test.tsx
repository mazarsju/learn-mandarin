import { render, screen } from "@testing-library/react";
import ChatPage from "./ChatPage";

describe("ChatPage", () => {
  it("renders the chat page content", () => {
    render(<ChatPage />);

    expect(screen.getByRole("heading", { name: "Chat" })).toBeInTheDocument();
    expect(
      screen.getByText("Practice conversations in Mandarin here."),
    ).toBeInTheDocument();
  });
});

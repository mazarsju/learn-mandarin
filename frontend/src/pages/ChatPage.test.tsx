import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChatPage from "./ChatPage";

describe("ChatPage", () => {
  it("renders the chat character selection", () => {
    render(<ChatPage />);

    expect(screen.getByRole("heading", { name: "Chat" })).toBeInTheDocument();
    expect(
      screen.getByText("Who do you want to speak with today?"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Teacher Wang/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("(王老师)")).toBeInTheDocument();
    expect(
      screen.getByText("The native Chinese teacher who can also speak English"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Xiao Ming/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("(小明)")).toBeInTheDocument();
    expect(screen.getByText("Your native Chinese friend")).toBeInTheDocument();
  });

  it("opens a chat modal when a character card is selected", async () => {
    const user = userEvent.setup();

    render(<ChatPage />);

    await user.click(screen.getByRole("button", { name: /Teacher Wang/ }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Teacher Wang/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Start a conversation with Teacher Wang."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Message")).toBeInTheDocument();
  });

  it("closes the chat modal", async () => {
    const user = userEvent.setup();

    render(<ChatPage />);

    await user.click(screen.getByRole("button", { name: /Xiao Ming/ }));
    await user.click(screen.getByRole("button", { name: "Close chat" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

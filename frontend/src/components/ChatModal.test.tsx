import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChatModal from "./ChatModal";
import type { ChatCharacter } from "./ChatCharacterCard";

const teacherWang: ChatCharacter = {
  id: "teacher-wang",
  name: "Teacher Wang",
  chineseName: "王老师",
  description: "The native Chinese teacher who can also speak English",
  avatarVariant: "teacher",
};

describe("ChatModal", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo, init?: RequestInit) => {
        const url = String(input);
        const method = init?.method ?? "GET";

        if (url.endsWith("/chat") && method === "POST") {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              message: {
                role: "assistant",
                content: "你好！",
              },
            }),
          });
        }

        return Promise.resolve({
          ok: false,
          json: async () => ({}),
        });
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends a message and displays the assistant reply", async () => {
    const user = userEvent.setup();

    render(<ChatModal character={teacherWang} onClose={() => undefined} />);

    await user.type(screen.getByLabelText("Message"), "Hello");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText("Hello")).toBeInTheDocument();
    expect(await screen.findByText("你好！")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        character_id: "teacher-wang",
        messages: [{ role: "user", content: "Hello" }],
      }),
    });
  });

  it("shows an error when the chat request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          json: async () => ({ error: "LLM_API_KEY must be set" }),
        }),
      ),
    );

    const user = userEvent.setup();

    render(<ChatModal character={teacherWang} onClose={() => undefined} />);

    await user.type(screen.getByLabelText("Message"), "Hello");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(
      await screen.findByText("LLM_API_KEY must be set"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Message")).toHaveValue("Hello");
  });
});

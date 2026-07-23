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

        if (url.endsWith("/chat/history/teacher-wang") && method === "GET") {
          return Promise.resolve({
            ok: true,
            json: async () => ({ messages: [] }),
          });
        }

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

    expect(
      await screen.findByText("Start a conversation with Teacher Wang."),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText("Message"), "Hello");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText("Hello")).toBeInTheDocument();
    expect(await screen.findByText("你好！")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith("/chat/history/teacher-wang", {
      method: "GET",
    });
    expect(fetch).toHaveBeenCalledWith("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        character_id: "teacher-wang",
        messages: [{ role: "user", content: "Hello" }],
      }),
    });
  });

  it("loads and displays saved chat history", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo, init?: RequestInit) => {
        const url = String(input);
        const method = init?.method ?? "GET";

        if (url.endsWith("/chat/history/teacher-wang") && method === "GET") {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              messages: [
                { role: "user", content: "Earlier message" },
                { role: "assistant", content: "Earlier reply" },
              ],
            }),
          });
        }

        return Promise.resolve({
          ok: false,
          json: async () => ({}),
        });
      }),
    );

    render(<ChatModal character={teacherWang} onClose={() => undefined} />);

    expect(await screen.findByText("Earlier message")).toBeInTheDocument();
    expect(screen.getByText("Earlier reply")).toBeInTheDocument();
  });

  it("clears chat history after confirmation", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo, init?: RequestInit) => {
        const url = String(input);
        const method = init?.method ?? "GET";

        if (url.endsWith("/chat/history/teacher-wang") && method === "GET") {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              messages: [
                { role: "user", content: "Earlier message" },
                { role: "assistant", content: "Earlier reply" },
              ],
            }),
          });
        }

        if (url.endsWith("/chat/history/teacher-wang") && method === "DELETE") {
          return Promise.resolve({
            ok: true,
            json: async () => ({ message: "Chat history cleared" }),
          });
        }

        return Promise.resolve({
          ok: false,
          json: async () => ({}),
        });
      }),
    );

    render(<ChatModal character={teacherWang} onClose={() => undefined} />);

    expect(await screen.findByText("Earlier message")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear chat history" }));

    expect(
      screen.getByText(
        "Clear all chat history with Teacher Wang? This cannot be undone.",
      ),
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalledWith("/chat/history/teacher-wang", {
      method: "DELETE",
    });

    await user.click(screen.getByRole("button", { name: "Confirm" }));

    expect(
      await screen.findByText("Start a conversation with Teacher Wang."),
    ).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith("/chat/history/teacher-wang", {
      method: "DELETE",
    });
  });

  it("keeps chat history when clear confirmation is cancelled", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo, init?: RequestInit) => {
        const url = String(input);
        const method = init?.method ?? "GET";

        if (url.endsWith("/chat/history/teacher-wang") && method === "GET") {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              messages: [
                { role: "user", content: "Earlier message" },
                { role: "assistant", content: "Earlier reply" },
              ],
            }),
          });
        }

        return Promise.resolve({
          ok: false,
          json: async () => ({}),
        });
      }),
    );

    render(<ChatModal character={teacherWang} onClose={() => undefined} />);

    expect(await screen.findByText("Earlier message")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear chat history" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByText("Earlier message")).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalledWith("/chat/history/teacher-wang", {
      method: "DELETE",
    });
  });

  it("shows an error when the chat request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo, init?: RequestInit) => {
        const url = String(input);
        const method = init?.method ?? "GET";

        if (url.endsWith("/chat/history/teacher-wang") && method === "GET") {
          return Promise.resolve({
            ok: true,
            json: async () => ({ messages: [] }),
          });
        }

        return Promise.resolve({
          ok: false,
          json: async () => ({ error: "LLM_API_KEY must be set" }),
        });
      }),
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

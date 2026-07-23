import { clearChatHistory, fetchChatHistory, sendChatMessage } from "./chatApi";

describe("chatApi", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads chat history", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({
            messages: [{ role: "user", content: "Hello" }],
          }),
        }),
      ),
    );

    await expect(fetchChatHistory("teacher-wang")).resolves.toEqual([
      { role: "user", content: "Hello" },
    ]);
  });

  it("sends a chat message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({
            message: { role: "assistant", content: "你好" },
          }),
        }),
      ),
    );

    await expect(
      sendChatMessage("teacher-wang", [{ role: "user", content: "Hello" }]),
    ).resolves.toEqual({ role: "assistant", content: "你好" });
  });

  it("clears chat history", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({ message: "Chat history cleared" }),
        }),
      ),
    );

    await expect(clearChatHistory("teacher-wang")).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledWith("/chat/history/teacher-wang", {
      method: "DELETE",
    });
  });
});

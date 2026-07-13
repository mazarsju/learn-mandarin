import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import KnowledgeBasePage from "./KnowledgeBasePage";

const characters = [
  {
    char: "爱",
    pinyin: "ai",
    writting_known: true,
    updated_at: "2026-07-12T12:00:00+00:00",
  },
];

const words = [
  {
    word: "爱好",
    definition: "hobby",
    updated_at: "2026-07-12T12:00:00+00:00",
  },
];

describe("KnowledgeBasePage", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo) => {
        const url = String(input);

        if (url.endsWith("/characters")) {
          return Promise.resolve({
            ok: true,
            json: async () => characters,
          });
        }

        if (url.endsWith("/words")) {
          return Promise.resolve({
            ok: true,
            json: async () => words,
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

  it("loads and displays characters and words", async () => {
    render(<KnowledgeBasePage />);

    expect(screen.getByText("Loading knowledge base...")).toBeInTheDocument();

    expect(await screen.findByRole("cell", { name: "爱" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "ai" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "爱好" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "hobby" })).toBeInTheDocument();
  });

  it("filters characters by search query", async () => {
    const user = userEvent.setup();

    render(<KnowledgeBasePage />);
    await screen.findByRole("cell", { name: "爱" });

    await user.type(screen.getByPlaceholderText("Search characters..."), "zz");

    await waitFor(() => {
      expect(screen.queryByRole("cell", { name: "爱" })).not.toBeInTheDocument();
    });
    expect(
      screen.getByText("No characters match your search."),
    ).toBeInTheDocument();
  });

  it("filters words by search query", async () => {
    const user = userEvent.setup();

    render(<KnowledgeBasePage />);
    await screen.findByRole("cell", { name: "爱好" });

    await user.type(screen.getByPlaceholderText("Search words..."), "zz");

    await waitFor(() => {
      expect(
        screen.queryByRole("cell", { name: "爱好" }),
      ).not.toBeInTheDocument();
    });
    expect(screen.getByText("No words match your search.")).toBeInTheDocument();
  });
});

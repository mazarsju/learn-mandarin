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

describe("KnowledgeBasePage", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => characters,
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads and displays characters", async () => {
    render(<KnowledgeBasePage />);

    expect(screen.getByText("Loading characters...")).toBeInTheDocument();

    expect(await screen.findByRole("cell", { name: "爱" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "ai" })).toBeInTheDocument();
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
});

import { render, screen, waitFor } from "@testing-library/react";
import HomePage from "./HomePage";

const characters = [
  {
    char: "爱",
    pinyin: "ai4",
    writting_known: true,
    updated_at: "2026-07-12T12:00:00+00:00",
  },
  {
    char: "好",
    pinyin: "hao3",
    writting_known: false,
    updated_at: "2026-07-12T12:00:00+00:00",
  },
];

describe("HomePage", () => {
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

  it("renders character metrics and motivation messages", async () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByText("Loading your progress...")).toBeInTheDocument();

    expect(await screen.findByText("2")).toBeInTheDocument();
    expect(screen.getByText("Characters you are able to recognize")).toBeInTheDocument();
    expect(screen.getByText("Characters you can write")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(
      screen.getByText("298 more to go to reach a general HSK 1 level"),
    ).toBeInTheDocument();
  });

  it("shows an error when characters fail to load", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          json: async () => ({}),
        }),
      ),
    );

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load characters.")).toBeInTheDocument();
    });
  });
});

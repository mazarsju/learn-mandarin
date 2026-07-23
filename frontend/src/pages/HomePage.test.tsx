import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

const hskCharacters = [
  { character: "爱", level: 1, frequency: 10 },
  { character: "好", level: 1, frequency: 20 },
  { character: "八", level: 1, frequency: 30 },
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

        if (url.endsWith("/hsk-characters")) {
          return Promise.resolve({
            ok: true,
            json: async () => hskCharacters,
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

  it("renders character metrics and HSK level", async () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByText("Loading your progress...")).toBeInTheDocument();

    expect(await screen.findByText("Your HSK journey starts here")).toBeInTheDocument();
    expect(
      screen.getByText("Based on 2 characters you are able to recognize"),
    ).toBeInTheDocument();
    expect(screen.getByText("1 character to reach HSK 1")).toBeInTheDocument();
    expect(screen.getByLabelText("HSK level")).toBeInTheDocument();
    expect(screen.getByText("Characters you are able to recognize")).toBeInTheDocument();
    expect(screen.getByText("Characters you can write")).toBeInTheDocument();
  });

  it("opens the missing characters list from the banner", async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    await screen.findByText("Your HSK journey starts here");
    await user.click(screen.getByRole("button", { name: "Missing characters" }));

    expect(
      screen.getByRole("heading", { name: "Missing characters for HSK 1" }),
    ).toBeInTheDocument();
    expect(screen.getByText("八")).toBeInTheDocument();
  });

  it("shows an error when progress fails to load", async () => {
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
      expect(screen.getByText(/Failed to load/)).toBeInTheDocument();
    });
  });
});

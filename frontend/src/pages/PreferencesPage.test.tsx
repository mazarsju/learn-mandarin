import { render, screen } from "@testing-library/react";
import PreferencesPage from "./PreferencesPage";

describe("PreferencesPage", () => {
  it("renders the preferences page content", () => {
    render(<PreferencesPage />);

    expect(
      screen.getByRole("heading", { name: "Preferences" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Adjust your learning settings here."),
    ).toBeInTheDocument();
  });
});

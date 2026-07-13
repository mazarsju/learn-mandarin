import { render, screen } from "@testing-library/react";
import Table from "./Table";

type Row = {
  id: string;
  name: string;
};

const columns = [{ key: "name" as const, header: "name" }];

describe("Table", () => {
  it("renders rows and column headers", () => {
    render(
      <Table<Row>
        columns={columns}
        rows={[{ id: "1", name: "Alice" }]}
        getRowKey={(row) => row.id}
      />,
    );

    expect(screen.getByRole("columnheader", { name: "name" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Alice" })).toBeInTheDocument();
  });

  it("renders the empty message when there are no rows", () => {
    render(
      <Table<Row>
        columns={columns}
        rows={[]}
        getRowKey={(row) => row.id}
        emptyMessage="No characters in the database yet."
      />,
    );

    expect(
      screen.getByText("No characters in the database yet."),
    ).toBeInTheDocument();
  });

  it("renders row actions when provided", () => {
    render(
      <Table<Row>
        columns={columns}
        rows={[{ id: "1", name: "Alice" }]}
        getRowKey={(row) => row.id}
        renderRowActions={() => <button>Edit</button>}
      />,
    );

    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });
});

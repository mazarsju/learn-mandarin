import { useEffect, useState } from "react";
import Page from "../components/Page";
import Table, { type TableColumn } from "../components/Table";
import type { Character } from "../types/character";

const CHARACTER_COLUMNS: TableColumn<Character>[] = [
  { key: "char", header: "char" },
  { key: "pinyin", header: "pinyin" },
  {
    key: "writting_known",
    header: "writting_known",
    render: (row) => String(row.writting_known),
  },
  { key: "updated_at", header: "updated_at" },
];

export default function KnowledgeBasePage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCharacters() {
      try {
        const response = await fetch("/characters", { method: "GET" });

        if (!response.ok) {
          throw new Error("Failed to load characters (1).");
        }

        const data = (await response.json()) as Character[];
        setCharacters(data);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load characters (2).",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadCharacters();
  }, []);

  return (
    <Page title="Knowledge base">
      {isLoading && <p>Loading characters...</p>}
      {error && <p className="table-error">{error}</p>}
      {!isLoading && !error && (
        <Table
          columns={CHARACTER_COLUMNS}
          rows={characters}
          getRowKey={(row) => row.char}
          emptyMessage="No characters in the database yet."
        />
      )}
    </Page>
  );
}

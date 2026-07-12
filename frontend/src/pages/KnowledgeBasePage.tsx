import { useCallback, useEffect, useMemo, useState } from "react";
import CharacterFormModal, {
  type CharacterFormValues,
} from "../components/CharacterFormModal";
import ConfirmModal from "../components/ConfirmModal";
import Page from "../components/Page";
import Table, { type TableColumn } from "../components/Table";
import type { Character } from "../types/character";
import { formatDateTime } from "../utils/formatDateTime";

const CHARACTER_COLUMNS: TableColumn<Character>[] = [
  { key: "char", header: "char" },
  { key: "pinyin", header: "pinyin" },
  {
    key: "writting_known",
    header: "writting_known",
    render: (row) => String(row.writting_known),
  },
  {
    key: "updated_at",
    header: "updated_at",
    render: (row) => formatDateTime(row.updated_at),
  },
];

function filterCharacters(characters: Character[], searchQuery: string) {
  const query = searchQuery.trim().toLowerCase();
  if (!query) {
    return characters;
  }

  return characters.filter(
    (character) =>
      character.char.toLowerCase().includes(query) ||
      character.pinyin.toLowerCase().includes(query),
  );
}

async function fetchCharacters() {
  const response = await fetch("/characters", { method: "GET" });

  if (!response.ok) {
    throw new Error("Failed to load characters.");
  }

  return (await response.json()) as Character[];
}

export default function KnowledgeBasePage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [characterToDelete, setCharacterToDelete] = useState<Character | null>(
    null,
  );
  const [characterToEdit, setCharacterToEdit] = useState<Character | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filteredCharacters = useMemo(
    () => filterCharacters(characters, searchQuery),
    [characters, searchQuery],
  );

  const loadCharacters = useCallback(async () => {
    setError(null);

    try {
      const data = await fetchCharacters();
      setCharacters(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load characters.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCharacters();
  }, [loadCharacters]);

  async function confirmDelete() {
    if (characterToDelete === null) {
      return;
    }

    const character = characterToDelete;
    setCharacterToDelete(null);

    try {
      const response = await fetch(
        `/characters/${encodeURIComponent(character.char)}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        throw new Error("Failed to delete character.");
      }

      setCharacters((currentCharacters) =>
        currentCharacters.filter((item) => item.char !== character.char),
      );
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete character.",
      );
    }
  }

  async function confirmEdit(values: CharacterFormValues) {
    if (characterToEdit === null) {
      return;
    }

    const character = characterToEdit;
    setCharacterToEdit(null);

    try {
      const response = await fetch(
        `/characters/${encodeURIComponent(character.char)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pinyin: values.pinyin,
            writting_known: values.writting_known,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update character.");
      }

      const updatedCharacter = (await response.json()) as Character;
      setCharacters((currentCharacters) =>
        currentCharacters.map((item) =>
          item.char === updatedCharacter.char ? updatedCharacter : item,
        ),
      );
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Failed to update character.",
      );
    }
  }

  async function confirmAdd(values: CharacterFormValues) {
    setIsAddModalOpen(false);

    try {
      const response = await fetch("/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to add character.");
      }

      await loadCharacters();
    } catch (addError) {
      setError(
        addError instanceof Error ? addError.message : "Failed to add character.",
      );
    }
  }

  return (
    <Page
      title="Knowledge base"
      headerAction={
        <button
          type="button"
          className="page-add-button"
          onClick={() => setIsAddModalOpen(true)}
        >
          Add character
        </button>
      }
    >
      <CharacterFormModal
        mode="add"
        isOpen={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        onConfirm={(values) => void confirmAdd(values)}
      />
      <CharacterFormModal
        mode="edit"
        isOpen={characterToEdit !== null}
        initialCharacter={characterToEdit}
        onCancel={() => setCharacterToEdit(null)}
        onConfirm={(values) => void confirmEdit(values)}
      />
      <ConfirmModal
        isOpen={characterToDelete !== null}
        message={
          characterToDelete
            ? `Are you sure you want to delete "${characterToDelete.char}"?`
            : ""
        }
        onCancel={() => setCharacterToDelete(null)}
        onConfirm={() => void confirmDelete()}
      />
      {isLoading && <p>Loading characters...</p>}
      {error && <p className="table-error">{error}</p>}
      {!isLoading && !error && (
        <>
          <label className="search-bar">
            <span className="search-bar-label">Search</span>
            <input
              type="search"
              value={searchQuery}
              placeholder="Search characters..."
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </label>
          <Table
            columns={CHARACTER_COLUMNS}
            rows={filteredCharacters}
            getRowKey={(row) => row.char}
            emptyMessage={
              characters.length === 0
                ? "No characters in the database yet."
                : "No characters match your search."
            }
            renderRowActions={(row) => (
              <div className="table-row-actions">
                <button
                  type="button"
                  className="table-edit-button"
                  onClick={() => setCharacterToEdit(row)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="table-delete-button"
                  onClick={() => setCharacterToDelete(row)}
                >
                  Delete
                </button>
              </div>
            )}
          />
        </>
      )}
    </Page>
  );
}

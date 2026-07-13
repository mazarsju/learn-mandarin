import { useCallback, useEffect, useMemo, useState } from "react";
import AddWordModal, { type WordFormValues } from "../components/AddWordModal";
import CharacterFormModal, {
  type CharacterFormValues,
} from "../components/CharacterFormModal";
import ConfirmModal from "../components/ConfirmModal";
import Page from "../components/Page";
import Table, { type TableColumn } from "../components/Table";
import type { Character } from "../types/character";
import type { Word } from "../types/word";
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

const WORD_COLUMNS: TableColumn<Word>[] = [
  { key: "word", header: "words" },
  {
    key: "definition",
    header: "definition",
    render: (row) => row.definition ?? "",
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

function filterWords(words: Word[], searchQuery: string) {
  const query = searchQuery.trim().toLowerCase();
  if (!query) {
    return words;
  }

  return words.filter(
    (word) =>
      word.word.toLowerCase().includes(query) ||
      (word.definition ?? "").toLowerCase().includes(query),
  );
}

async function fetchCharacters() {
  const response = await fetch("/characters", { method: "GET" });

  if (!response.ok) {
    throw new Error("Failed to load characters.");
  }

  return (await response.json()) as Character[];
}

async function fetchWords() {
  const response = await fetch("/words", { method: "GET" });

  if (!response.ok) {
    throw new Error("Failed to load words.");
  }

  return (await response.json()) as Word[];
}

export default function KnowledgeBasePage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [characterSearchQuery, setCharacterSearchQuery] = useState("");
  const [wordSearchQuery, setWordSearchQuery] = useState("");
  const [characterToDelete, setCharacterToDelete] = useState<Character | null>(
    null,
  );
  const [characterToEdit, setCharacterToEdit] = useState<Character | null>(null);
  const [wordToDelete, setWordToDelete] = useState<Word | null>(null);
  const [wordToEdit, setWordToEdit] = useState<Word | null>(null);
  const [isAddCharacterModalOpen, setIsAddCharacterModalOpen] = useState(false);
  const [isAddWordModalOpen, setIsAddWordModalOpen] = useState(false);
  const [prefilledCharForAdd, setPrefilledCharForAdd] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const knownCharacters = useMemo(
    () => characters.map((character) => character.char),
    [characters],
  );

  const filteredCharacters = useMemo(
    () => filterCharacters(characters, characterSearchQuery),
    [characters, characterSearchQuery],
  );

  const filteredWords = useMemo(
    () => filterWords(words, wordSearchQuery),
    [words, wordSearchQuery],
  );

  const loadKnowledgeBase = useCallback(async () => {
    setError(null);

    try {
      const [charactersData, wordsData] = await Promise.all([
        fetchCharacters(),
        fetchWords(),
      ]);
      setCharacters(charactersData);
      setWords(wordsData);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load knowledge base.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadKnowledgeBase();
  }, [loadKnowledgeBase]);

  const openAddCharacterModal = useCallback((prefilledChar = "") => {
    setPrefilledCharForAdd(prefilledChar);
    setIsAddCharacterModalOpen(true);
  }, []);

  const closeAddCharacterModal = useCallback(() => {
    setIsAddCharacterModalOpen(false);
    setPrefilledCharForAdd("");
  }, []);

  async function confirmDeleteCharacter() {
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

  async function confirmDeleteWord() {
    if (wordToDelete === null) {
      return;
    }

    const word = wordToDelete;
    setWordToDelete(null);

    try {
      const response = await fetch(
        `/words/${encodeURIComponent(word.word)}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        throw new Error("Failed to delete word.");
      }

      setWords((currentWords) =>
        currentWords.filter((item) => item.word !== word.word),
      );
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete word.",
      );
    }
  }

  async function confirmEditCharacter(values: CharacterFormValues) {
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

  async function confirmEditWord(values: WordFormValues) {
    if (wordToEdit === null) {
      return;
    }

    const word = wordToEdit;
    setWordToEdit(null);

    try {
      const response = await fetch(
        `/words/${encodeURIComponent(word.word)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            definition: values.definition,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update word.");
      }

      const updatedWord = (await response.json()) as Word;
      setWords((currentWords) =>
        currentWords.map((item) =>
          item.word === updatedWord.word ? updatedWord : item,
        ),
      );
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Failed to update word.",
      );
    }
  }

  async function confirmAddCharacter(values: CharacterFormValues) {
    closeAddCharacterModal();

    try {
      const response = await fetch("/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to add character.");
      }

      await loadKnowledgeBase();
    } catch (addError) {
      setError(
        addError instanceof Error ? addError.message : "Failed to add character.",
      );
    }
  }

  async function confirmAddWord(values: WordFormValues) {
    setIsAddWordModalOpen(false);

    try {
      const response = await fetch("/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: values.word,
          definition: values.definition || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add word.");
      }

      const createdWord = (await response.json()) as Word;
      setWords((currentWords) =>
        [...currentWords, createdWord].sort((left, right) =>
          left.word.localeCompare(right.word),
        ),
      );
    } catch (addWordError) {
      setError(
        addWordError instanceof Error
          ? addWordError.message
          : "Failed to add word.",
      );
    }
  }

  return (
    <Page title="Knowledge base">
      <AddWordModal
        mode="add"
        isOpen={isAddWordModalOpen}
        knownCharacters={knownCharacters}
        onCancel={() => setIsAddWordModalOpen(false)}
        onConfirm={(values) => void confirmAddWord(values)}
        onAddCharacter={openAddCharacterModal}
      />
      <AddWordModal
        mode="edit"
        isOpen={wordToEdit !== null}
        initialWord={wordToEdit}
        knownCharacters={knownCharacters}
        onCancel={() => setWordToEdit(null)}
        onConfirm={(values) => void confirmEditWord(values)}
        onAddCharacter={openAddCharacterModal}
      />
      <CharacterFormModal
        mode="add"
        isOpen={isAddCharacterModalOpen}
        prefilledChar={prefilledCharForAdd}
        onCancel={closeAddCharacterModal}
        onConfirm={(values) => void confirmAddCharacter(values)}
      />
      <CharacterFormModal
        mode="edit"
        isOpen={characterToEdit !== null}
        initialCharacter={characterToEdit}
        onCancel={() => setCharacterToEdit(null)}
        onConfirm={(values) => void confirmEditCharacter(values)}
      />
      <ConfirmModal
        isOpen={characterToDelete !== null}
        message={
          characterToDelete
            ? `Are you sure you want to delete "${characterToDelete.char}"?`
            : ""
        }
        onCancel={() => setCharacterToDelete(null)}
        onConfirm={() => void confirmDeleteCharacter()}
      />
      <ConfirmModal
        isOpen={wordToDelete !== null}
        message={
          wordToDelete
            ? `Are you sure you want to delete "${wordToDelete.word}"?`
            : ""
        }
        onCancel={() => setWordToDelete(null)}
        onConfirm={() => void confirmDeleteWord()}
      />
      {isLoading && <p>Loading knowledge base...</p>}
      {error && <p className="table-error">{error}</p>}
      {!isLoading && !error && (
        <>
          <section className="knowledge-base-section">
            <div className="knowledge-base-section-header">
              <h2 className="knowledge-base-section-title">Characters</h2>
              <button
                type="button"
                className="page-add-button"
                onClick={() => openAddCharacterModal()}
              >
                Add character
              </button>
            </div>
            <label className="search-bar">
              <span className="search-bar-label">Search</span>
              <input
                type="search"
                value={characterSearchQuery}
                placeholder="Search characters..."
                onChange={(event) => setCharacterSearchQuery(event.target.value)}
              />
            </label>
            <Table
              columns={CHARACTER_COLUMNS}
              rows={filteredCharacters}
              compact
              maxVisibleRows={5}
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
          </section>
          <section className="knowledge-base-section">
            <div className="knowledge-base-section-header">
              <h2 className="knowledge-base-section-title">Words</h2>
              <button
                type="button"
                className="page-add-button"
                onClick={() => setIsAddWordModalOpen(true)}
              >
                Add word
              </button>
            </div>
            <label className="search-bar">
              <span className="search-bar-label">Search</span>
              <input
                type="search"
                value={wordSearchQuery}
                placeholder="Search words..."
                onChange={(event) => setWordSearchQuery(event.target.value)}
              />
            </label>
            <Table
              columns={WORD_COLUMNS}
              rows={filteredWords}
              compact
              maxVisibleRows={5}
              getRowKey={(row) => row.word}
              emptyMessage={
                words.length === 0
                  ? "No words in the database yet."
                  : "No words match your search."
              }
              renderRowActions={(row) => (
                <div className="table-row-actions">
                  <button
                    type="button"
                    className="table-edit-button"
                    onClick={() => setWordToEdit(row)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="table-delete-button"
                    onClick={() => setWordToDelete(row)}
                  >
                    Delete
                  </button>
                </div>
              )}
            />
          </section>
        </>
      )}
    </Page>
  );
}
